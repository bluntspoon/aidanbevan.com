// Car-dex API: take a photo, ask the vision model what it is, add a rand price band.
import { looksLikeNoVehicle, topLabel, type ClassifierLabel } from './classifier';
import { estimateValue, type PriceRange } from './pricing';
import { parseIdentification, VISION_PROMPT, type Identification } from './vision';

export interface Env {
  AI: Ai;
  ALLOWED_ORIGINS?: string;
  VISION_MODEL?: string;
}

const DEFAULT_ORIGINS = [
  'https://aidanbevan.com',
  'https://www.aidanbevan.com',
  'http://localhost:4000',
  'http://127.0.0.1:4000',
];

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_BASE64_CHARS = Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 1024;

function allowedOrigins(env: Env): string[] {
  const extra = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return [...DEFAULT_ORIGINS, ...extra];
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') ?? '';
  const allowed = allowedOrigins(env);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  headers['Access-Control-Allow-Origin'] = allowed.includes(origin) ? origin : allowed[0];
  return headers;
}

function json(body: unknown, status: number, request: Request, env: Env): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(request, env) },
  });
}

function fail(request: Request, env: Env, status: number, message: string, code: string): Response {
  return json({ ok: false, error: { code, message } }, status, request, env);
}

/** Only jpeg/png/webp data URLs; anything else is a client bug, not a car. */
function decodeImage(input: unknown): Uint8Array | string {
  if (typeof input !== 'string' || !input.trim()) return 'Send the photo as a base64 data URL in "image".';
  if (input.length > MAX_BASE64_CHARS) return 'That photo is bigger than 6MB — try again, or lower the camera resolution.';
  const comma = input.indexOf(',');
  const meta = comma === -1 ? '' : input.slice(0, comma);
  const base64 = comma === -1 ? input : input.slice(comma + 1);
  if (meta && !/^data:image\/(jpeg|jpg|png|webp);base64$/i.test(meta)) {
    return 'Photos must be jpeg, png or webp.';
  }
  try {
    const binary = atob(base64.replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    if (bytes.length < 1024) return 'That photo looks empty — try taking it again.';
    if (bytes.length > MAX_IMAGE_BYTES) return 'That photo is bigger than 6MB — try again, or lower the camera resolution.';
    return bytes;
  } catch {
    return 'That photo did not arrive properly. Please try again.';
  }
}

/** Cheap per-isolate limiter: ten photos a minute stops a stuck retry loop burning the AI quota. */
const hits = new Map<string, number[]>();
function rateLimited(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > limit;
}

/** The ImageNet classifier, used only to veto "that is not a car at all". */
async function classify(image: Uint8Array, env: Env): Promise<ClassifierLabel[]> {
  try {
    const result = (await env.AI.run('@cf/microsoft/resnet-50' as never, { image: Array.from(image) } as never)) as
      | ClassifierLabel[]
      | { result?: ClassifierLabel[] };
    if (Array.isArray(result)) return result;
    return Array.isArray(result?.result) ? result.result : [];
  } catch {
    // A missing second opinion must never block a real photo.
    return [];
  }
}

async function identify(image: Uint8Array, env: Env): Promise<Identification> {
  const model = env.VISION_MODEL ?? '@cf/llava-hf/llava-1.5-7b-hf';
  const result = (await env.AI.run(model, {
    image: Array.from(image),
    prompt: VISION_PROMPT,
    max_tokens: 300,
  })) as { description?: string; response?: string };

  return parseIdentification(result.description ?? result.response ?? '');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (url.pathname === '/api/health') {
      return json({ ok: true, service: 'cardex', model: env.VISION_MODEL ?? '@cf/llava-hf/llava-1.5-7b-hf' }, 200, request, env);
    }

    // Re-price a car after the user corrected the make, model or year.
    if (url.pathname === '/api/value' && request.method === 'POST') {
      let body: Record<string, unknown>;
      try {
        body = (await request.json()) as Record<string, unknown>;
      } catch {
        return fail(request, env, 400, 'Send JSON like {"make":"Toyota","model":"Hilux","year":2018}.', 'bad_json');
      }
      const value = estimateValue({
        make: typeof body.make === 'string' ? body.make : null,
        model: typeof body.model === 'string' ? body.model : null,
        year: typeof body.year === 'number' ? body.year : Number.parseInt(String(body.year ?? ''), 10) || null,
        body_type: typeof body.body_type === 'string' ? body.body_type : null,
        confidence: typeof body.confidence === 'number' ? body.confidence : null,
      });
      return json({ ok: true, value }, 200, request, env);
    }

    if (url.pathname !== '/api/identify') {
      return fail(request, env, 404, 'Nothing here. Try POST /api/identify.', 'not_found');
    }
    if (request.method !== 'POST') {
      return fail(request, env, 405, 'Use POST with a JSON body containing "image".', 'method_not_allowed');
    }

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
    if (rateLimited(ip)) {
      return fail(request, env, 429, 'Easy there — give it a minute before the next photo.', 'rate_limited');
    }

    let body: { image?: unknown };
    try {
      body = (await request.json()) as { image?: unknown };
    } catch {
      return fail(request, env, 400, 'Send JSON like {"image":"data:image/jpeg;base64,..."}.', 'bad_json');
    }

    const decoded = decodeImage(body.image);
    if (typeof decoded === 'string') {
      const status = decoded.includes('6MB') ? 413 : 400;
      return fail(request, env, status, decoded, status === 413 ? 'too_large' : 'bad_image');
    }

    let car: Identification;
    let labels: ClassifierLabel[] = [];
    try {
      // Both models in parallel: the classifier is fast, the vision model is the slow one.
      [car, labels] = await Promise.all([identify(decoded, env), classify(decoded, env)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Model Agreement/i.test(message)) {
        return fail(
          request,
          env,
          502,
          'The vision model needs its licence accepted once in the Cloudflare dashboard (Workers AI → the model → agree).',
          'model_agreement',
        );
      }
      return fail(request, env, 502, 'The car-spotting robot is napping. Try again in a moment.', 'model_error');
    }

    if (!car.is_car || looksLikeNoVehicle(labels)) {
      const what = topLabel(labels)?.label.toLowerCase();
      const message = what && looksLikeNoVehicle(labels)
        ? `That looks like ${/^[aeiou]/.test(what) ? 'an' : 'a'} ${what}, not a car. Try a photo of the whole car.`
        : 'I could not see a car in that photo. Stand back a little and try again.';
      return json({ ok: true, car: { ...car, is_car: false }, value: null, message }, 200, request, env);
    }

    const value: PriceRange = estimateValue({
      make: car.make,
      model: car.model,
      year: car.year,
      body_type: car.body_type,
      confidence: car.confidence,
    });

    return json({ ok: true, car, value, message: null }, 200, request, env);
  },
};

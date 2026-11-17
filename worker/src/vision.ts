// Prompt and output handling for the vision model.
// Small vision models answer with chatty, slightly broken JSON, so parsing here is
// deliberately forgiving: strip fences and prose, repair common escapes, then validate
// every field instead of trusting the model.

import { normaliseBody, CURRENT_YEAR, type BodyType } from './pricing';

export interface Identification {
  is_car: boolean;
  make: string | null;
  model: string | null;
  year: number | null;
  body_type: BodyType;
  colour: string | null;
  confidence: number | null;
  notes: string | null;
}

// No example values in this prompt on purpose: a small vision model copies an example
// answer verbatim and reports the same car for every photo.
export const VISION_PROMPT = [
  'Look at the photo and identify the car.',
  'Answer with JSON only, no prose, with exactly these keys:',
  'is_car (true or false), make (the manufacturer), model (the model badge on the car),',
  'year (a four digit number, your best guess), body_type (one of hatch, sedan, suv, bakkie, mpv, coupe),',
  'colour, confidence (0 to 1), notes (under fifteen words).',
  'Read the badges and lettering on the car when you can see them.',
  'If the photo is not a car, answer is_car false and leave the rest empty.',
  'If several cars are visible, describe the one closest to the camera.',
  'Describe only what you can actually see: never copy an example, never invent a model.',
].join(' ');

/** The model sometimes escapes underscores (`is\_car`); undo that and common JSON slips. */
export function repairJsonText(text: string): string {
  return text
    .replace(/\\_/g, '_')
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1');
}

/** Pull the first balanced {...} block out of whatever the model said. */
export function extractJsonObject(text: string): string | null {
  if (!text) return null;
  const cleaned = repairJsonText(text);
  const start = cleaned.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return cleaned.slice(start, i + 1);
    }
  }
  return null;
}

function text(value: unknown, max = 40): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (!trimmed || /^(unknown|n\/a|none|null|undefined|-)$/i.test(trimmed)) return null;
  return trimmed.slice(0, max);
}

function parseInt10(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value === 'string') {
    const match = value.match(/(19|20)\d{2}/);
    if (match) return Number(match[0]);
  }
  return null;
}

function parseConfidence(value: unknown): number | null {
  const n = typeof value === 'string' ? Number.parseFloat(value) : typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(n)) return null;
  // Some models answer on a 0-100 scale, some on 1-10, and a flat 0 means "no idea".
  let scaled = n;
  if (n > 10) scaled = n / 100;
  else if (n > 1) scaled = n / 10;
  if (scaled <= 0) return null;
  return Math.min(1, scaled);
}

function parseIsCar(value: unknown, make: string | null, model: string | null): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (/^(no|false|nope)$/i.test(value.trim())) return false;
    if (/^(yes|true|yep)$/i.test(value.trim())) return true;
  }
  // Nobody wrote a flag: trust the fields instead.
  return Boolean(make || model);
}

/** Turn the model's raw answer into something the app can rely on. */
export function parseIdentification(raw: unknown): Identification {
  const empty: Identification = {
    is_car: false,
    make: null,
    model: null,
    year: null,
    body_type: 'unknown',
    colour: null,
    confidence: null,
    notes: null,
  };
  if (typeof raw !== 'string' || !raw.trim()) return empty;

  const json = extractJsonObject(raw);
  if (!json) return empty;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch {
    return empty;
  }

  const make = text(parsed.make);
  const model = text(parsed.model);
  const year = parseInt10(parsed.year);
  const clampedYear = year && year >= 1950 ? Math.min(CURRENT_YEAR + 1, year) : null;

  return {
    is_car: parseIsCar(parsed.is_car ?? parsed.isCar, make, model),
    make,
    model,
    year: clampedYear,
    body_type: normaliseBody(typeof parsed.body_type === 'string' ? parsed.body_type : (parsed.bodyType as string | undefined)),
    colour: text(parsed.colour ?? parsed.color),
    confidence: parseConfidence(parsed.confidence),
    notes: text(parsed.notes, 120),
  };
}

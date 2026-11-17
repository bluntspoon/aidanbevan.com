// Rough South African used-car guide prices.
// Deliberately simple and transparent: a new-price table, one depreciation curve,
// a band that widens when we are less sure. Fun, not a valuation.

export type BodyType = 'hatch' | 'sedan' | 'suv' | 'bakkie' | 'coupe' | 'mpv' | 'luxury' | 'unknown';

export interface PriceInput {
  make?: string | null;
  model?: string | null;
  year?: number | null;
  body_type?: string | null;
  confidence?: number | null;
}

export interface PriceRange {
  low: number;
  high: number;
  mid: number;
  currency: 'ZAR';
  basis: 'matched model' | 'segment estimate';
  year: number;
  body: BodyType;
  matched: string | null;
}

interface Row {
  make: string;
  model: string;
  body: BodyType;
  /** Typical price of the equivalent car new, in rand, today. */
  newZar: number;
  /** Years this name plate was sold in South Africa (rough). */
  from?: number;
  to?: number;
}

/** Prices run from "cheap runabout" to "family SUV"; all ballpark 2026 rand. */
const MODELS: Row[] = [
  // Toyota
  { make: 'toyota', model: 'hilux', body: 'bakkie', newZar: 520000, from: 1970 },
  { make: 'toyota', model: 'corolla', body: 'sedan', newZar: 430000 },
  { make: 'toyota', model: 'corolla cross', body: 'suv', newZar: 480000, from: 2021 },
  { make: 'toyota', model: 'corolla quest', body: 'sedan', newZar: 350000 },
  { make: 'toyota', model: 'fortuner', body: 'suv', newZar: 800000 },
  { make: 'toyota', model: 'starlet', body: 'hatch', newZar: 280000 },
  { make: 'toyota', model: 'vitz', body: 'hatch', newZar: 270000 },
  { make: 'toyota', model: 'rav4', body: 'suv', newZar: 720000 },
  { make: 'toyota', model: 'land cruiser', body: 'luxury', newZar: 1500000 },
  { make: 'toyota', model: 'quantum', body: 'mpv', newZar: 850000 },
  { make: 'toyota', model: 'yaris', body: 'hatch', newZar: 400000 },
  // Volkswagen
  { make: 'volkswagen', model: 'polo', body: 'hatch', newZar: 340000 },
  { make: 'volkswagen', model: 'polo vivo', body: 'hatch', newZar: 230000 },
  { make: 'volkswagen', model: 'golf', body: 'hatch', newZar: 500000 },
  { make: 'volkswagen', model: 'tiguan', body: 'suv', newZar: 740000 },
  { make: 'volkswagen', model: 't-cross', body: 'suv', newZar: 470000 },
  { make: 'volkswagen', model: 'amarok', body: 'bakkie', newZar: 850000 },
  { make: 'volkswagen', model: 'caddy', body: 'mpv', newZar: 480000 },
  // Ford
  { make: 'ford', model: 'ranger', body: 'bakkie', newZar: 640000 },
  { make: 'ford', model: 'ecosport', body: 'suv', newZar: 380000, to: 2022 },
  { make: 'ford', model: 'figo', body: 'hatch', newZar: 220000, to: 2021 },
  { make: 'ford', model: 'everest', body: 'suv', newZar: 950000 },
  // Hyundai / Kia
  { make: 'hyundai', model: 'i10', body: 'hatch', newZar: 250000 },
  { make: 'hyundai', model: 'i20', body: 'hatch', newZar: 310000 },
  { make: 'hyundai', model: 'venue', body: 'suv', newZar: 430000 },
  { make: 'hyundai', model: 'tucson', body: 'suv', newZar: 740000 },
  { make: 'hyundai', model: 'creta', body: 'suv', newZar: 520000 },
  { make: 'kia', model: 'picanto', body: 'hatch', newZar: 250000 },
  { make: 'kia', model: 'sonet', body: 'suv', newZar: 400000 },
  { make: 'kia', model: 'sportage', body: 'suv', newZar: 740000 },
  { make: 'kia', model: 'seltos', body: 'suv', newZar: 560000 },
  // Suzuki / Renault / Nissan / Mazda / Isuzu
  { make: 'suzuki', model: 'swift', body: 'hatch', newZar: 240000 },
  { make: 'suzuki', model: 'vitara brezza', body: 'suv', newZar: 340000 },
  { make: 'suzuki', model: 'ertiga', body: 'mpv', newZar: 330000 },
  { make: 'suzuki', model: 'jimny', body: 'suv', newZar: 500000 },
  { make: 'suzuki', model: 'fronx', body: 'suv', newZar: 380000, from: 2023 },
  { make: 'renault', model: 'kwid', body: 'hatch', newZar: 190000 },
  { make: 'renault', model: 'duster', body: 'suv', newZar: 390000 },
  { make: 'renault', model: 'clio', body: 'hatch', newZar: 320000 },
  { make: 'nissan', model: 'np200', body: 'bakkie', newZar: 260000, to: 2024 },
  { make: 'nissan', model: 'magnite', body: 'suv', newZar: 330000 },
  { make: 'nissan', model: 'navara', body: 'bakkie', newZar: 720000 },
  { make: 'nissan', model: 'x-trail', body: 'suv', newZar: 720000 },
  { make: 'nissan', model: 'almera', body: 'sedan', newZar: 280000, to: 2020 },
  { make: 'mazda', model: 'cx-5', body: 'suv', newZar: 660000 },
  { make: 'mazda', model: 'mazda3', body: 'sedan', newZar: 490000 },
  { make: 'mazda', model: 'cx-3', body: 'suv', newZar: 450000 },
  { make: 'isuzu', model: 'd-max', body: 'bakkie', newZar: 640000 },
  // Chinese and other volume brands
  { make: 'haval', model: 'jolion', body: 'suv', newZar: 400000 },
  { make: 'haval', model: 'h6', body: 'suv', newZar: 540000 },
  { make: 'chery', model: 'tiggo 4 pro', body: 'suv', newZar: 360000 },
  { make: 'chery', model: 'tiggo 7 pro', body: 'suv', newZar: 480000 },
  { make: 'gwm', model: 'p-series', body: 'bakkie', newZar: 520000 },
  { make: 'gwm', model: 'steed', body: 'bakkie', newZar: 320000 },
  { make: 'mahindra', model: 'scorpio', body: 'suv', newZar: 460000 },
  { make: 'mahindra', model: 'pik up', body: 'bakkie', newZar: 360000 },
  { make: 'tata', model: 'indica', body: 'hatch', newZar: 130000, to: 2016 },
  { make: 'datsun', model: 'go', body: 'hatch', newZar: 170000, to: 2019 },
  { make: 'opel', model: 'corsa', body: 'hatch', newZar: 310000 },
  { make: 'chevrolet', model: 'utility', body: 'bakkie', newZar: 200000, to: 2017 },
  { make: 'chevrolet', model: 'spark', body: 'hatch', newZar: 160000, to: 2018 },
  // Premium
  { make: 'bmw', model: '3 series', body: 'sedan', newZar: 920000 },
  { make: 'bmw', model: '1 series', body: 'hatch', newZar: 700000 },
  { make: 'bmw', model: 'x3', body: 'suv', newZar: 1150000 },
  { make: 'mercedes-benz', model: 'c-class', body: 'sedan', newZar: 1000000 },
  { make: 'mercedes-benz', model: 'a-class', body: 'hatch', newZar: 800000 },
  { make: 'mercedes-benz', model: 'glc', body: 'suv', newZar: 1300000 },
  { make: 'audi', model: 'a4', body: 'sedan', newZar: 860000 },
  { make: 'audi', model: 'q5', body: 'suv', newZar: 1100000 },
  { make: 'volvo', model: 'xc60', body: 'suv', newZar: 1050000 },
  { make: 'jeep', model: 'wrangler', body: 'suv', newZar: 1250000 },
  { make: 'land rover', model: 'defender', body: 'suv', newZar: 1450000 },
  { make: 'land rover', model: 'discovery', body: 'suv', newZar: 1300000 },
  // Others that show up on South African roads
  { make: 'honda', model: 'fit', body: 'hatch', newZar: 310000 },
  { make: 'honda', model: 'cr-v', body: 'suv', newZar: 820000 },
  { make: 'peugeot', model: '208', body: 'hatch', newZar: 330000 },
  { make: 'citroen', model: 'c3', body: 'hatch', newZar: 300000 },
  { make: 'fiat', model: '500', body: 'hatch', newZar: 270000 },
  { make: 'mitsubishi', model: 'pajero', body: 'suv', newZar: 900000 },
  { make: 'mitsubishi', model: 'triton', body: 'bakkie', newZar: 620000 },
  { make: 'subaru', model: 'forester', body: 'suv', newZar: 720000 },
];

/** Fallback new-price for a body style we could not put a name to. */
const SEGMENT_NEW: Record<BodyType, number> = {
  hatch: 320000,
  sedan: 500000,
  suv: 650000,
  bakkie: 560000,
  coupe: 750000,
  mpv: 520000,
  luxury: 1100000,
  unknown: 420000,
};

export const CURRENT_YEAR = 2026;

const MAKE_ALIASES: Record<string, string> = {
  vw: 'volkswagen',
  volksie: 'volkswagen',
  volkswagon: 'volkswagen',
  mercedes: 'mercedes-benz',
  'mercedes benz': 'mercedes-benz',
  merc: 'mercedes-benz',
  benz: 'mercedes-benz',
  chev: 'chevrolet',
  'landrover': 'land rover',
  'land-rover': 'land rover',
  bimmer: 'bmw',
  'great wall': 'gwm',
  'great wall motors': 'gwm',
};

/** Lower-case, strip accents and punctuation, collapse spaces. */
export function normalise(value: string | null | undefined): string {
  return (value ?? '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normaliseMake(make: string | null | undefined): string {
  const n = normalise(make);
  return MAKE_ALIASES[n] ?? n;
}

export function normaliseBody(body: string | null | undefined): BodyType {
  const b = normalise(body);
  if (!b) return 'unknown';
  if (/(bakkie|pickup|pick up|double cab|single cab|truck|ute)/.test(b)) return 'bakkie';
  if (/(suv|crossover|4x4|station wagon|wagon)/.test(b)) return 'suv';
  if (/(hatch|hatchback|city car)/.test(b)) return 'hatch';
  if (/(sedan|saloon|saloon car)/.test(b)) return 'sedan';
  if (/(coupe|coup)/.test(b)) return 'coupe';
  if (/(mpv|minivan|mini van|van|people carrier|bus)/.test(b)) return 'mpv';
  if (/(luxury|premium|sports car)/.test(b)) return 'luxury';
  return 'unknown';
}

function tokens(value: string): string[] {
  return normalise(value).split(' ').filter((t) => t.length > 1 && t !== 'series');
}

/** Best row for the make/model given, or null when nothing is close. */
export function matchModel(make: string | null | undefined, model: string | null | undefined): Row | null {
  const wantMake = normaliseMake(make);
  const wantTokens = tokens(model ?? '');
  let best: { row: Row; score: number } | null = null;

  for (const row of MODELS) {
    if (wantMake && row.make !== wantMake) continue;
    const rowTokens = tokens(row.model);
    let hits = 0;
    for (const t of wantTokens) if (rowTokens.includes(t)) hits += 1;
    // A make-only match is weak but still better than a blind segment guess.
    let score = wantTokens.length === 0 ? 0.5 : hits / Math.max(1, Math.max(wantTokens.length, rowTokens.length));
    if (hits === rowTokens.length && hits > 0) score += 0.5;
    if (!wantMake) score *= 0.8;
    if (!best || score > best.score) best = { row, score };
  }

  if (!best) return null;
  // Without a model name we need a confident make match; with one, half the name is enough.
  const threshold = wantTokens.length === 0 ? 0.45 : 0.4;
  return best.score >= threshold ? best.row : null;
}

/** Share of the new price a car keeps at a given age. */
export function depreciationFactor(ageYears: number): number {
  const age = Math.max(0, ageYears);
  const factor = 0.85 * Math.exp(-0.12 * age);
  return Math.max(0.06, Math.min(1, factor));
}

function roundTo(value: number, step = 1000): number {
  return Math.round(value / step) * step;
}

function clampYear(year: number | null | undefined): number {
  if (!year || !Number.isFinite(year)) return CURRENT_YEAR - 6;
  return Math.min(CURRENT_YEAR + 1, Math.max(1950, Math.round(year)));
}

/**
 * A price band in rand. The band widens when the identification is unsure or when
 * we fell back to a body-style guess instead of a real model.
 */
export function estimateValue(input: PriceInput): PriceRange {
  const body = normaliseBody(input.body_type);
  const year = clampYear(input.year);
  // Mid-year average: a car registered in this calendar year is half a year old.
  const age = Math.max(0, CURRENT_YEAR - year) + 0.5;
  const confidence = typeof input.confidence === 'number' && Number.isFinite(input.confidence) ? Math.min(1, Math.max(0, input.confidence)) : null;
  const match = matchModel(input.make, input.model);

  const newZar = match ? match.newZar : SEGMENT_NEW[body === 'unknown' ? 'unknown' : body];
  const mid = newZar * depreciationFactor(age);

  // One photo cannot confirm trim, mileage or condition, so the band is never tight:
  // the floor is 18%, and a small vision model that says "99% sure" is often wrong anyway.
  let spread = 0.3;
  if (confidence !== null && confidence >= 0.7) spread = 0.18;
  else if (confidence !== null && confidence >= 0.45) spread = 0.24;
  if (!match) spread += 0.06;

  return {
    low: roundTo(mid * (1 - spread)),
    high: roundTo(mid * (1 + spread)),
    mid: roundTo(mid),
    currency: 'ZAR',
    basis: match ? 'matched model' : 'segment estimate',
    year,
    // A matched model knows its own body style better than the photo does.
    body: match ? match.body : body,
    matched: match ? `${match.make} ${match.model}` : null,
  };
}

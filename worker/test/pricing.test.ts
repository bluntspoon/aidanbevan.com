import { describe, expect, it } from 'vitest';
import { CURRENT_YEAR, depreciationFactor, estimateValue, matchModel, normaliseBody, normaliseMake } from '../src/pricing';

describe('normalising', () => {
  it('expands the nicknames people and models use', () => {
    expect(normaliseMake('VW')).toBe('volkswagen');
    expect(normaliseMake('Mercedes Benz')).toBe('mercedes-benz');
    expect(normaliseMake('Toyota ')).toBe('toyota');
  });

  it('maps free-text body styles onto the six we know', () => {
    expect(normaliseBody('double cab pickup')).toBe('bakkie');
    expect(normaliseBody('Hatchback')).toBe('hatch');
    expect(normaliseBody('saloon')).toBe('sedan');
    expect(normaliseBody('crossover')).toBe('suv');
    expect(normaliseBody('')).toBe('unknown');
  });
});

describe('matchModel', () => {
  it('finds a model from make and model', () => {
    expect(matchModel('Toyota', 'Hilux')?.model).toBe('hilux');
    expect(matchModel('volkswagen', 'Polo Vivo 1.4')?.model).toBe('polo vivo');
  });

  it('finds a model from the model name alone', () => {
    expect(matchModel(null, 'Hilux')?.make).toBe('toyota');
  });

  it('gives up on nonsense instead of guessing', () => {
    expect(matchModel('Toyota', 'Spaceship')).toBeNull();
    expect(matchModel('Ferrari', 'F40')).toBeNull();
  });
});

describe('depreciation', () => {
  it('never goes up with age and stays inside sane bounds', () => {
    let previous = depreciationFactor(0);
    expect(previous).toBeLessThanOrEqual(0.86);
    for (let age = 1; age <= 40; age += 1) {
      const factor = depreciationFactor(age);
      expect(factor).toBeLessThanOrEqual(previous);
      expect(factor).toBeGreaterThanOrEqual(0.06);
      previous = factor;
    }
  });
});

describe('estimateValue', () => {
  it('returns a low < mid < high band in rand', () => {
    const value = estimateValue({ make: 'Toyota', model: 'Hilux', year: 2019, confidence: 0.9 });
    expect(value.currency).toBe('ZAR');
    expect(value.low).toBeLessThan(value.mid);
    expect(value.mid).toBeLessThan(value.high);
    expect(value.basis).toBe('matched model');
    expect(value.matched).toBe('toyota hilux');
  });

  it('prices an older car below a newer one of the same model', () => {
    const old = estimateValue({ make: 'VW', model: 'Polo', year: 2010 });
    const fresh = estimateValue({ make: 'VW', model: 'Polo', year: CURRENT_YEAR });
    expect(old.mid).toBeLessThan(fresh.mid);
  });

  it('is wide when it is only a body-style guess', () => {
    const guess = estimateValue({ make: null, model: null, year: 2018, body_type: 'suv', confidence: null });
    const sure = estimateValue({ make: 'Toyota', model: 'Fortuner', year: 2018, confidence: 0.95 });
    expect(guess.basis).toBe('segment estimate');
    expect(guess.high - guess.low).toBeGreaterThan(sure.high - sure.low);
  });

  it('widens the band as confidence drops', () => {
    const low = estimateValue({ make: 'Kia', model: 'Picanto', year: 2020, confidence: 0.3 });
    const high = estimateValue({ make: 'Kia', model: 'Picanto', year: 2020, confidence: 0.95 });
    expect(low.high - low.low).toBeGreaterThan(high.high - high.low);
  });

  it('keeps every band positive, rounded and in a believable order of magnitude', () => {
    const cases = [
      { make: 'Toyota', model: 'Land Cruiser', year: 2024 },
      { make: 'Suzuki', model: 'Swift', year: 2012 },
      { make: 'Tata', model: 'Indica', year: 2008 },
      { make: null, model: null, year: 1975, body_type: 'coupe' },
    ];
    for (const input of cases) {
      const value = estimateValue(input);
      expect(value.low).toBeGreaterThan(0);
      expect(value.low % 1000).toBe(0);
      expect(value.high).toBeLessThan(2_500_000);
    }
  });

  it('ignores a rubbish year rather than producing rubbish', () => {
    const value = estimateValue({ make: 'Ford', model: 'Ranger', year: 3021 });
    expect(value.year).toBeLessThanOrEqual(CURRENT_YEAR + 1);
    expect(value.low).toBeGreaterThan(0);
  });
});

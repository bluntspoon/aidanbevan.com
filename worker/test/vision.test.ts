import { describe, expect, it } from 'vitest';
import { extractJsonObject, parseIdentification, repairJsonText } from '../src/vision';

const clean = '{"is_car":true,"make":"Toyota","model":"Hilux","year":2019,"body_type":"bakkie","colour":"white","confidence":0.8,"notes":"double cab"}';

describe('repair and extract', () => {
  it('reads a fenced code block', () => {
    expect(extractJsonObject('```json\n' + clean + '\n```')).toBe(clean);
  });

  it('undoes escaped underscores the small model likes to add', () => {
    const escaped = '{"is\\_car":true,"make":"toyota","model":"corolla","body\\_type":"sedan"}';
    expect(repairJsonText(escaped)).toContain('"is_car"');
    expect(parseIdentification(escaped).make).toBe('toyota');
  });

  it('finds the object when the model wraps it in prose', () => {
    expect(extractJsonObject('Sure! Here it is: ' + clean + ' Hope that helps.')).toBe(clean);
  });

  it('drops a trailing comma', () => {
    expect(() => JSON.parse(extractJsonObject('{"is_car":true,"make":"Kia",}')!)).not.toThrow();
  });

  it('returns null when there is no object at all', () => {
    expect(extractJsonObject('I cannot see a car.')).toBeNull();
    expect(extractJsonObject('')).toBeNull();
  });
});

describe('parseIdentification', () => {
  it('parses a good answer', () => {
    const car = parseIdentification(clean);
    expect(car.is_car).toBe(true);
    expect(car.make).toBe('Toyota');
    expect(car.model).toBe('Hilux');
    expect(car.year).toBe(2019);
    expect(car.body_type).toBe('bakkie');
    expect(car.colour).toBe('white');
    expect(car.confidence).toBeCloseTo(0.8);
  });

  it('treats junk output as "no car" instead of throwing', () => {
    for (const junk of ['', 'no idea', '{', 'null', '{"is_car":']) {
      const car = parseIdentification(junk);
      expect(car.is_car).toBe(false);
      expect(car.make).toBeNull();
    }
  });

  it('believes an explicit is_car:false', () => {
    expect(parseIdentification('{"is_car":false,"make":"none","model":"none"}').is_car).toBe(false);
  });

  it('turns a flat-zero confidence into "unknown" rather than certainty', () => {
    expect(parseIdentification('{"is_car":true,"make":"VW","confidence":0}').confidence).toBeNull();
    expect(parseIdentification('{"is_car":true,"make":"VW","confidence":90}').confidence).toBeCloseTo(0.9);
    expect(parseIdentification('{"is_car":true,"make":"VW","confidence":4}').confidence).toBeCloseTo(0.4);
    expect(parseIdentification('{"is_car":true,"make":"VW","confidence":140}').confidence).toBe(1);
  });

  it('clamps a silly year and keeps a year embedded in text', () => {
    expect(parseIdentification('{"is_car":true,"model":"Polo","year":3050}').year).toBeLessThanOrEqual(2027);
    expect(parseIdentification('{"is_car":true,"model":"Polo","year":"registered 2014"}').year).toBe(2014);
  });

  it('never returns field values longer than a caption', () => {
    const long = parseIdentification('{"is_car":true,"make":"' + 'x'.repeat(200) + '","notes":"' + 'y'.repeat(400) + '"}');
    expect(long.make!.length).toBeLessThanOrEqual(40);
    expect(long.notes!.length).toBeLessThanOrEqual(120);
  });
});

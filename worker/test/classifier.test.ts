import { describe, expect, it } from 'vitest';
import { isVehicleLabel, looksLikeNoVehicle, topLabel } from '../src/classifier';

const car = [
  { label: 'MINIVAN', score: 0.66 },
  { label: 'BEACH WAGON', score: 0.19 },
  { label: 'CAR WHEEL', score: 0.1 },
];

const bike = [
  { label: 'MOUNTAIN BIKE', score: 0.999 },
  { label: 'VALLEY', score: 0.0002 },
];

describe('isVehicleLabel', () => {
  it('recognises the ImageNet car labels', () => {
    for (const label of ['MINIVAN', 'SPORTS CAR', 'JEEP', 'PICKUP', 'BEACH WAGON', 'GRILLE']) {
      expect(isVehicleLabel(label)).toBe(true);
    }
  });

  it('does not treat other things as vehicles', () => {
    for (const label of ['MOUNTAIN BIKE', 'GOLDEN RETRIEVER', 'PIZZA', 'VALLEY']) {
      expect(isVehicleLabel(label)).toBe(false);
    }
  });
});

describe('looksLikeNoVehicle', () => {
  it('passes a photo of a car', () => {
    expect(looksLikeNoVehicle(car)).toBe(false);
  });

  it('vetoes a confident bicycle', () => {
    expect(looksLikeNoVehicle(bike)).toBe(true);
  });

  it('stays out of the way when the classifier is unsure', () => {
    expect(looksLikeNoVehicle([{ label: 'MOUNTAIN BIKE', score: 0.3 }])).toBe(false);
    expect(looksLikeNoVehicle([])).toBe(false);
  });

  it('accepts a photo where a car is in the background', () => {
    expect(
      looksLikeNoVehicle([
        { label: 'MOUNTAIN BIKE', score: 0.61 },
        { label: 'SPORTS CAR', score: 0.2 },
      ]),
    ).toBe(false);
  });

  it('returns the strongest label', () => {
    expect(topLabel(car)?.label).toBe('MINIVAN');
    expect(topLabel([])).toBeNull();
  });
});

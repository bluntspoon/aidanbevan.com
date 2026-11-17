// A second, cheap opinion on "is this actually a car?".
// The small vision model happily identifies a mountain bike as a "Trek 520", so the
// ImageNet classifier gets a veto: if the strongest label is not a vehicle, it is not a car.

export interface ClassifierLabel {
  label: string;
  score: number;
}

/** ImageNet labels that mean "there is a road vehicle in this photo". */
const VEHICLE = /(car|convertible|jeep|cab|limousine|minivan|minibus|pickup|beach wagon|ambulance|taxi|truck|van|racer|sports car|grille|wheel|trailer|police|kart|go-kart|tow truck|fire engine|moving van|trailer truck)/i;

const CONFIDENT = 0.5;

export function isVehicleLabel(label: string): boolean {
  return VEHICLE.test(label ?? '');
}

/**
 * True when the classifier is sure the photo is something else entirely
 * (a bicycle, a dog, a plate of food). Unsure results are left to the vision model.
 */
export function looksLikeNoVehicle(labels: ClassifierLabel[]): boolean {
  if (!Array.isArray(labels) || labels.length === 0) return false;
  const sorted = [...labels].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const top = sorted[0];
  if (!top || isVehicleLabel(top.label)) return false;
  if ((top.score ?? 0) < CONFIDENT) return false;
  // A confident vehicle label anywhere in the list still means a car is in shot.
  return !sorted.slice(0, 5).some((entry) => isVehicleLabel(entry.label) && entry.score > 0.05);
}

export function topLabel(labels: ClassifierLabel[]): ClassifierLabel | null {
  if (!Array.isArray(labels) || labels.length === 0) return null;
  return [...labels].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;
}

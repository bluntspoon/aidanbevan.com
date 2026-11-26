// Pick, then go: the level choices the map's selection panel and the group screen share, and the
// one function both count with. The data has three levels; the picker offers three choices, and
// the third one is honest about holding two levels.
import { EXERCISES, exercisesFor } from './exercises.js';

export const LEVEL_CHOICES = [
  { value: 'all', label: 'All', levels: null }, // null: no level filter at all
  { value: 'beginner', label: 'Beginner', levels: ['beginner'] },
  { value: 'intermediate+', label: 'Intermediate +', levels: ['intermediate', 'advanced'] },
];

export const LEVEL_NOTE = 'Intermediate + = intermediate and advanced.';

/** The choice for a value; anything unknown (an old 'advanced', junk) is All. */
export function choiceFor(value) {
  return LEVEL_CHOICES.find((choice) => choice.value === value) ?? LEVEL_CHOICES[0];
}

/** One group's movements for a level choice and the where / kit filters. What the group screen lists. */
export function movesFor(id, { level = 'all', place = 'all', equipment = 'all' } = {}) {
  const { levels } = choiceFor(level);
  const list = exercisesFor(id, { place, equipment });
  return levels ? list.filter((exercise) => levels.includes(exercise.level)) : list;
}

/** { all, beginner, 'intermediate+' } counts for one group, with no where / kit filter. */
export function levelCounts(id, filters = {}) {
  return Object.fromEntries(LEVEL_CHOICES.map((choice) => [choice.value, movesFor(id, { ...filters, level: choice.value }).length]));
}

/** The level to actually show for a group: the one asked for, or All if it has nothing at that level. */
export function usableLevel(id, level) {
  return movesFor(id, { level }).length ? choiceFor(level).value : 'all';
}

/** Every level in the data, so a test can prove the three choices cover them exactly once. */
export const DATA_LEVELS = [...new Set(EXERCISES.map((exercise) => exercise.level))];

export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
export const startLabel = (n) => `Start with ${plural(n, 'movement')}`;

// My goals: a shortlist of body parts this person wants to build, kept on this device only.
// Not a plan or a programme: just the groups to keep one tap away. No network, no account.
import { isMuscleId } from './muscles.js';

const KEY = 'ga.goals.v1';
const listeners = new Set();
let memory = []; // used when storage is blocked (private mode, a locked-down webview)

function store() {
  try {
    const storage = globalThis.localStorage;
    return storage && typeof storage.getItem === 'function' ? storage : null;
  } catch {
    return null;
  }
}

/** The goals, oldest first. Unknown ids and duplicates in storage are dropped. */
export function getGoals() {
  let raw = memory;
  const storage = store();
  if (storage) {
    try {
      raw = JSON.parse(storage.getItem(KEY) ?? '[]');
    } catch {
      raw = [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id) => typeof id === 'string' && isMuscleId(id)))];
}

export function isGoal(id) {
  return getGoals().includes(id);
}

/** Add (on = true) or remove a goal. Returns false for an id that is not a body part. */
export function setGoal(id, on) {
  if (!isMuscleId(id)) return false;
  const before = getGoals();
  const after = on ? (before.includes(id) ? before : [...before, id]) : before.filter((g) => g !== id);
  if (after.length === before.length) return true;
  memory = after;
  try {
    store()?.setItem(KEY, JSON.stringify(after));
  } catch {
    // storage full or blocked: the in-memory copy still holds for this visit
  }
  listeners.forEach((fn) => fn(after));
  return true;
}

/** Call fn(goals) whenever the list changes, here or in another tab. Returns an unsubscribe. */
export function onGoalsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event.key === KEY) listeners.forEach((fn) => fn(getGoals()));
  });
}

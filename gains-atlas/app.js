// Gains Atlas — tap a body part, get the exercises. One vanilla module, no build step.
import { MUSCLES, BY_MUSCLE } from './muscles.js';
import { EXERCISES, EQUIPMENT_LABEL, exercisesFor } from './exercises.js';
import { FRONT_FIGURE, BACK_FIGURE, VIEWBOX, HITS, ringDistance, flatten } from './body-map.js';
import { diagramFor, diagramPose } from './diagram.js';
import { wireDiagrams, stopDiagrams, motionAllowed } from './animate.js';
import { getGoals, isGoal, setGoal, onGoalsChange } from './goals.js';
import { LEVEL_CHOICES, LEVEL_NOTE, choiceFor, movesFor, levelCounts, usableLevel, startLabel } from './pick.js';

const HOME_KEY = 'ga.home.v1';

const state = {
  muscle: null,
  view: 'front',
  home: readHome(), // 'map' or 'list', remembered per device
  place: 'all',
  level: 'all',
  equipment: 'all',
};

const FIGURES = { front: FRONT_FIGURE, back: BACK_FIGURE };
const SVG_NS = 'http://www.w3.org/2000/svg';
const INTRO_KEY = 'ga-intro-seen';

// Touch. A hold is 500 ms (no shorter: gym hands rest on the screen), a finger that wanders more
// than 12 px is a scroll or a drag, not a hold, and a miss within 28 px picks the nearest group.
const HOLD_MS = 500;
const MOVE_PX = 12;
const NEAR_PX = 28;
const GOALS_SHOWN = 4;

function readHome() {
  try {
    return globalThis.localStorage?.getItem(HOME_KEY) === 'list' ? 'list' : 'map';
  } catch {
    return 'map';
  }
}

// Everything shown as a number is counted from the data, never typed in.
const MOVES = Object.fromEntries(MUSCLES.map((muscle) => [muscle.id, exercisesFor(muscle.id).length]));
const groupsOn = (figure) => MUSCLES.filter((muscle) => figure.includes(`data-muscle="${muscle.id}"`));
const ON_VIEW = { front: groupsOn(FRONT_FIGURE), back: groupsOn(BACK_FIGURE) };

// The home list runs down the body: the front of the body first, then the back.
const LIST_ORDER = [
  'chest', 'shoulders', 'biceps', 'forearms', 'abs', 'lower-abs', 'obliques', 'adductors', 'quads', 'tibialis',
  'knees', 'ankles', 'hand-grip',
  'neck', 'upper-back', 'rotator-cuff', 'lats', 'lower-back', 'triceps', 'abductors', 'glutes', 'hamstrings', 'calves',
];
const rank = (muscle) => { const at = LIST_ORDER.indexOf(muscle.id); return at < 0 ? LIST_ORDER.length : at; };
const BY_REGION = [...MUSCLES].sort((a, b) => rank(a) - rank(b));

// The quick list runs head to toe by where each group is drawn: front groups, then back groups.
const middleOf = (id, view) => Math.min(...HITS[view].filter((h) => h.id === id).map((h) => (h.box.y0 + h.box.y1) / 2));
const headToToe = (view) => MUSCLES.filter((m) => m.view === view)
  .map((m) => ({ m, y: middleOf(m.id, viewFor(m.id)) }))
  .sort((a, b) => a.y - b.y)
  .map(({ m }) => m);
const PARTS = { front: headToToe('front'), back: headToToe('back') };

const el = (id) => document.getElementById(id);
const app = () => el('app');
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const capital = (text) => text[0].toUpperCase() + text.slice(1);

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** The view a group is drawn on: its own view if it has a hotspot there, else whichever does. */
function viewFor(id) {
  const own = BY_MUSCLE[id]?.view;
  if (own && FIGURES[own].includes(`data-muscle="${id}"`)) return own;
  return FRONT_FIGURE.includes(`data-muscle="${id}"`) ? 'front' : 'back';
}

/** A small, decorative copy of a figure with one group lit. Not focusable: the page names it. */
function miniFigure(id) {
  return FIGURES[viewFor(id)]
    .replace(/<g class="hits"[\s\S]*?<\/g>/, '')
    .replace('class="figure"', 'class="figure mini is-engaged" aria-hidden="true" focusable="false"')
    .replace(/ role="button" tabindex="0"/g, ' tabindex="-1"')
    .replaceAll(`class="hotspot" data-muscle="${id}"`, `class="hotspot is-lit" data-muscle="${id}"`);
}

// Press and hold on the map opens the same sheet as this button. A long-press-only feature is
// invisible to keyboard and screen-reader users (and to anyone who never guesses to hold), so
// every place that names a body part also carries this plain, focusable ⋯ button.
function moreButton(muscle) {
  return `<button class="more" type="button" data-more="${muscle.id}" aria-haspopup="dialog" aria-label="More for ${escapeHtml(muscle.name)}: see the movements, or add to my goals"><span aria-hidden="true">⋯</span></button>`;
}

function chip(muscle) {
  const n = MOVES[muscle.id];
  return `<li class="chip-row"><button class="chip" type="button" data-jump="${muscle.id}" aria-label="${escapeHtml(muscle.name)}, ${plural(n, 'movement')}">
    <span class="chip-name">${escapeHtml(muscle.name)}</span><span class="chip-n">${n}</span></button>${moreButton(muscle)}</li>`;
}

function partRow(muscle) {
  const n = MOVES[muscle.id];
  return `<li class="part-row"><button class="part" type="button" data-jump="${muscle.id}">
    <span class="part-name">${escapeHtml(muscle.name)}</span><span class="part-n">${plural(n, 'movement')}</span></button>${moreButton(muscle)}</li>`;
}

const hintFor = (view) => (state.home === 'list'
  ? `All ${MUSCLES.length} body parts, head to toe.`
  : `${capital(view)} · ${ON_VIEW[view].length} areas. Tap one; hold for options.`);

/* ------------------------------------------------------------------ views */

function viewMap() {
  const on = (view) => state.view === view;
  const list = state.home === 'list';
  return `
    <div class="home-first${list ? ' is-list' : ''}" id="home-first">
      <section class="hero">
        <div class="hero-photo" role="img" aria-label="A bodybuilder on stage, lit from the side">
          <h1 class="hero-mark"><span class="mark-1">Gains</span> <span class="mark-2">Atlas</span></h1>
        </div>
        <div class="hero-copy">
          <p class="lede">Tap a body part, then pick a level.</p>
          <p class="hero-stat"><strong>${EXERCISES.length}</strong> movements · <strong>${MUSCLES.length}</strong> body parts · works offline</p>
        </div>
      </section>

      <section class="goals" id="goals" aria-labelledby="goals-h" hidden></section>

      <div class="map-bar">
        <div class="map-tabs" role="tablist" aria-label="Body view">
          <button class="tab${on('front') ? ' is-on' : ''}" id="tab-front" role="tab" aria-selected="${on('front')}" aria-controls="map" type="button">Front</button>
          <button class="tab${on('back') ? ' is-on' : ''}" id="tab-back" role="tab" aria-selected="${on('back')}" aria-controls="map" type="button">Back</button>
        </div>
        <div class="map-tabs home-switch" role="group" aria-label="Show body parts as">
          <button class="tab${list ? '' : ' is-on'}" id="home-map" type="button" aria-pressed="${!list}">Body map</button>
          <button class="tab${list ? ' is-on' : ''}" id="home-list" type="button" aria-pressed="${list}">List</button>
        </div>
      </div>
      <p class="map-hint" id="map-hint">${hintFor(state.view)}</p>

      <div class="stage" id="stage"${list ? ' hidden' : ''}>
        <div class="map" id="map" data-view="${state.view}">${FIGURES[state.view]}</div>
        <div class="map-label" id="map-label" aria-hidden="true"><span class="map-label-name"></span><span class="map-label-n"></span></div>
      </div>

      <div class="parts" id="parts"${list ? '' : ' hidden'}>
        <h2 class="parts-h" id="parts-front">Front</h2>
        <ul class="part-list" aria-labelledby="parts-front">${PARTS.front.map(partRow).join('')}</ul>
        <h2 class="parts-h" id="parts-back">Back</h2>
        <ul class="part-list" aria-labelledby="parts-back">${PARTS.back.map(partRow).join('')}</ul>
      </div>
    </div>

    <dialog class="pick" id="pick" aria-labelledby="pick-name" aria-describedby="pick-blurb"><div class="pick-body"></div></dialog>

    <p class="overline" id="all-groups">All target areas</p>
    <ul class="chips" aria-labelledby="all-groups">${BY_REGION.map(chip).join('')}</ul>

    <p class="disclaimer">General training guidance, not medical advice. If something hurts, stop and ask a coach or a doctor.</p>`;
}

/** The "My goals" strip on home: hidden when empty, up to four chips, then "All goals (n)". */
let goalsExpanded = false;
function renderGoals() {
  const box = el('goals');
  if (!box) return;
  const goals = getGoals();
  box.hidden = goals.length === 0;
  el('home-first')?.classList.toggle('has-goals', goals.length > 0);
  if (!goals.length) { box.innerHTML = ''; goalsExpanded = false; return; }
  const shown = goalsExpanded ? goals : goals.slice(0, GOALS_SHOWN);
  const more = goals.length > GOALS_SHOWN
    ? `<li><button class="goal-all" id="goals-all" type="button" aria-expanded="${goalsExpanded}">${goalsExpanded ? 'Fewer' : `All goals (${goals.length})`}</button></li>`
    : '';
  box.innerHTML = `<h2 class="goals-h" id="goals-h">My goals</h2>
    <ul class="goal-chips">${shown.map((id) => {
      const muscle = BY_MUSCLE[id];
      return `<li><button class="goal-chip" type="button" data-jump="${id}" aria-label="${escapeHtml(muscle.name)}, ${plural(MOVES[id], 'movement')}"><span class="goal-name">${escapeHtml(muscle.name)}</span><span class="goal-n">${MOVES[id]}</span></button></li>`;
    }).join('')}${more}</ul>`;
}

const option = (value, label, current) => `<option value="${value}"${current === value ? ' selected' : ''}>${label}</option>`;
const JOINT_NOTE = 'A joint, not a muscle: these movements load the muscles and tendons that move it.';

/**
 * The three level choices as one radio group of big buttons, each with its count under it. The map's
 * panel and the group screen draw the same control, so the labels can never drift apart. With
 * `disableEmpty`, a choice with nothing in it can't be picked (the panel never offers a dead end).
 */
function levelRow(id, level, filters = {}, { disableEmpty = false } = {}) {
  const counts = levelCounts(id, filters);
  return `<div class="levels" role="radiogroup" aria-label="Level">${LEVEL_CHOICES.map((choice) => {
    const on = choice.value === level;
    const n = counts[choice.value];
    const off = disableEmpty && n === 0 && !on;
    return `<button class="level-choice${on ? ' is-on' : ''}" type="button" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}" data-level="${choice.value}"${off ? ' disabled' : ''} aria-label="${escapeHtml(choice.label)}, ${plural(n, 'movement')}"><span class="level-name">${escapeHtml(choice.label)}</span><span class="level-n">${n}</span></button>`;
  }).join('')}</div>`;
}

/** Arrow keys move the choice inside a level radio group, as a radio group should. */
function wireLevelKeys(root, choose) {
  root.addEventListener('keydown', (event) => {
    const radio = event.target.closest?.('.level-choice');
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!radio || !step) return;
    event.preventDefault();
    const all = [...radio.parentElement.querySelectorAll('.level-choice:not([disabled])')];
    const next = all[(all.indexOf(radio) + step + all.length) % all.length];
    choose(next.dataset.level);
  });
}

/** What the map's selection panel says for one group at one level. Every number is counted. */
function pickContent(id, wanted = 'all') {
  const muscle = BY_MUSCLE[id];
  const level = usableLevel(id, wanted);
  const n = movesFor(id, { level }).length;
  const fellBack = level !== choiceFor(wanted).value;
  const saved = isGoal(id);
  return `
    <p class="overline pick-latin">${escapeHtml(muscle.latin)}</p>
    <h2 class="pick-name" id="pick-name">${escapeHtml(muscle.name)}</h2>
    <p class="pick-blurb" id="pick-blurb">${escapeHtml(muscle.blurb)}${muscle.joint ? ` <span class="joint-note">${JOINT_NOTE}</span>` : ''}</p>
    <p class="pick-n" id="pick-n">${fellBack
    ? `No ${escapeHtml(choiceFor(wanted).label)} movements here, so this shows all ${MOVES[id]}.`
    : `${plural(MOVES[id], 'movement')} here`}</p>
    ${levelRow(id, level, {}, { disableEmpty: true })}
    <p class="pick-note">${LEVEL_NOTE}</p>
    <div class="pick-actions">
      <button class="btn btn-ember pick-start" type="button" data-pick="start" data-n="${n}">${startLabel(n)}</button>
      <button class="pick-save" type="button" data-pick="save" aria-pressed="${saved}">${saved ? 'Saved to goals' : 'Save for later'}</button>
    </div>
    <button class="pick-close" type="button" data-pick="close" aria-label="Close"><span aria-hidden="true">×</span></button>`;
}

let levelsOpen = false; // the group screen's level row, opened from the "You picked" line

function viewMuscle(muscle) {
  const level = choiceFor(state.level);
  const list = movesFor(muscle.id, state);
  const atLevel = movesFor(muscle.id, { level: level.value }).length;
  const n = list.length < atLevel ? `${list.length} of ${plural(atLevel, 'movement')}` : plural(list.length, 'movement');

  return `
    <button class="back" id="back" type="button"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Body map</button>
    <header class="muscle-head">
      <div class="mini-wrap">${miniFigure(muscle.id)}</div>
      <div class="muscle-title">
        <p class="overline">${escapeHtml(muscle.latin)}</p>
        <h1>${escapeHtml(muscle.name)}</h1>
        <p class="goal-pill" id="goal-pill"${isGoal(muscle.id) ? '' : ' hidden'}>In my goals</p>
      </div>
      ${moreButton(muscle)}
    </header>

    <button class="picked" id="picked" type="button" aria-expanded="${levelsOpen}" aria-controls="level-pick" aria-label="You picked ${escapeHtml(muscle.name)}, ${escapeHtml(level.label)}, ${n}. Change level">
      <span class="picked-text" aria-live="polite"><span class="picked-over">You picked: </span><span class="picked-what"><b>${escapeHtml(muscle.name)}</b> · <b data-picked-level="${level.value}">${escapeHtml(level.label)}</b> · <b>${n}</b></span></span>
      <span class="picked-change" aria-hidden="true">Change</span>
    </button>
    <div class="level-pick" id="level-pick"${levelsOpen ? '' : ' hidden'}>
      ${levelRow(muscle.id, level.value, { place: state.place, equipment: state.equipment })}
      <p class="pick-note">${LEVEL_NOTE}</p>
    </div>
    ${muscle.joint ? `<p class="joint-note muscle-joint">${JOINT_NOTE}</p>` : ''}

    <div class="filters" role="group" aria-label="Filter the list">
      <label class="filter${state.place !== 'all' ? ' is-set' : ''}"><span>Where</span>
        <select id="f-place">
          ${option('all', 'Anywhere', state.place)}${option('home', 'Home', state.place)}${option('gym', 'Gym', state.place)}
        </select>
      </label>
      <label class="filter${state.equipment !== 'all' ? ' is-set' : ''}"><span>Kit</span>
        <select id="f-equipment">
          ${option('all', 'Any kit', state.equipment)}
          ${Object.entries(EQUIPMENT_LABEL).map(([value, label]) => option(value, label, state.equipment)).join('')}
        </select>
      </label>
    </div>

    ${list.length ? `<ul class="exercises">${list.map(exerciseRow).join('')}</ul>`
      : '<p class="empty">Nothing matches those filters. Widen one and the list fills up again.</p>'}

    <p class="muscle-blurb"><b>${escapeHtml(muscle.name)}.</b> ${escapeHtml(muscle.blurb)}</p>

    <div class="other">
      <p class="eyebrow">Also on the map</p>
      <ul class="chips">${MUSCLES.filter((m) => m.id !== muscle.id).map(chip).join('')}</ul>
    </div>`;
}

/** The group screen as it would render for these filters, for tests that hold the picker to it. */
function viewMuscleFor(id, filters = {}) {
  const saved = { ...state };
  Object.assign(state, { place: 'all', level: 'all', equipment: 'all' }, filters);
  try {
    return viewMuscle(BY_MUSCLE[id]);
  } finally {
    Object.assign(state, saved);
  }
}

const ICON_CHEVRON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_WARN = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1.8l6.6 11.7H1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.3v3.4M8 11.6v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const LEVEL_STEPS = { beginner: 1, intermediate: 2, advanced: 3 };

const levelBars = (level) => `<span class="level" aria-hidden="true">${[1, 2, 3]
  .map((step) => `<i${step <= LEVEL_STEPS[level] ? ' class="on"' : ''}></i>`).join('')}</span>`;

function stepsList(steps) {
  return `<ol class="ex-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
}

/**
 * The how-to drawing. Where the movement has a start and a finish pose (and motion is welcome),
 * the whole picture is a button: tap it and the figure does one rep. Otherwise, the still drawing.
 */
function diagramBlock(exercise) {
  const still = `<figure class="ex-diagram" aria-label="How to do a ${escapeHtml(exercise.name)}, start and end position">${diagramFor(exercise)}</figure>`;
  if (!motionAllowed() || !diagramPose(exercise.id).ghost) return still;
  return `<div class="ex-fig">
              <button type="button" class="ex-diagram" data-anim="${escapeHtml(exercise.id)}" aria-label="Play ${escapeHtml(exercise.name)}">${diagramFor(exercise)}</button>
              <p class="ex-hint" hidden>Tap the picture to watch it move</p>
            </div>`;
}

function exerciseRow(exercise, index) {
  const secondary = exercise.secondary.map((id) => BY_MUSCLE[id]?.name).filter(Boolean);
  const meta = [capital(exercise.level), EQUIPMENT_LABEL[exercise.equipment], exercise.place === 'home' ? 'Home' : 'Gym'].join(' · ');
  return `
    <li class="exercise" style="--i:${Math.min(index, 12)}">
      <details>
        <summary>
          <span class="ex-top">
            <span class="ex-name">${escapeHtml(exercise.name)}</span>
            <span class="ex-toggle">${ICON_CHEVRON}</span>
          </span>
          <span class="ex-meta">${levelBars(exercise.level)}${escapeHtml(meta)}</span>
          <span class="ex-dose"><b>${escapeHtml(exercise.sets)}</b><span class="x"> × </span><b>${escapeHtml(exercise.reps)}</b><span class="rest"> · ${escapeHtml(exercise.rest)} rest</span></span>
        </summary>
        <div class="ex-body">
          <div class="ex-quarter">
            ${diagramBlock(exercise)}
            <p class="ex-cue"><strong>Remember</strong>${escapeHtml(exercise.cue)}</p>
          </div>
          <p class="overline ex-steps-title">Step by step</p>
          ${stepsList(exercise.steps)}
          <p class="ex-avoid"><strong>${ICON_WARN}Avoid</strong>${escapeHtml(exercise.avoid)}</p>
          ${secondary.length ? `<p class="ex-secondary">Also works ${secondary.map(escapeHtml).join(', ')}</p>` : ''}
        </div>
      </details>
    </li>`;
}

/* ------------------------------------------------------------ interaction */

/**
 * Open a group's screen. `level` is the level choice to apply; `fresh` also clears where and kit,
 * so the list is exactly as long as the panel or peek that sent you here promised.
 */
function openMuscle(id, { level = 'all', fresh = false } = {}) {
  const muscle = BY_MUSCLE[id];
  if (!muscle) return;
  // The panel's history entry becomes the group screen's, so Back from the list lands on the map,
  // not on an invisible "panel open" step.
  const replace = pickEntry;
  dismissPick();
  // Where you train carries over; a level or kit picked for one body part does not, or the next
  // list opens half-empty for no visible reason.
  if (state.muscle !== id || fresh) {
    state.level = choiceFor(level).value;
    state.equipment = 'all';
    levelsOpen = false;
  }
  if (fresh) state.place = 'all';
  state.muscle = id;
  state.view = viewFor(id);
  stopDiagrams();
  app().innerHTML = viewMuscle(muscle);
  if (replace) history.replaceState(null, '', `#/${id}`);
  else location.hash = `#/${id}`;
  wireMuscle(muscle);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function wireMuscle(muscle) {
  document.body.classList.remove('is-home');
  el('back').addEventListener('click', () => { location.hash = '#/'; });
  const redraw = (focusId) => {
    stopDiagrams();
    app().innerHTML = viewMuscle(muscle);
    wireMuscle(muscle);
    app().classList.add('no-stagger');
    (typeof focusId === 'string' ? el(focusId) : focusId?.())?.focus();
  };
  const refilter = (key) => (event) => {
    state[key] = event.target.value;
    redraw(`f-${key}`);
  };
  el('f-place').addEventListener('change', refilter('place'));
  el('f-equipment').addEventListener('change', refilter('equipment'));

  // "You picked: …" opens the level row under it; a choice there redraws the list in place.
  el('picked').addEventListener('click', () => {
    levelsOpen = !levelsOpen;
    redraw(() => (levelsOpen ? app().querySelector('.level-choice[aria-checked="true"]') : el('picked')));
  });
  const choose = (value) => {
    state.level = choiceFor(value).value;
    redraw(() => app().querySelector('.level-choice[aria-checked="true"]'));
  };
  const row = el('level-pick');
  row.addEventListener('click', (event) => {
    const choice = event.target.closest('.level-choice');
    if (choice && !choice.disabled) choose(choice.dataset.level);
  });
  wireLevelKeys(row, choose);
  wireDiagrams(app());
}

/**
 * Show one group on the map. `mode` is 'preview' (pointer hover: a light tint) or 'lit' (focus or
 * tap: the group turns solid ember and the rest of the body steps back). Either way its name sits
 * in the side gutter, joined to the muscle by a thin leader line.
 */
function showGroup(map, id, mode = 'lit') {
  const svg = map.querySelector('svg');
  const label = el('map-label');
  if (!svg || !label) return;
  svg.querySelectorAll('.hotspot.is-lit, .hotspot.is-hover').forEach((path) => path.classList.remove('is-lit', 'is-hover'));
  svg.querySelector('.leader')?.remove();
  document.querySelectorAll('.chip.is-active').forEach((button) => button.classList.remove('is-active'));
  if (!id) {
    svg.classList.remove('is-engaged');
    label.classList.remove('is-on');
    return;
  }

  const paths = [...svg.querySelectorAll(`.hotspot[data-muscle="${id}"]`)];
  paths.forEach((path) => path.classList.add(mode === 'lit' ? 'is-lit' : 'is-hover'));
  svg.classList.toggle('is-engaged', mode === 'lit');
  document.querySelectorAll(`.chip[data-jump="${id}"]`).forEach((button) => button.classList.add('is-active'));

  // Lead from the left-hand copy of a paired group to the left gutter; a group on the midline
  // (abs, neck, lower back) leads right. The leader stops just outside the body at the height the
  // label sits, so the label never covers the figure.
  const boxes = paths.map((path) => path.getBBox());
  const centre = (b) => b.x + b.width / 2;
  const box = boxes.reduce((a, b) => (centre(b) < centre(a) ? b : a));
  const cx = centre(box);
  const cy = box.y + box.height / 2;
  const side = cx < 99 ? 'left' : 'right';

  label.querySelector('.map-label-name').textContent = BY_MUSCLE[id].name;
  label.querySelector('.map-label-n').textContent = plural(MOVES[id], 'movement');
  label.dataset.side = side;

  const ctm = svg.getScreenCTM();
  if (!ctm) return;
  const stage = map.parentElement.getBoundingClientRect();
  const gap = 6;
  const margin = 8;
  const toScreenX = (x) => ctm.a * x + ctm.e;
  const toUserY = (y) => (y - ctm.f) / ctm.d;
  // x of the leader's end for a label spanning [top, bottom] in user units.
  const endFor = (top, bottom) => {
    const edge = bodyEdge(svg, top, bottom) - 2.5;
    return side === 'left' ? edge : 200 - edge;
  };
  const roomAt = (endX) => (side === 'left'
    ? toScreenX(endX) - stage.left - gap - margin
    : stage.right - toScreenX(endX) - gap - margin);
  const nameHeight = () => label.querySelector('.map-label-name').offsetHeight;

  // First pass: lay the label out against the widest part of the body (the hands), then refine
  // against the body at the label's own height, which usually gives more room.
  label.style.maxWidth = `${Math.max(72, Math.floor(roomAt(endFor(VIEWBOX.y, VIEWBOX.y + VIEWBOX.height))))}px`;
  const cyScreen = ctm.d * cy + ctm.f;
  const y = Math.max(4, Math.min(stage.height - label.offsetHeight - 4, cyScreen - stage.top - nameHeight() / 2));
  const top = toUserY(stage.top + y);
  const endX = endFor(top, toUserY(stage.top + y + label.offsetHeight));
  label.style.maxWidth = `${Math.max(72, Math.floor(roomAt(endX)))}px`;
  const width = label.offsetWidth;
  const end = toScreenX(endX);
  const x = side === 'left' ? end - stage.left - gap - width : end - stage.left + gap;

  const leader = document.createElementNS(SVG_NS, 'line');
  leader.setAttribute('class', 'leader');
  leader.setAttribute('x1', cx.toFixed(1));
  leader.setAttribute('y1', cy.toFixed(1));
  leader.setAttribute('x2', endX.toFixed(1));
  leader.setAttribute('y2', cy.toFixed(1));
  svg.append(leader);

  label.style.setProperty('--x', `${Math.round(x)}px`);
  label.style.setProperty('--y', `${Math.round(y)}px`);
  label.classList.add('is-on');
}

/**
 * The outermost x of the body's left contour between two heights (user units). Sampled once per
 * figure from the left half of the silhouette; the right side is its mirror.
 */
const CONTOURS = new WeakMap();
function bodyEdge(svg, top, bottom) {
  let rows = CONTOURS.get(svg);
  if (!rows) {
    rows = new Array(200).fill(Infinity); // one row per 2 units of height
    // Flattened in plain JS (points <= 1 unit apart): sampling the path with getPointAtLength
    // took most of a second on the first tap, which is exactly when feedback must be instant.
    const d = svg.querySelector('.skin')?.getAttribute('d') ?? '';
    for (const ring of flatten(d)) {
      for (const [x, y] of ring) {
        const row = Math.floor(y / 2);
        if (row >= 0 && row < rows.length) rows[row] = Math.min(rows[row], x);
      }
    }
    CONTOURS.set(svg, rows);
  }
  let edge = 100;
  for (let row = Math.max(0, Math.floor(top / 2)); row <= Math.min(rows.length - 1, Math.floor(bottom / 2)); row += 1) {
    edge = Math.min(edge, rows[row]);
  }
  return edge;
}

/** First visit only: one slow sweep down the body so people see the parts are tappable. */
function introSweep(svg) {
  try {
    if (localStorage.getItem(INTRO_KEY)) return;
    localStorage.setItem(INTRO_KEY, '1');
  } catch {
    return; // storage blocked: skip the sweep rather than repeat it on every visit
  }
  if (reducedMotion()) return;
  // While the welcome sheet is up nobody can see the sweep: run it once the sheet closes.
  if (document.documentElement.classList.contains('welcome-open')) {
    window.addEventListener('ga:welcome-closed', () => { if (svg.isConnected) sweep(svg); }, { once: true });
    return;
  }
  sweep(svg);
}

function sweep(svg) {
  const hotspots = [...svg.querySelectorAll('.hotspot')];
  const tops = new Map(hotspots.map((path) => [path, path.getBBox().y]));
  hotspots.sort((a, b) => tops.get(a) - tops.get(b))
    .forEach((path, index) => path.style.setProperty('--d', `${index * 30}ms`));
  svg.classList.add('is-intro');
  const last = hotspots.length * 30 + 900;
  window.setTimeout(() => svg.classList.remove('is-intro'), last);
}

/** The group nearest a screen point, if it is within NEAR_PX of one; else null. */
function nearestGroup(map, x, y) {
  const svg = map.querySelector('svg');
  const ctm = svg?.getScreenCTM();
  if (!ctm) return null;
  const inv = ctm.inverse();
  const point = [inv.a * x + inv.c * y + inv.e, inv.b * x + inv.d * y + inv.f];
  let best = null;
  let bestPx = Infinity;
  for (const item of HITS[map.dataset.view] ?? []) {
    const px = ringDistance(point, item.ring) * ctm.a;
    if (px < bestPx) { bestPx = px; best = item.id; }
  }
  return bestPx <= NEAR_PX ? best : null;
}

function wireMap() {
  document.body.classList.add('is-home');
  const map = el('map');
  const stage = el('stage');
  let going = false;
  picked = null;
  pickEntry = false;
  document.documentElement.classList.remove('pick-open');
  wirePick();
  const rest = () => showGroup(map, picked); // back to the selection, or to nothing
  let press = null; // the finger that is down: { id, x, y, pointerId, timer }
  let held = false; // a hold opened the sheet: swallow the click its release produces
  let dragged = false; // the finger wandered: a drag is neither a tap nor a hold

  // A drawn group, its halo, or failing both the nearest group within NEAR_PX. Else nothing:
  // a tap on really empty stage clears the selection.
  const groupAt = (event) => {
    const hit = event.target.closest?.('[data-muscle], [data-hit]');
    if (hit) return hit.dataset.muscle ?? hit.dataset.hit;
    if (!stage.contains(event.target)) return null;
    return nearestGroup(map, event.clientX, event.clientY);
  };

  // Tap 1 selects; tap 2 on the same group (or Start in the panel) goes.
  const tap = (id) => {
    if (going) return;
    if (id && id === picked) { going = true; startPicked(); }
    else if (id) selectGroup(id);
    else if (picked) closePick({ restoreFocus: false });
    else showGroup(map, null);
  };
  const release = () => {
    if (press) clearTimeout(press.timer);
    press = null;
  };

  // The group lights on the first frame the finger is down; nothing about the page moves.
  stage.addEventListener('pointerdown', (event) => {
    held = false;
    dragged = false;
    if (going || event.button > 0) return;
    const id = groupAt(event);
    release();
    if (!id) return;
    showGroup(map, id, 'lit');
    press = {
      id, x: event.clientX, y: event.clientY, pointerId: event.pointerId,
      timer: window.setTimeout(() => {
        press = null;
        held = true;
        openPeek(id, () => { if (!going && map.isConnected) rest(); });
      }, HOLD_MS),
    };
  });
  // A finger that wanders more than MOVE_PX is scrolling or dragging, not holding or tapping:
  // drop the hold and the light, and let the release open nothing. (Opening whatever group the
  // finger ended on would be a navigation nobody asked for.)
  stage.addEventListener('pointermove', (event) => {
    if (!press || event.pointerId !== press.pointerId) return;
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > MOVE_PX) {
      release();
      dragged = true;
      if (!going) rest();
    }
  });
  stage.addEventListener('pointerup', release);
  // The browser took the gesture (a scroll began): no tap, no hold, no light.
  stage.addEventListener('pointercancel', () => {
    release();
    if (!going) rest();
  });
  // A long press must not bring up the browser's own menu or start a text selection.
  stage.addEventListener('contextmenu', (event) => event.preventDefault());

  stage.addEventListener('click', (event) => {
    if (held) { held = false; return; }
    if (dragged) { dragged = false; return; }
    if (going) return;
    tap(groupAt(event));
  });
  map.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const hit = event.target.closest('[data-muscle]');
    if (!hit || going) return;
    event.preventDefault();
    tap(hit.dataset.muscle);
  });

  // With a group selected, hover leaves the selection alone (CSS :hover still tints the group).
  map.addEventListener('pointerover', (event) => {
    if (going || press || picked || event.pointerType === 'touch') return;
    const hit = event.target.closest?.('[data-muscle], [data-hit]');
    if (hit) showGroup(map, hit.dataset.muscle ?? hit.dataset.hit, 'preview');
    else if (!map.contains(document.activeElement)) rest();
  });
  map.addEventListener('focusin', (event) => {
    if (going || quietFocus) return;
    const hit = event.target.closest?.('[data-muscle]');
    if (hit) showGroup(map, hit.dataset.muscle, 'lit');
  });
  map.addEventListener('pointerleave', (event) => {
    if (!going && !press && event.pointerType !== 'touch' && !map.contains(document.activeElement)) rest();
  });
  map.addEventListener('focusout', (event) => {
    if (!going && !press && !map.contains(event.relatedTarget)) rest();
  });

  const front = el('tab-front');
  const back = el('tab-back');
  const show = (which) => {
    if (picked) closePick({ restoreFocus: false });
    state.view = which;
    map.innerHTML = FIGURES[which];
    map.dataset.view = which;
    showGroup(map, null);
    front.classList.toggle('is-on', which === 'front');
    back.classList.toggle('is-on', which === 'back');
    front.setAttribute('aria-selected', String(which === 'front'));
    back.setAttribute('aria-selected', String(which === 'back'));
    el('map-hint').textContent = hintFor(which);
  };
  front.addEventListener('click', () => show('front'));
  back.addEventListener('click', () => show('back'));
  // Arrow keys move between the two tabs, as a tablist should.
  [front, back].forEach((tab) => tab.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = tab === front ? back : front;
    next.focus();
    next.click();
  }));

  // Body map or list: one or the other, never both, remembered on this device.
  const setHome = (mode) => {
    if (picked) closePick({ restoreFocus: false });
    state.home = mode;
    try { localStorage.setItem(HOME_KEY, mode); } catch { /* storage blocked: this visit only */ }
    const list = mode === 'list';
    el('home-first').classList.toggle('is-list', list);
    el('stage').hidden = list;
    el('parts').hidden = !list;
    el('home-map').classList.toggle('is-on', !list);
    el('home-list').classList.toggle('is-on', list);
    el('home-map').setAttribute('aria-pressed', String(!list));
    el('home-list').setAttribute('aria-pressed', String(list));
    el('map-hint').textContent = hintFor(state.view);
    showGroup(map, null);
  };
  el('home-map').addEventListener('click', () => setHome('map'));
  el('home-list').addEventListener('click', () => setHome('list'));

  renderGoals();
  const svg = map.querySelector('svg');
  if (svg && state.home === 'map') introSweep(svg);
}

/* ------------------------------------------------------ pick, then go */

// Tap 1 on the map selects a group and opens this panel; tap 2 (Start, or the same group again)
// opens the list. The panel is a non-modal <dialog> docked to the bottom, in thumb reach, so the
// map stays live behind it: tap another group to switch, empty stage to clear.
let picked = null; // the selected group, or null
let pickLevel = 'all'; // the level chosen in the panel; kept while you switch groups
let pickEntry = false; // a history entry was pushed when the panel opened, so Back closes it
let skipPops = 0; // pops we caused ourselves with history.back()
let quietFocus = false; // focus is coming back to a hotspot: don't light it up again
let goalsStale = false; // goals changed while the panel was open: redraw the strip once it closes

function renderPick(focus = null) {
  const panel = el('pick');
  if (!panel || !picked) return;
  panel.querySelector('.pick-body').innerHTML = pickContent(picked, pickLevel);
  document.documentElement.style.setProperty('--pick-h', `${panel.offsetHeight}px`);
  sizeFigureToPanel();
  if (focus) panel.querySelector(focus)?.focus({ preventScroll: true });
}

/** The panel owns the bottom of the screen: shrink the figure into the room above it, so every
 *  group stays tappable instead of sitting behind the sheet. Runs on open, on resize and on rotate. */
function sizeFigureToPanel() {
  const figure = document.querySelector('#map .figure');
  const panel = el('pick');
  if (!figure) return;
  if (!panel?.open) { figure.style.removeProperty('height'); return; }
  // Twice, a beat apart: the panel's own content can settle a frame after it opens (the label
  // moves, the blurb wraps), and a stale measure leaves a strip of the feet behind the sheet.
  if (!sizeFigureToPanel.settled) {
    sizeFigureToPanel.settled = true;
    window.setTimeout(() => { sizeFigureToPanel.settled = false; sizeFigureToPanel(); }, 120);
  }
  // The figure sits in a centred grid, so shrinking it also moves its top down: measure, adjust,
  // and settle over up to three passes rather than assuming where it will land.
  let height = Math.min(window.innerHeight * 0.56, figure.getBoundingClientRect().height || window.innerHeight * 0.56);
  for (let pass = 0; pass < 5; pass += 1) {
    figure.style.height = `${Math.max(200, height)}px`;
    const box = figure.getBoundingClientRect();
    const room = panel.getBoundingClientRect().top - box.bottom - 20;
    if (room >= -1) break;
    if (height <= 200) break;
    // A centred figure moves half of every shrink, so correct by twice the overshoot.
    height += room * 2;
    if (height <= 200) break;
  }
}
// Guarded: the tests import this module in Node, where there is no window.
if (typeof window !== 'undefined') window.addEventListener('resize', () => sizeFigureToPanel());

/** Scroll just enough that the picked group (and its label) sits above the panel, never under it. */
function revealAbovePanel(map, id) {
  const panel = el('pick');
  const rects = [...map.querySelectorAll(`.hotspot[data-muscle="${id}"]`)].map((path) => path.getBoundingClientRect());
  const label = el('map-label');
  if (label?.classList.contains('is-on')) rects.push(label.getBoundingClientRect());
  if (!panel || !rects.length) return;
  const top = Math.min(...rects.map((r) => r.top));
  const bottom = Math.max(...rects.map((r) => r.bottom));
  // From the panel's resting height, not its rect: on its first frame it may still be sliding in.
  const limit = window.innerHeight - panel.offsetHeight - 12;
  let dy = 0;
  if (bottom > limit) dy = bottom - limit;
  else if (top < 8) dy = top - 8;
  if (top - dy < 8) dy = top - 8; // a group taller than the room left: keep its top in view
  if (Math.abs(dy) >= 1) window.scrollBy({ top: Math.round(dy), behavior: reducedMotion() ? 'instant' : 'smooth' });
}

function selectGroup(id) {
  const map = el('map');
  const panel = el('pick');
  if (!map || !panel || !BY_MUSCLE[id]) return;
  const opening = !panel.open;
  picked = id;
  showGroup(map, id, 'lit');
  if (opening) {
    panel.show();
    document.documentElement.classList.add('pick-open');
    if (!pickEntry) {
      history.pushState({ gaPick: true }, '');
      pickEntry = true;
    }
  }
  renderPick('.level-choice[aria-checked="true"]');
  revealAbovePanel(map, id);
}

/** Close the panel with no navigation. `viaHistory` false: Back already popped its entry. */
function closePick({ restoreFocus = true, viaHistory = true } = {}) {
  const id = picked;
  const entry = pickEntry; // dismissPick clears it
  dismissPick();
  if (entry && viaHistory) {
    skipPops += 1;
    history.back();
  }
  const map = el('map');
  if (map) showGroup(map, null);
  if (restoreFocus && id && map) {
    quietFocus = true;
    map.querySelector(`.hotspot[data-muscle="${id}"]`)?.focus({ preventScroll: true });
    quietFocus = false;
  }
}

/** Drop the selection and hide the panel; history and focus are the caller's business. */
function dismissPick() {
  picked = null;
  pickEntry = false;
  const panel = el('pick');
  if (panel?.open) panel.close();
  document.documentElement.classList.remove('pick-open');
  if (goalsStale) { goalsStale = false; renderGoals(); }
}

function startPicked() {
  const id = picked;
  if (!id) return;
  openMuscle(id, { level: usableLevel(id, pickLevel), fresh: true });
}

function wirePick() {
  const panel = el('pick');
  if (!panel) return;
  const choose = (value) => {
    pickLevel = choiceFor(value).value;
    renderPick('.level-choice[aria-checked="true"]');
  };
  panel.addEventListener('click', (event) => {
    const choice = event.target.closest('.level-choice');
    if (choice) { if (!choice.disabled) choose(choice.dataset.level); return; }
    const action = event.target.closest('[data-pick]')?.dataset.pick;
    if (action === 'start') startPicked();
    else if (action === 'close') closePick();
    else if (action === 'save') {
      setGoal(picked, !isGoal(picked));
      renderPick('[data-pick="save"]');
    }
  });
  wireLevelKeys(panel, choose);
}

/* -------------------------------------------------------------- the peek */

let peekFor = null;
let peekClosed = null;

/** One bottom sheet for every body part: see the movements, add to my goals, or close. */
function peekSheet() {
  let sheet = el('peek');
  if (sheet) return sheet;
  sheet = document.createElement('dialog');
  sheet.className = 'peek';
  sheet.id = 'peek';
  sheet.setAttribute('aria-labelledby', 'peek-title');
  sheet.setAttribute('aria-describedby', 'peek-n');
  sheet.innerHTML = `
    <div class="peek-body">
      <span class="peek-grab" aria-hidden="true"></span>
      <h2 class="peek-title" id="peek-title"></h2>
      <p class="peek-n" id="peek-n"></p>
      <p class="peek-status" id="peek-status" role="status" aria-live="polite"></p>
      <div class="peek-actions">
        <button class="btn btn-ember" type="button" data-peek="see"></button>
        <button class="btn btn-quiet" type="button" data-peek="goal"></button>
        <button class="btn btn-quiet" type="button" data-peek="close">Close</button>
      </div>
    </div>`;
  document.body.append(sheet);

  const goalButton = sheet.querySelector('[data-peek="goal"]');
  const label = () => {
    const on = isGoal(peekFor);
    goalButton.textContent = on ? 'Remove from my goals' : 'Add to my goals';
    goalButton.setAttribute('aria-pressed', String(on));
  };
  sheet.addEventListener('ga:label', label);

  let swiped = false;
  let downOnSheet = false;
  let start = null;
  sheet.addEventListener('pointerdown', (event) => {
    swiped = false;
    downOnSheet = event.target === sheet;
    start = { x: event.clientX, y: event.clientY };
  });
  // Swipe down anywhere on the sheet closes it, as a bottom sheet should.
  sheet.addEventListener('pointerup', (event) => {
    if (!start) return;
    const dy = event.clientY - start.y;
    const dx = Math.abs(event.clientX - start.x);
    start = null;
    if (dy > 64 && dy > dx * 1.5) { swiped = true; sheet.close(); }
  });
  sheet.addEventListener('click', (event) => {
    if (swiped) { swiped = false; return; }
    // A tap on the dimmed page around the sheet lands on the <dialog> itself.
    if (event.target === sheet) { if (downOnSheet) sheet.close(); return; }
    const action = event.target.closest('[data-peek]')?.dataset.peek;
    if (action === 'close') sheet.close();
    if (action === 'goal') {
      const on = !isGoal(peekFor);
      setGoal(peekFor, on);
      el('peek-status').textContent = on ? 'Added to your goals' : 'Removed from your goals';
      label();
    }
    if (action === 'see') {
      const id = peekFor;
      sheet.close();
      openMuscle(id, { level: peekLevel(id), fresh: true });
    }
  });
  sheet.addEventListener('close', () => {
    const done = peekClosed;
    peekClosed = null;
    done?.();
  });
  return sheet;
}

function openPeek(id, onClose = null) {
  const muscle = BY_MUSCLE[id];
  if (!muscle) return;
  const sheet = peekSheet();
  if (sheet.open) sheet.close();
  peekFor = id;
  peekClosed = onClose;
  const level = peekLevel(id);
  const n = movesFor(id, { level }).length;
  el('peek-title').textContent = muscle.name;
  el('peek-n').textContent = level === 'all' ? plural(n, 'movement') : `${n} of ${MOVES[id]} movements · ${choiceFor(level).label}`;
  el('peek-status').textContent = '';
  sheet.querySelector('[data-peek="see"]').textContent = `See the ${plural(n, 'movement')}`;
  sheet.dispatchEvent(new Event('ga:label'));
  sheet.showModal();
}

/** With a group selected on the map, the peek honours the level chosen in its panel. */
const peekLevel = (id) => (picked ? usableLevel(id, pickLevel) : 'all');

function route() {
  // no rep outlives its page: stop it before the markup goes
  stopDiagrams();
  app().classList.remove('no-stagger');
  dismissPick();
  const hash = location.hash.replace(/^#/, '').replace(/^\//, '');
  if (hash && BY_MUSCLE[hash]) {
    const muscle = BY_MUSCLE[hash];
    state.muscle = hash;
    state.view = viewFor(hash);
    app().innerHTML = viewMuscle(muscle);
    wireMuscle(muscle);
    return;
  }
  state.muscle = null;
  app().innerHTML = viewMap();
  wireMap();
}

function boot() {
  window.addEventListener('hashchange', route);
  // One listener for every body-part button the app draws: chips, list rows, goals, the ⋯ buttons.
  app().addEventListener('click', (event) => {
    const more = event.target.closest('[data-more]');
    if (more) { openPeek(more.dataset.more); return; }
    const jump = event.target.closest('[data-jump]');
    if (jump) { openMuscle(jump.dataset.jump); return; }
    if (event.target.closest('#goals-all')) {
      goalsExpanded = !goalsExpanded;
      renderGoals();
      el('goals-all')?.focus();
    }
  });
  // Back closes the panel; Esc does too (a non-modal dialog has no Esc of its own).
  window.addEventListener('popstate', () => {
    if (skipPops) { skipPops -= 1; return; }
    if (el('pick')?.open) closePick({ viaHistory: false });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !el('pick')?.open || el('peek')?.open || el('welcome')?.open) return;
    event.preventDefault();
    closePick();
  });
  onGoalsChange(() => {
    // The goals strip sits above the map: drawing it now would push the figure under the panel.
    if (picked) goalsStale = true;
    else renderGoals();
    const pill = el('goal-pill');
    if (pill && state.muscle) pill.hidden = !isGoal(state.muscle);
  });
  route();
  // Offline after the first load: sw.js keeps the app's own files and nothing else.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register(new URL('./sw.js', import.meta.url)).catch(() => {});
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') boot();

export { exercisesFor, MUSCLES, EXERCISES, pickContent, viewMuscleFor };

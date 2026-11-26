// Gains Atlas — tap a body part, get the exercises. One vanilla module, no build step.
import { MUSCLES, BY_MUSCLE } from './muscles.js';
import { EXERCISES, EQUIPMENT_LABEL, exercisesFor } from './exercises.js';
import { FRONT_FIGURE, BACK_FIGURE, VIEWBOX } from './body-map.js';
import { diagramFor } from './diagram.js';

const state = {
  muscle: null,
  view: 'front',
  place: 'all',
  level: 'all',
  equipment: 'all',
};

const FIGURES = { front: FRONT_FIGURE, back: BACK_FIGURE };
const SVG_NS = 'http://www.w3.org/2000/svg';
const INTRO_KEY = 'ga-intro-seen';

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
    .replace('class="figure"', 'class="figure mini is-engaged" aria-hidden="true" focusable="false"')
    .replace(/ role="button" tabindex="0"/g, ' tabindex="-1"')
    .replaceAll(`class="hotspot" data-muscle="${id}"`, `class="hotspot is-lit" data-muscle="${id}"`);
}

function chip(muscle) {
  const n = MOVES[muscle.id];
  return `<li><button class="chip" type="button" data-jump="${muscle.id}" aria-label="${escapeHtml(muscle.name)}, ${plural(n, 'movement')}">
    <span class="chip-name">${escapeHtml(muscle.name)}</span><span class="chip-n">${n}</span></button></li>`;
}

const hintFor = (view) => `${capital(view)} view · ${ON_VIEW[view].length} target areas. Tap one.`;

/* ------------------------------------------------------------------ views */

function viewMap() {
  const on = (view) => state.view === view;
  return `
    <section class="hero">
      <div class="hero-photo" role="img" aria-label="A bodybuilder on stage, lit from the side">
        <h1 class="hero-mark"><span class="mark-1">Gains</span> <span class="mark-2">Atlas</span></h1>
      </div>
      <div class="hero-copy">
        <p class="lede">A gym aid for building specific muscles. Tap a body part, get every movement for it.</p>
        <p class="hero-stat"><strong>${EXERCISES.length}</strong> movements · <strong>${MUSCLES.length}</strong> body parts</p>
        <p class="hero-free">Free to use. Works offline once installed.</p>
      </div>
    </section>

    <div class="map-tabs" role="tablist" aria-label="Body view">
      <button class="tab${on('front') ? ' is-on' : ''}" id="tab-front" role="tab" aria-selected="${on('front')}" aria-controls="map" type="button">Front</button>
      <button class="tab${on('back') ? ' is-on' : ''}" id="tab-back" role="tab" aria-selected="${on('back')}" aria-controls="map" type="button">Back</button>
    </div>
    <p class="map-hint" id="map-hint">${hintFor(state.view)}</p>

    <div class="stage">
      <div class="map" id="map" data-view="${state.view}">${FIGURES[state.view]}</div>
      <div class="map-label" id="map-label" aria-hidden="true"><span class="map-label-name"></span><span class="map-label-n"></span></div>
    </div>

    <p class="overline" id="all-groups">All target areas</p>
    <ul class="chips" aria-labelledby="all-groups">${BY_REGION.map(chip).join('')}</ul>

    <p class="disclaimer">General training guidance, not medical advice. If something hurts, stop and ask a coach or a doctor.</p>`;
}

const LEVELS = ['all', 'beginner', 'intermediate', 'advanced'];
const option = (value, label, current) => `<option value="${value}"${current === value ? ' selected' : ''}>${label}</option>`;

function viewMuscle(muscle) {
  const list = exercisesFor(muscle.id, state);
  const total = MOVES[muscle.id];

  return `
    <button class="back" id="back" type="button"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M10 3.5L5.5 8l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Body map</button>
    <header class="muscle-head">
      <div class="mini-wrap">${miniFigure(muscle.id)}</div>
      <div class="muscle-title">
        <p class="overline">${escapeHtml(muscle.latin)}</p>
        <h1>${escapeHtml(muscle.name)}</h1>
        <p class="count" aria-live="polite"><b>${list.length}</b> of <b>${total}</b> exercise${total === 1 ? '' : 's'}</p>
      </div>
    </header>
    <p class="muscle-blurb">${escapeHtml(muscle.blurb)}${muscle.joint ? ' <span class="joint-note">A joint, not a muscle: these movements load the muscles and tendons that move it.</span>' : ''}</p>

    <div class="filters" role="group" aria-label="Filter the list">
      <label class="filter${state.place !== 'all' ? ' is-set' : ''}"><span>Where</span>
        <select id="f-place">
          ${option('all', 'Anywhere', state.place)}${option('home', 'Home', state.place)}${option('gym', 'Gym', state.place)}
        </select>
      </label>
      <label class="filter${state.level !== 'all' ? ' is-set' : ''}"><span>Level</span>
        <select id="f-level">
          ${LEVELS.map((value) => option(value, value === 'all' ? 'Any level' : capital(value), state.level)).join('')}
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

    <div class="other">
      <p class="eyebrow">Also on the map</p>
      <ul class="chips">${MUSCLES.filter((m) => m.id !== muscle.id).map(chip).join('')}</ul>
    </div>`;
}

const ICON_CHEVRON = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_WARN = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1.8l6.6 11.7H1.4z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.3v3.4M8 11.6v.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const LEVEL_STEPS = { beginner: 1, intermediate: 2, advanced: 3 };

const levelBars = (level) => `<span class="level" aria-hidden="true">${[1, 2, 3]
  .map((step) => `<i${step <= LEVEL_STEPS[level] ? ' class="on"' : ''}></i>`).join('')}</span>`;

function stepsList(steps) {
  return `<ol class="ex-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>`;
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
            <figure class="ex-diagram" aria-label="How to do a ${escapeHtml(exercise.name)}, start and end position">${diagramFor(exercise)}</figure>
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

function openMuscle(id) {
  const muscle = BY_MUSCLE[id];
  if (!muscle) return;
  // Where you train carries over; a level or kit picked for one body part does not, or the next
  // list opens half-empty for no visible reason.
  if (state.muscle !== id) {
    state.level = 'all';
    state.equipment = 'all';
  }
  state.muscle = id;
  state.view = viewFor(id);
  app().innerHTML = viewMuscle(muscle);
  location.hash = `#/${id}`;
  wireMuscle(muscle);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function wireMuscle(muscle) {
  document.body.classList.remove('is-home');
  el('back').addEventListener('click', () => { location.hash = '#/'; });
  const refilter = (key) => (event) => {
    state[key] = event.target.value;
    app().innerHTML = viewMuscle(muscle);
    wireMuscle(muscle);
    app().classList.add('no-stagger');
    el(`f-${key}`)?.focus();
  };
  el('f-place').addEventListener('change', refilter('place'));
  el('f-level').addEventListener('change', refilter('level'));
  el('f-equipment').addEventListener('change', refilter('equipment'));
  document.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => openMuscle(button.dataset.jump));
  });
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
    const path = svg.querySelector('.skin');
    const length = path ? path.getTotalLength() : 0;
    for (let at = 0; at <= length; at += 0.5) {
      const point = path.getPointAtLength(at);
      const row = Math.floor(point.y / 2);
      if (row >= 0 && row < rows.length) rows[row] = Math.min(rows[row], point.x);
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

function wireMap() {
  document.body.classList.add('is-home');
  const map = el('map');
  let going = false;

  // Tap: the group lights and the body dims for a beat, then the body-part screen opens.
  const pick = (target) => {
    const hit = target.closest('[data-muscle]');
    if (!hit || going) return;
    const id = hit.dataset.muscle;
    if (reducedMotion()) { openMuscle(id); return; }
    going = true;
    showGroup(map, id, 'lit');
    window.setTimeout(() => openMuscle(id), 220);
  };

  map.addEventListener('click', (event) => pick(event.target));
  map.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(event.target);
    }
  });

  map.addEventListener('pointerover', (event) => {
    if (going || event.pointerType === 'touch') return;
    const hit = event.target.closest?.('[data-muscle]');
    if (hit) showGroup(map, hit.dataset.muscle, 'preview');
    else if (!map.contains(document.activeElement)) showGroup(map, null);
  });
  map.addEventListener('focusin', (event) => {
    if (going) return;
    const hit = event.target.closest?.('[data-muscle]');
    if (hit) showGroup(map, hit.dataset.muscle, 'lit');
  });
  map.addEventListener('pointerleave', () => {
    if (!going && !map.contains(document.activeElement)) showGroup(map, null);
  });
  map.addEventListener('focusout', (event) => {
    if (!going && !map.contains(event.relatedTarget)) showGroup(map, null);
  });

  const front = el('tab-front');
  const back = el('tab-back');
  const show = (which) => {
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

  document.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => openMuscle(button.dataset.jump));
  });

  const svg = map.querySelector('svg');
  if (svg) introSweep(svg);
}

function route() {
  app().classList.remove('no-stagger');
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
  route();
  // Offline after the first load: sw.js keeps the app's own files and nothing else.
  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register(new URL('./sw.js', import.meta.url)).catch(() => {});
  }
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') boot();

export { exercisesFor, MUSCLES, EXERCISES };

// Body Anvil — tap a muscle, get the exercises. One vanilla module, no build step.
import { MUSCLES, BY_MUSCLE } from './muscles.js';
import { EXERCISES, EQUIPMENT_LABEL, exercisesFor } from './exercises.js';
import { FRONT_FIGURE, BACK_FIGURE } from './body-map.js';

const state = {
  muscle: null,
  place: 'all',
  level: 'all',
  equipment: 'all',
};

const el = (id) => document.getElementById(id);
const app = () => el('app');

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ------------------------------------------------------------------ views */

function viewMap() {
  const total = MUSCLES.length;
  return `
    <section class="hero">
      <div class="hero-photo" role="img" aria-label="A bodybuilder on stage, muscles under the lights"></div>
      <div class="hero-copy">
        <p class="kicker">Tap a muscle · get the work</p>
        <h1>Gains <span>Atlas</span></h1>
        <p class="lede">Press the part you want to grow. Every exercise for it is on the next screen: sets, reps, rest, and the mistake to avoid.</p>
        <p class="hero-stat"><strong>89</strong> moves · <strong>16</strong> muscle groups · home or gym</p>
      </div>
    </section>

    <div class="map-tabs" role="tablist" aria-label="Body view">
      <button class="tab is-on" id="tab-front" role="tab" aria-selected="true" type="button">Front</button>
      <button class="tab" id="tab-back" role="tab" aria-selected="false" type="button">Back</button>
    </div>

    <div class="map" id="map">${FRONT_FIGURE}</div>
    <p class="map-hint" id="map-hint">${total} muscle groups · tap one</p>

    <ul class="chips" aria-label="All muscle groups">
      ${MUSCLES.map((muscle) => `<li><button class="chip" type="button" data-jump="${muscle.id}">${escapeHtml(muscle.name)}</button></li>`).join('')}
    </ul>

    <p class="disclaimer">General training guidance, not medical advice. If something hurts, stop and ask a coach or a doctor.</p>`;
}

function viewMuscle(muscle) {
  const list = exercisesFor(muscle.id, state);
  const total = exercisesFor(muscle.id).length;

  return `
    <button class="back" id="back" type="button">← Body map</button>
    <header class="muscle-head">
      <p class="kicker">${escapeHtml(muscle.latin)}</p>
      <h1>${escapeHtml(muscle.name)}</h1>
      <p class="lede">${escapeHtml(muscle.blurb)}</p>
      <p class="count">${list.length} of ${total} exercise${total === 1 ? '' : 's'}</p>
    </header>

    <div class="filters">
      <label class="filter"><span>Where</span>
        <select id="f-place">
          ${['all', 'home', 'gym'].map((value) => `<option value="${value}" ${state.place === value ? 'selected' : ''}>${value === 'all' ? 'Anywhere' : value === 'home' ? 'Home' : 'Gym'}</option>`).join('')}
        </select>
      </label>
      <label class="filter"><span>Level</span>
        <select id="f-level">
          ${['all', 'beginner', 'intermediate', 'advanced'].map((value) => `<option value="${value}" ${state.level === value ? 'selected' : ''}>${value === 'all' ? 'Any level' : value[0].toUpperCase() + value.slice(1)}</option>`).join('')}
        </select>
      </label>
      <label class="filter"><span>Kit</span>
        <select id="f-equipment">
          <option value="all" ${state.equipment === 'all' ? 'selected' : ''}>Any kit</option>
          ${Object.entries(EQUIPMENT_LABEL).map(([value, label]) => `<option value="${value}" ${state.equipment === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>
    </div>

    ${list.length ? `<ul class="exercises">${list.map(exerciseCard).join('')}</ul>`
      : `<p class="empty">Nothing matches those filters. Widen one and the list fills up again.</p>`}

    <div class="other">
      <p class="eyebrow">Also on the map</p>
      <ul class="chips">${MUSCLES.filter((m) => m.id !== muscle.id).map((m) => `<li><button class="chip" type="button" data-jump="${m.id}">${escapeHtml(m.name)}</button></li>`).join('')}</ul>
    </div>`;
}

function exerciseCard(exercise) {
  const secondary = exercise.secondary.map((id) => BY_MUSCLE[id]?.name).filter(Boolean);
  return `
    <li class="exercise">
      <details>
        <summary>
          <span class="ex-name">${escapeHtml(exercise.name)}</span>
          <span class="ex-meta">
            <span class="tag tag-${exercise.level}">${exercise.level}</span>
            <span class="tag">${EQUIPMENT_LABEL[exercise.equipment]}</span>
            <span class="tag">${exercise.place === 'home' ? 'Home' : 'Gym'}</span>
          </span>
          <span class="ex-dose">${escapeHtml(exercise.sets)} × ${escapeHtml(exercise.reps)} · ${escapeHtml(exercise.rest)} rest</span>
        </summary>
        <div class="ex-body">
          <p><strong>How:</strong> ${escapeHtml(exercise.cue)}</p>
          <p><strong>Avoid:</strong> ${escapeHtml(exercise.avoid)}</p>
          ${secondary.length ? `<p class="ex-secondary">Also works: ${secondary.map(escapeHtml).join(', ')}</p>` : ''}
        </div>
      </details>
    </li>`;
}

/* ------------------------------------------------------------ interaction */

function openMuscle(id) {
  const muscle = BY_MUSCLE[id];
  if (!muscle) return;
  state.muscle = id;
  app().innerHTML = viewMuscle(muscle);
  location.hash = `#/${id}`;
  wireMuscle(muscle);
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function wireMuscle(muscle) {
  el('back').addEventListener('click', () => { location.hash = '#/'; });
  el('f-place').addEventListener('change', (event) => { state.place = event.target.value; app().innerHTML = viewMuscle(muscle); wireMuscle(muscle); });
  el('f-level').addEventListener('change', (event) => { state.level = event.target.value; app().innerHTML = viewMuscle(muscle); wireMuscle(muscle); });
  el('f-equipment').addEventListener('change', (event) => { state.equipment = event.target.value; app().innerHTML = viewMuscle(muscle); wireMuscle(muscle); });
  document.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => openMuscle(button.dataset.jump));
  });
}

function wireMap() {
  const map = el('map');
  const pick = (target) => {
    const hit = target.closest('[data-muscle]');
    if (hit) openMuscle(hit.dataset.muscle);
  };
  // Keep the figure on screen while the map is being used: on a phone the lower hotspots
  // (forearms, quads) sit below the fold and a tap there used to land outside the viewport.
  const keepInView = () => {
    const map = el('map');
    if (!map) return;
    const rect = map.getBoundingClientRect();
    if (rect.bottom > window.innerHeight - 80) {
      map.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  };
  keepInView();
  map.addEventListener('click', (event) => pick(event.target));
  map.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(event.target);
    }
  });

  const front = el('tab-front');
  const back = el('tab-back');
  const show = (which) => {
    map.innerHTML = which === 'front' ? FRONT_FIGURE : BACK_FIGURE;
    front.classList.toggle('is-on', which === 'front');
    back.classList.toggle('is-on', which === 'back');
    front.setAttribute('aria-selected', String(which === 'front'));
    back.setAttribute('aria-selected', String(which === 'back'));
    el('map-hint').textContent = which === 'front'
      ? 'Chest · shoulders · biceps · forearms · abs · lower abs · obliques · quads'
      : 'Neck · upper back · lats · lower back · triceps · glutes · hamstrings · calves';
  };
  front.addEventListener('click', () => show('front'));
  back.addEventListener('click', () => show('back'));

  document.querySelectorAll('[data-jump]').forEach((button) => {
    button.addEventListener('click', () => openMuscle(button.dataset.jump));
  });
}

function route() {
  const hash = location.hash.replace(/^#/, '').replace(/^\//, '');
  if (hash && BY_MUSCLE[hash]) {
    const muscle = BY_MUSCLE[hash];
    state.muscle = hash;
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
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') boot();

export { exercisesFor, MUSCLES, EXERCISES };

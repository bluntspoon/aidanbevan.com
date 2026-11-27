// Tap a drawing and the stick figure performs one rep: start -> finish -> start.
//
// The archetypes in diagram.js carry two complete joint sets on the same 120x120 box: `ghost`
// (where the rep starts) and `solid` (the position that names the movement), drawn on one skeleton:
// every bone has the same length in both. This module moves the figure between them as that
// skeleton: each bone turns about its parent joint at its one length, so an elbow or a knee bends
// through the in-between angles instead of sliding along a straight line, and nothing stretches.
// Joints that do not move (feet on the floor, hands on a bar or the floor) are planted, and the
// joint between a planted end and the rest of the body is solved with two-bone IK so the foot stays
// put while the knee bends. Where no bend of the bones can reach a planted end, the bones win: the
// end slips the little it has to, rather than a limb growing to reach it.
//
// One rep at a time, on the whole page. Nothing runs when reduced motion is asked for, when the
// tab is hidden, or once the drawing has left the screen or the page.
import { diagramPose, diagramFrame, diagramArrows, BONES, settleBones } from './diagram.js';

/* ------------------------------------------------------------------ the skeleton */

// Parent-child links: the skeleton's bones, drawn (limbs) or not (head to neck, shoulders to the
// neck in a front view), all of which keep their length.
const LINKS = BONES;
// Where the figure is held from when something is planted: feet first, then hands, then the rest.
const ROOTS = {
  side: ['a', 'A', 't', 'T', 'w', 'W', 'k', 'K', 'p', 's', 'h'],
  front: ['al', 'ar', 'tl', 'tr', 'hl', 'hr', 'kl', 'kr', 'q', 'n', 'h'],
};
const FREE_ROOT = { side: 'p', front: 'q' };
const PLANTED = 1.5; // design units: a joint that travels less than this is planted

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const len = (v) => Math.hypot(v[0], v[1]);
const mix = (a, b, t) => a + (b - a) * t;
const lerpPt = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
/** The signed shortest turn from angle a to angle b, in (-PI, PI]. */
function turn(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d <= -Math.PI) d += 2 * Math.PI;
  return d;
}

/**
 * Everything about one drawing's movement that does not change from frame to frame: the tree of
 * bones from a root, each bone's two lengths and angles, and which joints are planted.
 * Returns null when there is nothing to animate (no ghost pose).
 */
export function motionFor(id) {
  const pose = diagramPose(id);
  if (!pose.ghost) return null;
  // Hold the figure from each planted joint in turn (feet first) and keep the one that keeps the
  // planted hands and feet truest to where they are drawn through the rep: a glute bridge is held
  // at the shoulders and swings the hips up, a pull-up hangs from the hands, a squat stands on its feet.
  const first = build(id, pose, null);
  let best = first;
  let bestScore = score(first);
  for (const root of first.candidates) {
    if (bestScore < 0.05) break;
    const m = build(id, pose, root);
    const sc = score(m);
    if (sc < bestScore - 0.05) { best = m; bestScore = sc; }
  }
  best.strain = strain(best);
  return best;
}

const score = (m) => slip(m) + 100 * strain(m);

/** The farthest a planted joint strays from its place during the rep, in design units. */
export function slip(m, samples = 24) {
  let worst = 0;
  for (let i = 1; i < samples; i += 1) {
    const u = i / samples;
    const j = poseAt(m, u);
    for (const k of m.planted) {
      const want = lerpPt(m.start[k] ?? m.end[k], m.end[k] ?? m.start[k], u);
      worst = Math.max(worst, len(sub(j[k], want)));
    }
  }
  return worst;
}

/** How far any bone strays outside its two drawn lengths during the rep (0.1 = 10% too short or long). */
export function strain(m, samples = 24) {
  let worst = 0;
  for (let i = 1; i < samples; i += 1) {
    const j = poseAt(m, i / samples);
    for (const [k, bone] of m.bones) {
      const p = m.parent.get(k);
      const L = len(sub(j[k], j[p]));
      const lo = Math.min(bone.L0, bone.L1);
      const hi = Math.max(bone.L0, bone.L1);
      if (lo < 1) continue;
      worst = Math.max(worst, L < lo ? (lo - L) / lo : L > hi ? (L - hi) / hi : 0);
    }
  }
  return worst;
}

function build(id, pose, forcedRoot) {
  const view = pose.view === 'front' ? 'front' : 'side';
  const start = pose.ghost;
  const end = pose.solid;
  const keys = Object.keys({ ...start, ...end });
  const at0 = (k) => start[k] ?? end[k];
  const at1 = (k) => end[k] ?? start[k];
  const planted = new Set(keys.filter((k) => len(sub(at0(k), at1(k))) < PLANTED));

  // links that exist in this pose; a mid-spine point replaces the straight shoulder-hip link
  const links = LINKS[view].filter(([a, b]) => keys.includes(a) && keys.includes(b)
    && !(a === 's' && b === 'p' && keys.includes('m')));
  const adj = new Map(keys.map((k) => [k, []]));
  for (const [a, b] of links) { adj.get(a).push(b); adj.get(b).push(a); }

  const preferred = [...ROOTS[view], ...keys].filter((k, i, all) => planted.has(k) && keys.includes(k) && all.indexOf(k) === i);
  const root = forcedRoot ?? preferred[0] ?? (keys.includes(FREE_ROOT[view]) ? FREE_ROOT[view] : keys[0]);
  const parent = new Map([[root, null]]);
  const order = [root];
  for (let i = 0; i < order.length; i += 1) {
    for (const next of adj.get(order[i])) {
      if (!parent.has(next)) { parent.set(next, order[i]); order.push(next); }
    }
  }
  // joints the skeleton does not reach (none today) simply glide
  for (const k of keys) if (!parent.has(k)) { parent.set(k, null); order.push(k); }

  const children = new Map(keys.map((k) => [k, []]));
  for (const k of order) if (parent.get(k)) children.get(parent.get(k)).push(k);

  const bones = new Map();
  for (const k of order) {
    const p = parent.get(k);
    if (!p) continue;
    const v0 = sub(at0(k), at0(p));
    const v1 = sub(at1(k), at1(p));
    const a0 = Math.atan2(v0[1], v0[0]);
    const a1 = Math.atan2(v1[1], v1[0]);
    const bone = { L0: len(v0), L1: len(v1), a0, da: turn(a0, a1) };
    // a drawing may say where a bone points halfway through the rep: it turns there, then on
    const via = pose.via;
    if (via?.[k] && via[p]) {
      const am = Math.atan2(via[k][1] - via[p][1], via[k][0] - via[p][0]);
      Object.assign(bone, { am, d1: turn(a0, am), d2: turn(am, a1) });
    }
    bones.set(k, bone);
  }

  // A moving joint between a placed parent and a planted child is solved by two-bone IK, so the
  // planted end stays put and both bones keep their lengths. That needs the limb bent to the same
  // side in both drawings; when it is not (hips sagging, then raised through the line) the bones
  // simply turn from one drawing to the other and the planted end slips a little on the way.
  const ik = new Map();
  for (const k of order) {
    const p = parent.get(k);
    if (!p || planted.has(k)) continue;
    const c = children.get(k).find((ch) => planted.has(ch));
    if (!c) continue;
    // signed distance of the joint off the parent-to-planted line, at the start and the finish;
    // a limb drawn straight (within 2 units) takes the bend side of the other drawing
    const off = (at) => cross(sub(at(c), at(p)), sub(at(k), at(p))) / (len(sub(at(c), at(p))) || 1);
    const h0 = off(at0);
    const h1 = off(at1);
    const s1 = Math.abs(h1) >= 2 ? Math.sign(h1) : Math.sign(h0) || 1;
    const s0 = Math.abs(h0) >= 2 ? Math.sign(h0) : s1;
    if (s0 !== s1) continue;
    // and the IK answer has to be the drawing itself at both ends, or the knee would jump off it
    const b = bones.get(k);
    const cb = bones.get(c);
    const fits = (at, L1, L2) => {
      const solved = twoBone(at(p), at(c), L1, L2, s0);
      return solved && len(sub(solved, at(k))) < 0.6;
    };
    if (!fits(at0, b.L0, cb.L0) || !fits(at1, b.L1, cb.L1)) continue;
    ik.set(k, { child: c, side: s0 });
  }

  // nothing goes below the floor, or below the lowest joint of either drawing if that is lower
  const floor = pose.floor == null ? null
    : Math.max(pose.floor, ...keys.map((k) => Math.max(at0(k)[1], at1(k)[1])));
  return { id, view, pose, start, end, keys, planted, root, order, parent, bones, ik, floor, candidates: preferred.slice(1) };
}

/** The pose `u` of the way from start (0) to finish (1). The endpoints are the archetype's own joints. */
export function poseAt(m, u) {
  if (u <= 0) return copy(m.start, m.end);
  if (u >= 1) return copy(m.end, m.start);
  const out = {};
  const at0 = (k) => m.start[k] ?? m.end[k];
  const at1 = (k) => m.end[k] ?? m.start[k];
  for (const k of m.order) {
    const p = m.parent.get(k);
    if (!p) { out[k] = lerpPt(at0(k), at1(k), u); continue; }
    const bone = m.bones.get(k);
    const L = mix(bone.L0, bone.L1, u);
    const reach = (dir) => {
      const d = len(dir) || 1;
      return [out[p][0] + (dir[0] / d) * L, out[p][1] + (dir[1] / d) * L];
    };
    if (m.planted.has(k)) {
      // a planted joint stays on its line at its bone's length from the joint before it
      out[k] = reach(sub(lerpPt(at0(k), at1(k), u), out[p]));
      continue;
    }
    const a = bone.am == null ? bone.a0 + bone.da * u
      : u < 0.5 ? bone.a0 + bone.d1 * u * 2 : bone.am + bone.d2 * (u * 2 - 1);
    const free = [Math.cos(a), Math.sin(a)];
    const solve = m.ik.get(k);
    if (solve) {
      const c = solve.child;
      const cb = m.bones.get(c);
      const placed = twoBone(out[p], lerpPt(at0(c), at1(c), u), L, mix(cb.L0, cb.L1, u), solve.side);
      if (placed) { out[k] = reach(sub(placed, out[p])); continue; }
    }
    out[k] = reach(free);
  }
  return onFloor(m, settle(m, out, u), u);
}

/**
 * A joint the turning bones would sweep through the floor (a mountain climber's foot as the knee
 * comes forward) is held on it instead, and the joints above give way, keeping every bone's length:
 * the foot drags along the floor. If the lengths cannot be kept that way, the frame stays as it was.
 */
function onFloor(m, out, u) {
  if (m.floor == null) return out;
  const sunk = Object.keys(out).filter((k) => out[k][1] > m.floor + 1e-6);
  if (!sunk.length) return out;
  const next = { ...out };
  for (const k of sunk) next[k] = [out[k][0], m.floor];
  const held = new Set([...m.planted, ...sunk]);
  const bones = [...m.bones].map(([k, b]) => [m.parent.get(k), k, mix(b.L0, b.L1, u)]);
  // on the floor a joint may still slide along it
  const vars = m.order.filter((k) => !m.planted.has(k)).flatMap((k) => (held.has(k) ? [[k, 0]] : [[k, 0], [k, 1]]));
  return settleBones(next, bones, vars, undefined, 60) < 1e-9 ? next : out;
}

/**
 * Where the turning bones have carried a planted hand or foot off its place (the hips of a
 * Copenhagen plank swing out of the top leg's reach), put it back and let the joints between give
 * way, keeping every bone's length. If the lengths cannot be kept that way, the frame stays as it was.
 */
function settle(m, out, u) {
  // a planted joint hanging off another planted joint (a toe off a heel) follows it at its length
  const held = [...m.planted].filter((k) => !m.planted.has(m.parent.get(k)));
  const target = (k) => lerpPt(m.start[k] ?? m.end[k], m.end[k] ?? m.start[k], u);
  if (!held.some((k) => len(sub(out[k], target(k))) > 1e-6)) return out;
  const next = { ...out };
  for (const k of held) next[k] = target(k);
  const bones = [...m.bones].filter(([k]) => !m.planted.has(k) || held.includes(k))
    .map(([k, b]) => [m.parent.get(k), k, mix(b.L0, b.L1, u)]);
  const vars = m.order.filter((k) => !m.planted.has(k) && m.parent.has(k)).flatMap((k) => [[k, 0], [k, 1]]);
  if (settleBones(next, bones, vars, undefined, 60) > 1e-9) return out;
  for (const k of m.order) {
    const p = m.parent.get(k);
    if (!p || held.includes(k) || !m.planted.has(k)) continue;
    const d = sub(target(k), next[p]);
    const L = mix(m.bones.get(k).L0, m.bones.get(k).L1, u);
    next[k] = [next[p][0] + (d[0] / (len(d) || 1)) * L, next[p][1] + (d[1] / (len(d) || 1)) * L];
  }
  return next;
}

function copy(a, b) {
  const out = {};
  for (const k of Object.keys({ ...b, ...a })) out[k] = [...(a[k] ?? b[k])];
  return out;
}

/** The middle joint of a two-bone chain from `g` to `t` with bone lengths L1, L2, bent to `side`
 * (+1 or -1). Out of reach, the chain points straight at `t`. */
function twoBone(g, t, L1, L2, side) {
  const v = sub(t, g);
  const d = len(v);
  if (d < 1e-6) return null;
  // out of reach (or folded past itself): keep the bones' lengths and point the chain at the target
  const dc = Math.min(Math.max(d, Math.abs(L1 - L2) + 1e-6), L1 + L2 - 1e-6);
  const along = (L1 * L1 - L2 * L2 + dc * dc) / (2 * dc);
  const h = Math.sqrt(Math.max(0, L1 * L1 - along * along));
  const ux = v[0] / d;
  const uy = v[1] / d;
  // cross(v, mid - g) must have the sign `side`; the normal (-uy, ux) gives a positive cross
  return [g[0] + ux * along - uy * h * side, g[1] + uy * along + ux * h * side];
}

/* ------------------------------------------------------------------ the timeline */

export const REP = { up: 700, hold: 120, down: 700 };
export const REP_MS = REP.up + REP.hold + REP.down;
export const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2); // cubic in-out

/** Progress through one rep (0 start .. 1 finish .. 0 start) `ms` after it began. */
export function repAt(ms) {
  if (ms <= 0) return 0;
  if (ms < REP.up) return ease(ms / REP.up);
  if (ms < REP.up + REP.hold) return 1;
  if (ms < REP_MS) return 1 - ease((ms - REP.up - REP.hold) / REP.down);
  return 0;
}

/* ------------------------------------------------------------------ the page */

const motions = new Map();
const motionOf = (id) => {
  if (!motions.has(id)) motions.set(id, motionFor(id));
  return motions.get(id);
};
/** Whether tapping this exercise's drawing does anything. */
export const canAnimate = (id) => Boolean(motionOf(id));

const reduced = () => (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) || false;
/** Whether this browser should get the tappable drawings at all. */
export const motionAllowed = () => typeof window !== 'undefined' && typeof requestAnimationFrame === 'function' && !reduced();

const HINT_KEY = 'ga.diagram-played';
let playing = null; // { button, svg, raf, ... } — one rep on the whole page
let observer = null;
let hintShown = false;
let listening = false;

function stop() {
  const rep = playing;
  if (!rep) return;
  playing = null;
  cancelAnimationFrame(rep.raf);
  rep.svg.innerHTML = rep.still;
  rep.svg.setAttribute('data-playing', 'false');
  rep.svg.setAttribute('data-frame', '0');
  rep.button.classList.remove('is-playing');
  // the faint start pose and the arrow come back in, rather than popping
  if (rep.button.isConnected) {
    rep.button.classList.remove('is-settling');
    void rep.button.getBoundingClientRect();
    rep.button.classList.add('is-settling');
  }
}

function play(button) {
  const id = button.dataset.anim;
  const svg = button.querySelector('svg');
  const m = motionOf(id);
  if (!svg || !m || reduced() || document.hidden) return;
  stop();
  try { localStorage.setItem(HINT_KEY, '1'); } catch { /* storage blocked: this visit only */ }
  document.querySelectorAll('.ex-hint').forEach((hint) => { hint.hidden = true; });

  const still = svg.innerHTML;
  svg.innerHTML = `<g class="anim-arrows">${diagramArrows(id)}</g><g class="anim-rig"></g>`;
  const rig = svg.lastChild;
  button.classList.remove('is-settling');
  button.classList.add('is-playing');
  svg.setAttribute('data-playing', 'true');
  let frames = 0;
  const rep = { button, svg, still, raf: 0, t0: null };
  const draw = (u) => {
    rig.innerHTML = diagramFrame(id, poseAt(m, u), u);
    frames += 1;
    svg.setAttribute('data-frame', String(Math.round(u * 1000) / 1000));
    svg.setAttribute('data-frames', String(frames));
  };
  const tick = (now) => {
    if (playing !== rep) return;
    if (!svg.isConnected || document.hidden) { stop(); return; }
    if (rep.t0 === null) rep.t0 = now;
    const ms = now - rep.t0;
    if (ms >= REP_MS) { stop(); return; }
    draw(repAt(ms));
    rep.raf = requestAnimationFrame(tick);
  };
  playing = rep;
  svg.setAttribute('data-frames', '0');
  draw(0);
  rep.raf = requestAnimationFrame(tick);
}

function onVisibility() { if (document.hidden) stop(); }

/**
 * Make every playable drawing under `root` respond to a tap (or Enter / Space: they are buttons).
 * Call stopDiagrams() before the markup is replaced.
 */
export function wireDiagrams(root) {
  stopDiagrams();
  if (!motionAllowed()) return;
  const buttons = [...root.querySelectorAll('button.ex-diagram[data-anim]')];
  if (!buttons.length) return;
  if (!listening) { document.addEventListener('visibilitychange', onVisibility); listening = true; }
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (!entry.isIntersecting && playing?.button === entry.target) stop();
    });
  }
  let seen = false;
  try { seen = Boolean(localStorage.getItem(HINT_KEY)); } catch { /* storage blocked */ }
  for (const button of buttons) {
    const svg = button.querySelector('svg');
    svg?.setAttribute('data-playing', 'false');
    svg?.setAttribute('data-frame', '0');
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      play(button);
    });
    observer?.observe(button);
    const details = button.closest('details');
    details?.addEventListener('toggle', () => {
      if (!details.open) { if (playing && details.contains(playing.button)) stop(); return; }
      // the hint, once: under the first drawing opened, until a drawing has been played
      if (seen || hintShown) return;
      const hint = details.querySelector('.ex-hint');
      if (hint) { hint.hidden = false; hintShown = true; }
    });
  }
}

/** Stop the playing rep (if any) and let go of the observers. Safe to call any time. */
export function stopDiagrams() {
  stop();
  observer?.disconnect();
  observer = null;
}

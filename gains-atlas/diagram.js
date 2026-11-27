// Stick-figure diagrams for every movement: plain SVG strings on a 120x120 box.
//
// Every drawing is an explicit, hand-placed pose archetype (curl, squat, hinge, bench press ...)
// written as joint coordinates, not angles. An archetype returns:
//   solid  - the position that names the movement (the top of a curl, the bottom of a squat)
//   ghost  - where the rep starts, drawn at low opacity (only the limbs that move are drawn)
//   arrow  - a curved arrow from the ghost to the solid position
//   eq     - equipment in ember: bar, dumbbell, bench, cable, band, machine, kettlebell ...
//   joint  - the joint doing the work, marked with an ember dot
// Side views face right. Front views are used only where the movement is sideways.
//
// The table EXERCISE_DIAGRAMS maps every exercise id to an archetype and its options, so a wrong
// picture is corrected by editing one line. The whole scene is measured and scaled to fill the box
// with ~8px padding, so nothing floats in a corner. Same id, same string: nothing is random.

const SIZE = 120;
const PAD = 8;
const HEAD_R = 8.5; // output units
const JOINT_R = 4;
const LIMB_HALF = 3.5; // half of the 7px limb stroke
const HEAD_OUT = HEAD_R + 3; // radius plus half of the 6px head stroke
const FLOOR = 104; // design-space floor for standing figures (feet at y=100)

const r1 = (v) => {
  const x = Math.round(v * 10) / 10;
  return Object.is(x, -0) ? 0 : x;
};

/* ------------------------------------------------------------------ joints */

// Side view, facing right. h head, s shoulder, p hip; e/w near elbow/hand, E/W far elbow/hand;
// k/a/t near knee/ankle/toe, K/A/T far; x/X optional fingertip (for wrist movements); m optional
// mid-spine point so a crunch can bend.
const STAND = {
  h: [50, 11], s: [50, 26], p: [50, 57],
  e: [52, 42], w: [54, 58], E: [48, 42], W: [47, 58],
  k: [53, 79], a: [51, 100], t: [60, 100], K: [48, 79], A: [47, 100], T: [56, 100],
};

// Front view. n neck (top of torso), q pelvis; sl/sr shoulders, el/hl & er/hr arms; pl/pr hips,
// kl/al/tl & kr/ar/tr legs. "l" is the figure's right side, drawn on the viewer's left.
const FRONT = {
  h: [50, 11], n: [50, 24], q: [50, 57],
  sl: [40, 27], sr: [60, 27], el: [37, 43], hl: [36, 58], er: [63, 43], hr: [64, 58],
  pl: [44, 58], pr: [56, 58], kl: [43, 79], al: [42, 100], tl: [36, 100], kr: [57, 79], ar: [58, 100], tr: [64, 100],
};

// Lying on the back on the floor (floor y=100), head on the left, knees bent, feet flat.
const SUPINE = {
  h: [14, 88.5], s: [27, 95.5], p: [60, 95.5],
  e: [40, 96], w: [53, 96], E: [39, 95], W: [52, 95],
  k: [76, 76], a: [88, 96], t: [97, 96], K: [74, 77], A: [85, 96], T: [94, 96],
};

const pose = (base, over = {}) => ({ ...base, ...over });
const add = (pt, dx, dy) => [pt[0] + dx, pt[1] + dy];
/** Move every joint (or only `keys`) of a pose. */
function shift(j, dx, dy, keys = null) {
  const out = { ...j };
  for (const key of Object.keys(j)) if (!keys || keys.includes(key)) out[key] = add(j[key], dx, dy);
  return out;
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const neckOf = (j) => (j.n ? j.n : lerp(j.s, j.h, 0.38));

/** The limb segments of a pose, far side first so the near side draws on top. */
function segments(j, view) {
  const out = [];
  const seg = (a, b, far = false) => { if (j[a] && j[b]) out.push({ a: j[a], b: j[b], far }); };
  if (view === 'front') {
    seg('n', 'q'); seg('sl', 'sr'); seg('pl', 'pr');
    seg('pl', 'kl'); seg('kl', 'al'); seg('al', 'tl');
    seg('pr', 'kr'); seg('kr', 'ar'); seg('ar', 'tr');
    seg('sl', 'el'); seg('el', 'hl'); seg('sr', 'er'); seg('er', 'hr');
    return out;
  }
  seg('s', 'E', true); seg('E', 'W', true); seg('W', 'X', true);
  seg('p', 'K', true); seg('K', 'A', true); seg('A', 'T', true);
  if (j.m) { seg('s', 'm'); seg('m', 'p'); } else seg('s', 'p');
  seg('p', 'k'); seg('k', 'a'); seg('a', 't');
  seg('s', 'e'); seg('e', 'w'); seg('w', 'x');
  return out;
}

/* ------------------------------------------------------------------ equipment (design units) */

const L = (a, b, cls = 'eq-line', extra = {}) => ({ k: 'line', a, b, cls, ...extra });
const C = (c, r, cls = 'eq', extra = {}) => ({ k: 'circle', c, r, cls, ...extra });
const POLY = (pts, cls = 'eq-fill', extra = {}) => ({ k: 'poly', pts, cls, ...extra });
const RECT = (x1, y1, x2, y2, cls = 'eq-fill', extra = {}) => POLY([[x1, y1], [x2, y1], [x2, y2], [x1, y2]], cls, extra);
const ghosted = (items) => items.map((it) => ({ ...it, ghost: true }));
let groups = 0; // pieces drawn together (a dumbbell's handle and blocks) move together
const front = (items) => { groups += 1; return items.map((it) => ({ ...it, z: 'front', grp: it.grp ?? groups })); };

/** A dumbbell centred on `c`: a handle with a block at each end. `vertical` turns the handle upright. */
function dumbbell(c, vertical = false) {
  const [x, y] = c;
  if (vertical) {
    return front([L([x, y - 8], [x, y + 8]), RECT(x - 6, y - 12, x + 6, y - 6, 'eq-block'), RECT(x - 6, y + 6, x + 6, y + 12, 'eq-block')]);
  }
  return front([L([x - 8, y], [x + 8, y]), RECT(x - 12, y - 6, x - 6, y + 6, 'eq-block'), RECT(x + 6, y - 6, x + 12, y + 6, 'eq-block')]);
}

/** A barbell seen from the side, in slight perspective: the bar with a plate at each end. */
function barbellSide(c) {
  const [x, y] = c;
  return front([L([x - 15, y - 7], [x + 13, y + 6], 'eq'), C([x - 9, y - 4], 9.5, 'eq'), C([x + 7, y + 3], 9.5, 'eq')]);
}

/** A barbell seen from the front: a long bar with a plate at each end. */
function barbellFront(c, half = 30) {
  const [x, y] = c;
  return front([L([x - half, y], [x + half, y], 'eq'), C([x - half, y], 9, 'eq'), C([x + half, y], 9, 'eq')]);
}

/** A kettlebell hanging from a hand at `c`: a handle arc and a solid bell. */
function kettlebell(c) {
  const [x, y] = c;
  return front([
    { k: 'path', d: [['M', x - 6, y + 9], ['Q', x - 6, y - 3, x, y - 3], ['Q', x + 6, y - 3, x + 6, y + 9]], cls: 'eq-line' },
    C([x, y + 14], 8.5, 'eq-block'),
  ]);
}

/** A short thick handle (fat grip) centred on `c`: a filled rounded rectangle. */
function grip(c, w = 12, h = 9, r = 3) {
  const [x, y] = c;
  const x1 = x - w / 2; const x2 = x + w / 2; const y1 = y - h / 2; const y2 = y + h / 2;
  return front([{
    k: 'path', cls: 'eq-block',
    d: [['M', x1 + r, y1], ['L', x2 - r, y1], ['Q', x2, y1, x2, y1 + r], ['L', x2, y2 - r], ['Q', x2, y2, x2 - r, y2],
      ['L', x1 + r, y2], ['Q', x1, y2, x1, y2 - r], ['L', x1, y1 + r], ['Q', x1, y1, x1 + r, y1]],
  }]);
}

/** A weight plate face-on: a ring with a hub. */
const plate = (c, r = 10) => front([C(c, r, 'eq'), C(c, 2.6, 'eq-block')]);

/** A flat bench: a filled pad with two legs down to the floor. */
const bench = (x1, x2, top, floor = FLOOR, thick = 7) => [
  RECT(x1, top, x2, top + thick, 'eq-fill'),
  L([x1 + 5, top + thick], [x1 + 5, floor], 'rail'),
  L([x2 - 5, top + thick], [x2 - 5, floor], 'rail'),
];

/** A box or step: one filled rectangle standing on the floor. */
const box = (x1, x2, top, floor = FLOOR) => [RECT(x1, top, x2, floor, 'eq-fill')];

/** A cable stack: an upright rail with a pulley wheel, and the cable from the wheel to `to`. */
function cable(pulley, to, railTop = null, railBottom = FLOOR) {
  const [x, y] = pulley;
  return [
    L([x, railTop ?? Math.min(y, 10)], [x, railBottom], 'rail'),
    C(pulley, 5, 'eq'),
    L(pulley, to, 'eq-line', { z: 'front' }),
  ];
}

/** A resistance band: a wavy line from `a` to `b`. */
function band(a, b, waves = 3, amp = 3.2) {
  return [{ k: 'path', d: bandPath(a, b, waves, amp), cls: 'eq-line', z: 'front', band: { a, b, waves, amp } }];
}

function bandPath(a, b, waves, amp) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const d = [['M', a[0], a[1]]];
  const steps = waves * 2;
  for (let i = 0; i < steps; i += 1) {
    const t0 = i / steps;
    const t1 = (i + 1) / steps;
    const tm = (t0 + t1) / 2;
    const sign = i % 2 === 0 ? 1 : -1;
    d.push(['Q', a[0] + dx * tm + nx * amp * 2 * sign, a[1] + dy * tm + ny * amp * 2 * sign, a[0] + dx * t1, a[1] + dy * t1]);
  }
  return d;
}

/** A machine frame: two vertical rails with a seat between them. */
function machine(x1, x2, top, seat = null, floor = FLOOR) {
  const out = [L([x1, top], [x1, floor], 'rail'), L([x2, top], [x2, floor], 'rail')];
  if (seat) out.push(RECT(seat[0], seat[1], seat[2], seat[1] + 7, 'eq-fill'));
  return out;
}

/** A pull-up bar: a thick bar with short end posts. */
// the pull-up bar end-on, hung from a short rail: one bar for the whole hanging family
const hangBar = (bar) => [L(bar, [bar[0], bar[1] - 12], 'rail'), L([bar[0], bar[1] - 12], [bar[0] + 36, bar[1] - 12], 'rail'), ...front([C(bar, 4.5, 'eq-block')])];
const wall = (x, top = 4, floor = FLOOR) => [L([x, top], [x, floor], 'rail')];
const post = (x, top, floor = FLOOR) => [L([x, top], [x, floor], 'rail')];

/** Equipment held in the hands of a side-view pose. `kind` picks the glyph, both hands if two-handed. */
function inHands(j, kind, { twoHands = true, ghost = false } = {}) {
  let out = [];
  const hands = twoHands && j.W ? [j.W, j.w] : [j.w];
  if (kind === 'db') out = hands.flatMap((hand, i) => dumbbell(i === 0 && hands.length > 1 ? add(hand, -3, -3) : hand));
  else if (kind === 'dbv') out = hands.flatMap((hand, i) => dumbbell(i === 0 && hands.length > 1 ? add(hand, -3, -3) : hand, true));
  else if (kind === 'bb') out = barbellSide(j.w);
  else if (kind === 'kb') out = kettlebell(j.w);
  else if (kind === 'plate') out = plate(j.w, 11);
  return ghost ? ghosted(out) : out;
}

/* ------------------------------------------------------------------ archetypes */

// Each archetype takes options and returns { view, solid, ghost, eq, joint, arrows, floor }.
// `joint` is a joint key of the solid pose (or a point). Coordinates are design units: a standing
// figure is about 100 tall with its feet at y=100 and the floor at y=104.

const A = {
  /* ---------- standing holds and carries */

  stand_hold({ eq = 'bb' } = {}) {
    const solid = pose(STAND, { w: [54, 60], W: [49, 60] });
    const items = eq === 'plate' ? plate([56, 70], 12) : inHands(solid, eq);
    return { solid, eq: items, joint: 'w', arrows: [{ from: [80, 98], to: [72, 66], bulge: -8 }], floor: FLOOR };
  },

  // A bar at hip height seen from the front, with a thick grip under each hand.
  hold_fat_grip() {
    const solid = pose(FRONT, { el: [38, 43], hl: [38, 60], er: [62, 43], hr: [62, 60] });
    const items = [...front([L([16, 60], [84, 60], 'eq')]), ...grip([38, 60], 16, 11), ...grip([62, 60], 16, 11)];
    return { view: 'front', solid, eq: items, joint: [62, 49], arrows: [], floor: FLOOR };
  },

  carry({ eq = 'db', oneHand = false } = {}) {
    const solid = pose(STAND, {
      k: [58, 79], a: [62, 100], t: [71, 100], K: [45, 79], A: [38, 97], T: [46, 101],
      w: [54, 60], E: [47, 42], W: [44, 59],
    });
    if (oneHand) Object.assign(solid, { E: [44, 41], W: [36, 52] });
    const items = oneHand ? dumbbell([54, 66], false) : [...dumbbell([44, 63]), ...dumbbell([55, 66])];
    return { solid, eq: items, joint: oneHand ? 'p' : 'w', arrows: [{ from: [72, 36], to: [98, 36], bulge: -6 }], floor: FLOOR };
  },

  gripper() {
    const solid = pose(STAND, { e: [52, 43], w: [70, 40], E: [48, 43], W: [47, 59] });
    const hinge = [72, 30];
    const items = front([
      L(hinge, [70, 52], 'eq'), L(hinge, [84, 48], 'eq'), C(hinge, 3.5, 'eq'),
      L(hinge, [74, 52], 'eq', { ghost: true }),
    ]);
    return { solid, eq: items, joint: 'w', arrows: [{ from: [92, 48], to: [80, 58], bulge: -5 }], floor: FLOOR };
  },

  wrist_roller() {
    const solid = pose(STAND, { e: [66, 31], w: [83, 31], E: [64, 32], W: [81, 32] });
    const items = front([C([84, 31], 5, 'eq-block'), L([84, 31], [84, 72], 'eq-line'), ...plate([84, 80], 9)]);
    return {
      solid, eq: [...items, ...ghosted(plate([84, 96], 9))], joint: 'w',
      arrows: [{ circle: true, c: [84, 31], r: 11, from: 200, to: 470 }], floor: FLOOR,
    };
  },

  towel_wring() {
    const solid = pose(FRONT, { el: [32, 46], hl: [38, 36], er: [68, 46], hr: [62, 36] });
    return {
      view: 'front', solid, eq: band([38, 36], [62, 36], 3, 2.6), joint: 'hr',
      arrows: [{ circle: true, c: [62, 36], r: 11, from: 120, to: 400 }], floor: FLOOR,
    };
  },

  /* ---------- arms */

  curl({ grip = 'db' } = {}) {
    const ghost = pose(STAND, { e: [52, 42], w: [54, 59], E: [48, 42], W: [49, 59] });
    const solid = pose(STAND, { e: [52, 44], w: [68, 30], E: [49, 44], W: [65, 31] });
    if (grip === 'reverse') Object.assign(solid, { w: [71, 35], W: [64, 39] });
    let items;
    let ghostItems;
    if (grip === 'db' || grip === 'hammer') {
      const v = grip === 'hammer';
      items = [...dumbbell([64, 26], v), ...dumbbell([70, 30], v)];
      ghostItems = ghosted([...dumbbell([51, 57], v), ...dumbbell([56, 61], v)]);
    } else if (grip === 'band') {
      items = band([57, 100], [68, 30], 4, 2.6);
      ghostItems = [];
    } else if (grip === 'reverse') {
      // bar end-on in the hands, and a tick on the back of each hand: palms down
      const tick = (hand) => L(add(hand, -2, -9), add(hand, 4, -9), 'eq-line');
      items = front([C(add(solid.w, 1, 2), 3.5, 'eq-block'), tick(solid.w), tick(solid.W)]);
      ghostItems = ghosted(front([C(ghost.w, 4.5, 'eq-block')]));
      return {
        solid, ghost, eq: [...ghostItems, ...items], joint: 'e',
        arrows: [{ from: [62, 66], to: [78, 38], bulge: 6 }], floor: FLOOR,
      };
    } else {
      items = barbellSide(solid.w);
      ghostItems = ghosted(barbellSide(ghost.w));
    }
    return {
      solid, ghost, eq: [...ghostItems, ...items], joint: 'e',
      arrows: [{ from: [66, 64], to: [84, 40], bulge: 9 }], floor: FLOOR,
    };
  },

  curl_incline() {
    const base = {
      h: [25, 29], s: [33, 43], p: [52, 72],
      k: [72, 70], a: [74, 100], t: [83, 100], K: [70, 71], A: [70, 100], T: [79, 100],
    };
    const ghost = pose(base, { e: [33, 61], w: [33, 79], E: [31, 61], W: [31, 79] });
    const solid = pose(base, { e: [33, 61], w: [44, 46], E: [31, 61], W: [42, 46] });
    const items = [
      POLY([[48, 76], [26, 38], [19, 42], [41, 80]], 'eq-fill'), RECT(44, 76, 66, 83, 'eq-fill'),
      L([55, 83], [55, FLOOR], 'rail'),
      ...dumbbell([44, 46]), ...ghosted(dumbbell([33, 81])),
    ];
    return { solid, ghost, eq: items, joint: 'e', arrows: [{ from: [22, 82], to: [36, 40], bulge: -10 }], floor: FLOOR };
  },

  curl_preacher() {
    const base = {
      h: [44, 27], s: [44, 42], p: [38, 74],
      k: [60, 73], a: [62, 100], t: [71, 100], K: [58, 74], A: [58, 100], T: [67, 100],
    };
    const ghost = pose(base, { e: [64, 61], w: [80, 74], E: [62, 62], W: [78, 75] });
    const solid = pose(base, { e: [64, 61], w: [60, 43], E: [62, 62], W: [58, 44] });
    const items = [
      POLY([[50, 46], [72, 66], [72, 74], [48, 54]], 'eq-fill'), L([66, 72], [66, FLOOR], 'rail'),
      RECT(26, 76, 50, 83, 'eq-fill'), L([38, 83], [38, FLOOR], 'rail'),
      ...front([C([61, 41], 5.5, 'eq-block')]), ...ghosted(front([C([82, 76], 5.5, 'eq-block')])),
    ];
    return { solid, ghost, eq: items, joint: 'e', arrows: [{ from: [90, 70], to: [70, 36], bulge: 10 }], floor: FLOOR };
  },

  pushdown() {
    const base = pose(STAND, { h: [54, 12], s: [53, 27] });
    const ghost = pose(base, { e: [51, 45], w: [66, 36], E: [49, 45], W: [64, 36] });
    const solid = pose(base, { e: [51, 45], w: [55, 63], E: [49, 45], W: [53, 63] });
    const items = [...cable([86, 6], [57, 64], 0), ...front([L([53, 64], [61, 66], 'eq')])];
    return { solid, ghost, eq: items, joint: 'e', arrows: [{ from: [72, 38], to: [64, 64], bulge: -6 }], floor: FLOOR };
  },

  overhead_extension() {
    const ghost = pose(STAND, { h: [44, 13], e: [56, 9], w: [58, -8], E: [54, 9], W: [56, -8] });
    const solid = pose(STAND, { h: [44, 13], e: [59, 4], w: [38, 20], E: [57, 4], W: [36, 20] });
    const items = [...dumbbell([36, 22], true), ...ghosted(dumbbell([58, -12], true))];
    return { solid, ghost, eq: items, joint: 'e', arrows: [{ from: [64, -10], to: [34, 6], bulge: -9 }], floor: FLOOR };
  },

  /* ---------- presses */

  press_overhead({ eq = 'bb' } = {}) {
    const ghost = pose(STAND, { e: [53, 40], w: [57, 24], E: [50, 40], W: [54, 24] });
    const solid = pose(STAND, { h: [44, 13], e: [56, 9], w: [58, -8], E: [53, 9], W: [55, -8] });
    const items = eq === 'bb'
      ? [...barbellSide(solid.w), ...ghosted(barbellSide(ghost.w))]
      : [...inHands(solid, 'db'), ...inHands(ghost, 'db', { ghost: true })];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [72, 28], to: [70, -6], bulge: -4 }], floor: FLOOR };
  },

  press_bench({ eq = 'bb', mode = 'press' } = {}) {
    const base = {
      h: [12, 61], s: [25, 68], p: [60, 68],
      k: [80, 66], a: [84, 100], t: [93, 100], K: [78, 67], A: [80, 100], T: [89, 100],
    };
    let ghost;
    let solid;
    let joint = 's';
    let arrow = { from: [44, 58], to: [44, 30], bulge: -5 };
    if (mode === 'skull') {
      ghost = pose(base, { e: [21, 48], w: [19, 30], E: [19, 48], W: [17, 30] });
      solid = pose(base, { e: [21, 48], w: [7, 56], E: [19, 48], W: [5, 56] });
      joint = 'e';
      arrow = { from: [28, 26], to: [6, 44], bulge: 8 };
    } else if (mode === 'pullover') {
      ghost = pose(base, { e: [26, 50], w: [27, 33], E: [24, 50], W: [25, 33] });
      solid = pose(base, { e: [12, 56], w: [-4, 53], E: [10, 56], W: [-6, 53] });
      arrow = { from: [30, 26], to: [-6, 42], bulge: 12 };
    } else {
      ghost = pose(base, { e: [17, 78], w: [29, 57], E: [15, 78], W: [27, 57] });
      solid = pose(base, { e: [27, 50], w: [28, 32], E: [25, 50], W: [26, 32] });
    }
    if (mode === 'close') {
      // one bar seen lengthwise, hands close together on it, plates edge-on at the outer ends only
      const b = pose(base, { h: [8, 63] });
      solid = pose(b, { e: [31, 50], w: [33, 31], E: [27, 50], W: [26, 30] });
      ghost = pose(b, { e: [35, 80], w: [34, 56], E: [31, 80], W: [27, 55] });
      const held = [
        ...front([L([12, 28], [50, 34], 'eq'), RECT(9, 20, 13, 36, 'eq-block'), RECT(48, 26, 52, 42, 'eq-block')]),
        ...ghosted(front([L([20, 53], [42, 57], 'eq')])),
      ];
      return { solid, ghost, eq: [...bench(4, 70, 72), ...held], joint: 'e', arrows: [{ from: [60, 62], to: [60, 40], bulge: 0 }], floor: FLOOR };
    }
    let held;
    if (eq === 'bb') held = [...barbellSide(solid.w), ...ghosted(barbellSide(ghost.w))];
    else if (mode === 'pullover') held = [...dumbbell(add(solid.w, -3, 0), true), ...ghosted(dumbbell(add(ghost.w, 0, -4), true))];
    else held = [...inHands(solid, 'dbv'), ...inHands(ghost, 'dbv', { ghost: true })];
    return { solid, ghost, eq: [...bench(4, 70, 72), ...held], joint, arrows: [arrow], floor: FLOOR };
  },

  press_incline() {
    const base = {
      h: [25, 29], s: [33, 43], p: [52, 72],
      k: [72, 70], a: [74, 100], t: [83, 100], K: [70, 71], A: [70, 100], T: [79, 100],
    };
    const ghost = pose(base, { e: [26, 58], w: [36, 42], E: [24, 58], W: [34, 42] });
    const solid = pose(base, { e: [39, 27], w: [44, 10], E: [37, 27], W: [42, 10] });
    const items = [
      POLY([[48, 76], [26, 38], [19, 42], [41, 80]], 'eq-fill'), RECT(44, 76, 66, 83, 'eq-fill'),
      L([55, 83], [55, FLOOR], 'rail'),
      ...inHands(solid, 'db'), ...inHands(ghost, 'db', { ghost: true }),
    ];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [52, 44], to: [56, 12], bulge: -5 }], floor: FLOOR };
  },

  // Lying on the floor, knees bent: upper arms flat on the floor, forearms vertical, dumbbells
  // above the elbows; the faint arms show the lockout straight up.
  press_floor() {
    const solid = pose(SUPINE, { e: [38, 97], w: [38, 77], E: [35, 96], W: [35, 76] });
    const ghost = pose(SUPINE, { e: [28, 80], w: [29, 64], E: [26, 80], W: [27, 64] });
    const items = [
      ...dumbbell([35, 73]), ...dumbbell([38, 74]),
      ...ghosted([...dumbbell([27, 60]), ...dumbbell([29, 61])]),
    ];
    return { solid, ghost, eq: items, joint: 'e', arrows: [{ from: [56, 80], to: [56, 58], bulge: 0 }], floor: 100 };
  },

  press_seated() {
    const base = {
      h: [36, 27], s: [36, 42], p: [38, 74],
      k: [60, 73], a: [62, 100], t: [71, 100], K: [58, 74], A: [58, 100], T: [67, 100],
    };
    const ghost = pose(base, { e: [24, 54], w: [44, 50], E: [22, 54], W: [42, 50] });
    const solid = pose(base, { e: [53, 46], w: [70, 47], E: [51, 46], W: [68, 47] });
    const items = [
      ...machine(24, 92, 26, [26, 76, 52]), L([24, 30], [24, 76], 'rail'),
      L([92, 40], [74, 47], 'rail'), ...front([RECT(70, 41, 76, 53, 'eq-block')]),
    ];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [46, 40], to: [68, 38], bulge: -5 }], floor: FLOOR };
  },

  fly() {
    const ghost = pose(FRONT, { el: [25, 27], hl: [12, 20], er: [75, 27], hr: [88, 20] });
    const solid = pose(FRONT, { el: [35, 42], hl: [47, 47], er: [65, 42], hr: [53, 47] });
    const items = [
      L([4, 4], [4, FLOOR], 'rail'), L([96, 4], [96, FLOOR], 'rail'), C([4, 8], 5, 'eq'), C([96, 8], 5, 'eq'),
      L([4, 8], [47, 47], 'eq-line', { z: 'front' }), L([96, 8], [53, 47], 'eq-line', { z: 'front' }),
    ];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows: [{ from: [88, 30], to: [62, 54], bulge: -9 }], floor: FLOOR };
  },

  /* ---------- shoulders (front views where the arm moves sideways) */

  raise_lateral() {
    const ghost = pose(FRONT, { el: [37, 43], hl: [35, 58], er: [63, 43], hr: [65, 58] });
    const solid = pose(FRONT, { el: [24, 27], hl: [9, 28], er: [76, 27], hr: [91, 28] });
    const items = [
      ...dumbbell([9, 28], true), ...dumbbell([91, 28], true),
      ...ghosted([...dumbbell([35, 60], true), ...dumbbell([65, 60], true)]),
    ];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows: [{ from: [74, 62], to: [94, 40], bulge: 8 }], floor: FLOOR };
  },

  scarecrow() {
    const ghost = pose(FRONT, { el: [24, 28], hl: [24, 45], er: [76, 28], hr: [76, 45] });
    const solid = pose(FRONT, { el: [24, 28], hl: [24, 11], er: [76, 28], hr: [76, 11] });
    const items = [...dumbbell([24, 9]), ...dumbbell([76, 9]), ...ghosted([...dumbbell([24, 47]), ...dumbbell([76, 47])])];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows: [{ from: [90, 46], to: [90, 12], bulge: -10 }], floor: FLOOR };
  },

  rotate({ dir = 'out', eq = 'band' } = {}) {
    const across = { er: [64, 44], hr: [50, 48] };
    const out = { er: [64, 44], hr: [80, 40] };
    const solid = pose(FRONT, dir === 'out' ? out : across);
    const ghost = pose(FRONT, dir === 'out' ? across : out);
    const anchorX = dir === 'out' ? 4 : 100;
    const anchor = [anchorX, 44];
    const items = eq === 'cable' ? cable(anchor, solid.hr, 20) : [...post(anchorX, 30), ...band(anchor, solid.hr, 3, 2.4)];
    const arrows = dir === 'out' ? [{ from: [52, 58], to: [84, 50], bulge: 8 }] : [{ from: [84, 52], to: [52, 58], bulge: -8 }];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows, floor: FLOOR };
  },

  // Bent over to horizontal, seen from the front: hips high behind, head down between the
  // shoulders, arms sweep from hanging to out at shoulder level.
  raise_rear() {
    const base = pose(FRONT, {
      h: [50, 70], n: [50, 54], q: [50, 40], sl: [36, 54], sr: [64, 54],
      pl: [46, 40], pr: [54, 40], kl: [38, 70], al: [36, 100], tl: [30, 100], kr: [62, 70], ar: [64, 100], tr: [70, 100],
    });
    const ghost = pose(base, { el: [33, 70], hl: [35, 85], er: [67, 70], hr: [65, 85] });
    const solid = pose(base, { el: [21, 52], hl: [7, 57], er: [79, 52], hr: [93, 57] });
    const items = [
      ...dumbbell([7, 59], true), ...dumbbell([93, 59], true),
      ...ghosted([...dumbbell([35, 87], true), ...dumbbell([65, 87], true)]),
    ];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows: [{ from: [78, 90], to: [97, 72], bulge: 7 }], floor: FLOOR };
  },

  shrug() {
    const ghost = pose(FRONT);
    const solid = pose(FRONT, { n: [50, 19], sl: [40, 20], sr: [60, 20], el: [37, 36], hl: [36, 52], er: [63, 36], hr: [64, 52] });
    const items = [...barbellFront([50, 52], 36), ...ghosted(barbellFront([50, 58], 36))];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows: [{ from: [99, 40], to: [99, 18], bulge: -4 }], floor: FLOOR };
  },

  upright_row() {
    const ghost = pose(FRONT, { el: [41, 44], hl: [44, 60], er: [59, 44], hr: [56, 60] });
    const solid = pose(FRONT, { el: [26, 22], hl: [44, 32], er: [74, 22], hr: [56, 32] });
    const items = [
      C([50, FLOOR - 6], 5, 'eq'), L([50, FLOOR - 6], [50, 32], 'eq-line', { z: 'front' }),
      ...front([L([40, 32], [60, 32], 'eq')]), ...ghosted(front([L([40, 60], [60, 60], 'eq')])),
    ];
    return { view: 'front', solid, ghost, eq: items, joint: 'sr', arrows: [{ from: [84, 62], to: [84, 28], bulge: -8 }], floor: FLOOR };
  },

  face_pull({ eq = 'cable', high = false } = {}) {
    const ghost = pose(STAND, { e: [67, 25], w: [84, 24], E: [65, 26], W: [82, 25] });
    const solid = high
      ? pose(STAND, { e: [40, 18], w: [44, 0], E: [38, 19], W: [42, 1] })
      : pose(STAND, { e: [40, 22], w: [58, 13], E: [38, 23], W: [56, 14] });
    const anchor = [104, 20];
    const items = eq === 'cable' ? cable(anchor, solid.w, 4) : [...post(104, 8), ...band(anchor, solid.w, 4, 2.4)];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [84, 34], to: [60, 26], bulge: -8 }], floor: FLOOR };
  },

  pallof() {
    const ghost = pose(FRONT, { el: [34, 48], hl: [48, 40], er: [66, 48], hr: [52, 40] });
    const solid = pose(FRONT, { el: [44, 38], hl: [49, 45], er: [56, 38], hr: [51, 45] });
    const items = [...post(4, 26), ...band([4, 40], [49, 45], 4, 2.4)];
    return { view: 'front', solid, ghost, eq: items, joint: 'q', arrows: [{ from: [74, 30], to: [74, 54], bulge: 0 }], floor: FLOOR };
  },

  wood_chop() {
    const ghost = pose(FRONT, { el: [34, 14], hl: [24, 2], er: [52, 12], hr: [30, 2] });
    const solid = pose(FRONT, { el: [56, 46], hl: [68, 62], er: [68, 44], hr: [74, 60] });
    const items = cable([4, 0], [70, 61], 0);
    return { view: 'front', solid, ghost, eq: items, joint: 'q', arrows: [{ from: [36, 4], to: [80, 62], bulge: -14 }], floor: FLOOR };
  },

  neck_side() {
    const ghost = pose(FRONT);
    const solid = pose(FRONT, { h: [41, 14], er: [72, 30], hr: [56, 12] });
    return { view: 'front', solid, ghost, eq: dumbbell([60, 10], true), joint: 'n', arrows: [{ from: [56, -2], to: [34, 4], bulge: 6 }], floor: FLOOR };
  },

  /* ---------- pulls */

  pull_down({ eq = 'machine' } = {}) {
    const kneel = eq === 'band';
    const base = kneel
      ? { h: [46, 41], s: [46, 56], p: [46, 82], k: [54, 100], a: [32, 100], t: [26, 100], K: [52, 100], A: [30, 99], T: [24, 99] }
      : { h: [44, 31], s: [44, 46], p: [42, 78], k: [64, 76], a: [66, 100], t: [75, 100], K: [62, 77], A: [62, 100], T: [71, 100] };
    const dy = kneel ? 10 : 0;
    let ghost = pose(base, { e: [48, 26 + dy], w: [50, 6 + dy], E: [46, 26 + dy], W: [48, 6 + dy] });
    let solid = pose(base, { e: [36, 62 + dy], w: [48, 42 + dy], E: [34, 62 + dy], W: [46, 42 + dy] });
    let items;
    if (kneel) {
      // band anchored high and in front: two straight lines down to the hands, clear of the head
      const anchor = [88, -14];
      ghost = pose(base, { e: [60, 40], w: [70, 20], E: [58, 41], W: [68, 21] });
      solid = pose(base, { e: [42, 76], w: [56, 58], E: [40, 77], W: [53, 59] });
      items = [
        L([76, -18], [100, -18], 'rail'), ...front([C(anchor, 3, 'eq-block')]),
        L(anchor, solid.W, 'eq-line'), L(anchor, solid.w, 'eq-line', { z: 'front' }),
      ];
      return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [86, 26], to: [74, 58], bulge: -5 }], floor: FLOOR };
    } else {
      items = [
        ...machine(24, 84, -16, [26, 80, 56]), L([24, -16], [84, -16], 'rail'), C([50, -16], 5, 'eq'),
        L([50, -16], solid.w, 'eq-line', { z: 'front' }), ...front([L([40, 42], [58, 40], 'eq')]),
        RECT(58, 64, 76, 70, 'eq-block'),
      ];
    }
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [62, 6 + dy], to: [60, 40 + dy], bulge: -8 }], floor: FLOOR };
  },

  pull_straight_arm() {
    const base = {
      h: [62, 17], s: [56, 31], p: [44, 60],
      k: [49, 80], a: [46, 100], t: [55, 100], K: [45, 80], A: [42, 100], T: [51, 100],
    };
    const ghost = pose(base, { e: [72, 30], w: [89, 29], E: [70, 31], W: [87, 30] });
    const solid = pose(base, { e: [59, 48], w: [60, 65], E: [57, 48], W: [58, 65] });
    const items = [...cable([104, 4], solid.w, 0), ...front([L([56, 65], [66, 66], 'eq')])];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [94, 36], to: [70, 68], bulge: -10 }], floor: FLOOR };
  },

  pull_seated_row() {
    const base = {
      h: [34, 39], s: [34, 54], p: [36, 84],
      k: [58, 74], a: [76, 84], t: [80, 74], K: [56, 75], A: [74, 85], T: [78, 75],
    };
    const ghost = pose(base, { e: [52, 58], w: [70, 62], E: [50, 59], W: [68, 63] });
    const solid = pose(base, { e: [20, 68], w: [42, 68], E: [18, 69], W: [40, 69] });
    const items = [
      ...bench(18, 52, 88, FLOOR, 6), RECT(82, 66, 88, 92, 'eq-fill'),
      ...cable([104, 66], solid.w, 40), ...front([RECT(40, 63, 46, 73, 'eq-block')]),
    ];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [70, 52], to: [46, 60], bulge: -6 }], floor: FLOOR };
  },

  row_bent({ eq = 'bb' } = {}) {
    const base = {
      h: [84, 33], s: [72, 40], p: [40, 56],
      k: [52, 78], a: [46, 100], t: [55, 100], K: [49, 78], A: [43, 100], T: [52, 100],
    };
    const ghost = pose(base, { e: [72, 58], w: [72, 76], E: [70, 58], W: [70, 76] });
    const solid = pose(base, { e: [56, 33], w: [61, 52], E: [54, 34], W: [59, 53] });
    const items = eq === 'bb'
      ? [...barbellSide(solid.w), ...ghosted(barbellSide(ghost.w))]
      : [...inHands(solid, 'db'), ...inHands(ghost, 'db', { ghost: true })];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [84, 76], to: [70, 48], bulge: 8 }], floor: FLOOR };
  },

  row_one_arm() {
    const base = {
      h: [84, 46], s: [70, 52], p: [36, 50],
      E: [69, 60], W: [68, 68], K: [38, 68], A: [20, 68], T: [14, 66],
      k: [42, 76], a: [40, 100], t: [49, 100],
    };
    const ghost = pose(base, { e: [72, 68], w: [72, 86] });
    const solid = pose(base, { e: [56, 38], w: [62, 56] });
    const items = [...bench(10, 78, 72), ...dumbbell([62, 58]), ...ghosted(dumbbell([72, 88]))];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [86, 86], to: [72, 52], bulge: 8 }], floor: FLOOR };
  },

  pull_hanging({ grip = 'over' } = {}) {
    // The bar end-on, so the head can rise behind it: at the top the chin is level with the bar and
    // the head clear of it, the elbows bent down in front of the body, both hands on the bar.
    // The shoulders sit close in under the bar, so the elbows have room to bend forward of it.
    const bar = [60, 0];
    const solid = {
      h: [48, 0], s: [51, 15], p: [52, 46],
      e: [67, 15.5], w: bar, E: [65.1, 15], W: [58, 0],
      k: [56, 66], a: [50, 85], t: [56, 90], K: [53, 67], A: [47, 86], T: [53, 91],
    };
    // the start: a dead hang, arms straight up from the shoulders, the body below
    const ghost = shift(solid, 6, 17.8, ['p', 'k', 'a', 't', 'K', 'A', 'T']);
    Object.assign(ghost, { h: [52, 19], s: [57, 32.8], e: [58.5, 16.8], E: [57.5, 16.8] });
    const items = hangBar(bar);
    return {
      solid, ghost, eq: items, joint: grip === 'under' ? 'e' : 's',
      arrows: [{ from: [80, 40], to: [80, 14], bulge: -6 }], floor: null,
    };
  },



  hang({ towel = false, legs = 'none' } = {}) {
    const top = 0;
    const solid = {
      h: [46, 26], s: [50, 41], p: [50, 72],
      e: [58, 22], w: [60, towel ? 12 : top], E: [55, 22], W: [58, towel ? 12 : top],
      k: [52, 94], a: [50, 115], t: [56, 119], K: [48, 94], A: [46, 115], T: [52, 119],
    };
    let ghost = null;
    let joint = 'w';
    const arrows = [];
    if (legs === 'straight') {
      ghost = pose(solid);
      Object.assign(solid, { k: [72, 72], a: [94, 72], t: [99, 66], K: [72, 74], A: [93, 74], T: [98, 68] });
      joint = 'p';
      arrows.push({ from: [60, 112], to: [100, 80], bulge: 14 });
    } else if (legs === 'knees') {
      ghost = pose(solid);
      Object.assign(solid, { k: [70, 58], a: [66, 80], t: [72, 84], K: [68, 60], A: [64, 82], T: [70, 86] });
      joint = 'p';
      arrows.push({ from: [62, 110], to: [80, 66], bulge: 12 });
    } else {
      // A hold: ghost the step up to the bar, an arrow showing the feet leaving the floor.
      ghost = shift(solid, 0, 10, ['k', 'a', 't', 'K', 'A', 'T']);
      ghost = pose(ghost, { a: [50, 120], t: [58, 124], A: [46, 120], T: [54, 124] });
      arrows.push({ from: [72, 118], to: [72, 96], bulge: -4 });
    }
    const items = hangBar([60, top]);
    if (towel) items.push(...band([60, top], [60, 12], 2, 1.6), ...band([58, top], [58, 12], 2, 1.6));
    return { solid, ghost, eq: items, joint, arrows, floor: legs === 'none' ? 128 : null };
  },

  inverted_row() {
    // the bar is end-on over the upper chest; the body pivots on the heels
    const bar = [40, 48];
    const solid = {
      h: [20, 52], s: [33, 58], p: [64, 75], e: [46.2, 67], w: bar, E: [44.2, 67.5], W: [38, 48],
      k: [83.4, 81.1], a: [96, 97], t: [101, 90], K: [82.4, 82.1], A: [94, 98], T: [99, 91],
    };
    const ghost = {
      h: [9.7, 78.2], s: [23.9, 79.8], p: [58.7, 86.2], e: [31.1, 65.7], w: bar, E: [29.1, 66], W: [38, 48],
      k: [79, 85.9], a: [96, 97], t: [98.5, 88.8], K: [78, 86.9], A: [94, 98], T: [96.5, 89.8],
    };
    const items = [L([40, 42], [40, FLOOR], 'rail'), ...front([C(bar, 4.5, 'eq-block')])];
    return { solid, ghost, eq: items, joint: 'e', arrows: [{ from: [4, 96], to: [6, 60], bulge: 4 }], floor: FLOOR };
  },


  /* ---------- floor push and plank family */

  push_up({ variant = 'normal' } = {}) {
    let solid = {
      h: [88, 55], s: [76, 62], p: [43, 76],
      e: [77, 79], w: [78, 97], E: [75, 79], W: [76, 97],
      k: [27, 84], a: [10, 92], t: [5, 99], K: [27, 85], A: [10, 93], T: [5, 99],
    };
    let ghost = {
      h: [88, 79], s: [76, 86], p: [43, 91],
      e: [62, 82], w: [70, 97], E: [60, 83], W: [68, 97],
      k: [27, 94], a: [10, 96], t: [5, 99], K: [27, 95], A: [10, 96], T: [5, 99],
    };
    let items = [];
    let joint = 's';
    if (variant === 'feet-up') {
      solid = pose(solid, { h: [90, 64], s: [78, 70], p: [46, 64], k: [30, 61], a: [14, 58], t: [8, 56], K: [30, 62], A: [14, 59], T: [8, 57], e: [79, 84], w: [80, 97], E: [77, 84], W: [78, 97] });
      ghost = pose(ghost, { h: [90, 82], s: [78, 89], p: [46, 74], k: [30, 66], a: [14, 58], t: [8, 56], K: [30, 67], A: [14, 59], T: [8, 57] });
      items = box(0, 24, 62);
    } else if (variant === 'diamond') {
      solid = pose(solid, { e: [72, 79], w: [70, 97], E: [70, 79], W: [68, 97] });
      ghost = pose(ghost, { e: [56, 80], w: [70, 97], E: [54, 81], W: [68, 97] });
      joint = 'e';
    } else if (variant === 'climber') {
      ghost = pose(solid);
      solid = pose(solid, { k: [60.8, 79.5], a: [45.5, 87], t: [52.5, 90.4] });
      joint = 'p';
      // halfway: the knee passes under the hip with the shin folded up behind it, the foot off the floor
      const via = { p: [43, 76], k: [52, 91.6], a: [38.1, 81.9], t: [30.3, 82.6] };
      return { solid, ghost, via, eq: [], joint, arrows: [{ from: [12, 80], to: [52, 74], bulge: 10 }], floor: 102 };
    }
    return { solid, ghost, eq: items, joint, arrows: [{ from: [98, 86], to: [98, 58], bulge: -4 }], floor: 102 };
  },

  pike_push() {
    // Inverted V: hips high, hands and feet on the floor (y=86). Solid = head lowered toward the
    // floor between the hands; ghost = arms straight.
    const ghost = {
      h: [76, 54], s: [68, 44], p: [50, 22],
      e: [74, 62], w: [78, 86], E: [72, 62], W: [76, 86],
      k: [38, 52], a: [26, 82], t: [20, 87], K: [38, 53], A: [26, 83], T: [20, 87],
    };
    const solid = pose(ghost, { h: [80, 70], s: [70, 58], p: [52, 30], e: [60, 66], E: [58, 67] });
    return { solid, ghost, eq: [], joint: 's', arrows: [{ from: [94, 50], to: [94, 76], bulge: -4 }], floor: 90 };
  },

  plank({ side = false } = {}) {
    if (side) {
      const solid = {
        h: [12, 59], s: [24, 68], p: [62, 81],
        e: [24, 94], w: [40, 96], E: [26, 50], W: [28, 33],
        k: [82, 88], a: [101, 95], t: [106, 92], K: [82, 87], A: [101, 94], T: [106, 91],
      };
      const ghost = pose(solid, { p: [62, 95], k: [82, 96] });
      return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [62, 108], to: [66, 86], bulge: 6 }], floor: 100 };
    }
    const solid = {
      h: [88, 66], s: [76, 74], p: [43, 82],
      e: [76, 95], w: [93, 96], E: [74, 95], W: [91, 96],
      k: [27, 87], a: [10, 92], t: [5, 99], K: [27, 88], A: [10, 93], T: [5, 99],
    };
    const ghost = pose(solid, { p: [43, 96], k: [27, 96], s: [76, 86], h: [88, 82] });
    return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [50, 110], to: [50, 86], bulge: 4 }], floor: 100 };
  },

  copenhagen() {
    const solid = {
      h: [12, 59], s: [24, 68], p: [60, 74],
      e: [24, 94], w: [40, 96], E: [34, 70], W: [48, 74],
      K: [82, 77], A: [102, 80], T: [107, 76],
      k: [72, 94], a: [84, 96], t: [90, 99],
    };
    // the top hand rests on the hip and goes down with it
    const ghost = pose(solid, { p: [62, 90], K: [82, 90], E: [36, 84], W: [49, 89] });
    return {
      solid, ghost, eq: [RECT(90, 84, 120, FLOOR - 4, 'eq-fill')], joint: 'p', arrows: [{ from: [52, 106], to: [56, 80], bulge: 6 }], floor: 100,
      hold: ['A'], // the top ankle stays on the bench
    };
  },

  ab_wheel() {
    const solid = {
      h: [82, 72], s: [70, 78], p: [40, 84],
      e: [80, 84], w: [88, 90], E: [78, 85], W: [86, 91],
      k: [22, 96], a: [6, 96], t: [1, 99], K: [21, 96], A: [5, 96], T: [0, 99],
    };
    const ghost = {
      h: [56, 52], s: [48, 64], p: [28, 72],
      e: [54, 78], w: [56, 90], E: [52, 79], W: [54, 91],
      k: [22, 96], a: [6, 96], t: [1, 99], K: [21, 96], A: [5, 96], T: [0, 99],
    };
    const items = [...front([C([88, 93], 7.5, 'eq')]), ...ghosted(front([C([56, 93], 7.5, 'eq')]))];
    return { solid, ghost, eq: items, joint: 'p', arrows: [{ from: [64, 104], to: [86, 104], bulge: 0 }], floor: 101 };
  },

  dip() {
    const solid = {
      h: [47, 42], s: [42, 57], p: [42, 88],
      e: [29, 45], w: [31, 64], E: [27, 46], W: [29, 64],
      k: [66, 86], a: [88, 96], t: [94, 90], K: [65, 87], A: [87, 97], T: [93, 91],
    };
    // the top: arms straight from the hands on the bench, the hips up and forward on the heels
    const ghost = {
      h: [53, 18], s: [50, 33], p: [57, 63.5], e: [40.8, 48.1], w: [31, 64], E: [38.8, 48.6], W: [29, 64],
      k: [72, 72], a: [88, 96], t: [94, 90], K: [71, 73], A: [87, 97], T: [93, 91],
    };
    return { solid, ghost, eq: bench(0, 30, 64), joint: 'e', arrows: [{ from: [56, 28], to: [56, 54], bulge: -4 }], floor: 100 };
  },

  bird_dog() {
    const base = {
      h: [83, 58], s: [70, 64], p: [36, 64],
      E: [70, 81], W: [70, 98], K: [36, 97], A: [16, 98], T: [10, 98],
    };
    const ghost = pose(base, { e: [72, 81], w: [72, 98], k: [38, 97], a: [18, 98], t: [12, 98] });
    // the raised leg reaches straight back at the kneeling leg's thigh and shin lengths
    const solid = pose(base, { e: [86, 58], w: [102, 54], k: [3, 62.2], a: [-17, 61.1], t: [-22, 57.8] });
    return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [14, 96], to: [-8, 74], bulge: 6 }], floor: 102 };
  },

  /* ---------- prone (face down) */

  superman() {
    const ghost = {
      h: [86, 89], s: [72, 95], p: [40, 95], e: [86, 96], w: [100, 96], E: [86, 95], W: [100, 95],
      k: [20, 96], a: [2, 96], t: [-3, 99], K: [20, 95], A: [2, 95], T: [-3, 98],
    };
    const solid = {
      h: [93, 89], s: [74, 89], p: [40, 95], e: [78, 73], w: [94, 64], E: [77, 74], W: [93, 65],
      k: [21, 89], a: [3, 82], t: [-2, 85], K: [21, 90], A: [3, 83], T: [-2, 86],
    };
    return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [112, 90], to: [112, 66], bulge: -5 }, { from: [-6, 92], to: [-8, 76], bulge: 5 }], floor: 100 };
  },

  prone_y() {
    const base = {
      h: [86, 89], s: [72, 95], p: [40, 95],
      k: [20, 96], a: [2, 96], t: [-3, 99], K: [20, 95], A: [2, 95], T: [-3, 98],
    };
    const ghost = pose(base, { h: [93, 90], s: [74, 95], e: [88, 96], w: [104, 96], E: [88, 95], W: [104, 95] });
    const solid = pose(base, { h: [93, 90], s: [74, 95], e: [76, 78], w: [86, 63], E: [75, 79], W: [85, 64] });
    return { solid, ghost, eq: [], joint: 's', arrows: [{ from: [112, 92], to: [108, 62], bulge: -6 }], floor: 100 };
  },

  /* ---------- squats, lunges, steps */

  squat({ eq = 'bb' } = {}) {
    let solid = {
      h: [64, 33], s: [56, 46], p: [36, 74],
      k: [64, 80], a: [52, 100], t: [61, 100], K: [61, 81], A: [49, 100], T: [58, 100],
      e: [40, 58], w: [49, 44], E: [38, 59], W: [47, 45],
    };
    let ghost = pose(STAND, { e: [38, 38], w: [44, 26], E: [36, 39], W: [42, 27] });
    let items;
    let arrow = { from: [82, 24], to: [82, 58], bulge: -5 };
    if (eq === 'bb') {
      items = [...barbellSide([48, 42]), ...ghosted(barbellSide([43, 24]))];
    } else if (eq === 'kb') {
      solid = pose(solid, { h: [56, 33], s: [52, 47], p: [34, 74], e: [64, 58], w: [62, 46], E: [62, 59], W: [60, 47] });
      ghost = pose(STAND, { e: [58, 40], w: [60, 30], E: [56, 41], W: [58, 31] });
      items = [...kettlebell([62, 44]), ...ghosted(kettlebell([60, 28]))];
    } else if (eq === 'band') {
      solid = pose(solid, { h: [42, 26], s: [38, 41], p: [28, 72], k: [52, 76], a: [52, 100], t: [61, 100], K: [50, 77], A: [50, 100], T: [59, 100], e: [50, 54], w: [64, 50], E: [48, 55], W: [62, 51] });
      ghost = pose(STAND, { e: [58, 40], w: [70, 34], E: [56, 41], W: [68, 35] });
      items = [...post(104, 60), ...band([54, 76], [104, 76], 4, 2.6)];
    } else if (eq === 'wall') {
      solid = { h: [30, 25], s: [30, 40], p: [30, 72], k: [54, 72], a: [54, 100], t: [63, 100], K: [52, 73], A: [52, 100], T: [61, 100], e: [36, 56], w: [48, 66], E: [34, 57], W: [46, 67] };
      ghost = shift(STAND, -20, 0);
      items = wall(22, 0);
      arrow = { from: [8, 30], to: [8, 60], bulge: 0 };
    } else if (eq === 'sissy') {
      solid = {
        h: [28, 33], s: [36, 47], p: [52, 76], k: [70, 84], a: [52, 96], t: [61, 100], K: [68, 85], A: [50, 96], T: [59, 100],
        e: [54, 52], w: [70, 46], E: [52, 53], W: [68, 47],
      };
      ghost = pose(STAND, { a: [51, 96], t: [60, 100], A: [47, 96], T: [56, 100], e: [60, 40], w: [70, 40] });
      items = post(72, 30);
      arrow = { from: [20, 10], to: [16, 38], bulge: 6 };
    }
    return { solid, ghost, eq: items, joint: 'k', arrows: [arrow], floor: FLOOR };
  },

  squat_wide({ kind = 'sumo' } = {}) {
    let solid;
    let ghost;
    let items = [];
    let joint = 'kr';
    let arrows;
    if (kind === 'sumo') {
      ghost = pose(FRONT, { kl: [36, 79], al: [30, 100], tl: [24, 100], kr: [64, 79], ar: [70, 100], tr: [76, 100], pl: [43, 58], pr: [57, 58] });
      solid = pose(FRONT, {
        h: [50, 31], n: [50, 44], q: [50, 76], sl: [40, 47], sr: [60, 47], el: [41, 62], hl: [48, 76], er: [59, 62], hr: [52, 76],
        pl: [43, 77], pr: [57, 77], kl: [24, 76], al: [30, 100], tl: [24, 100], kr: [76, 76], ar: [70, 100], tr: [76, 100],
      });
      items = [...dumbbell([50, 86], true), ...ghosted(dumbbell([50, 68], true))];
      arrows = [{ from: [96, 30], to: [96, 64], bulge: -4 }];
    } else {
      // cossack (deep, one leg straight) or side lunge (shallower, arrow sideways)
      const deep = kind === 'cossack';
      ghost = pose(FRONT, { al: [22, 100], tl: [16, 100], kl: [33, 79], ar: [78, 100], tr: [84, 100], kr: [67, 79] });
      solid = deep
        ? pose(FRONT, {
          h: [40, 36], n: [40, 49], q: [38, 78], sl: [30, 52], sr: [50, 52], el: [33, 66], hl: [41, 60], er: [48, 66], hr: [42, 60],
          pl: [32, 79], pr: [44, 79], kl: [14, 78], al: [22, 100], tl: [16, 100], kr: [62, 90], ar: [80, 98], tr: [84, 90],
        })
        : pose(FRONT, {
          h: [38, 24], n: [38, 37], q: [36, 70], sl: [28, 40], sr: [48, 40], el: [30, 56], hl: [37, 70], er: [46, 56], hr: [40, 70],
          pl: [30, 71], pr: [42, 71], kl: [14, 82], al: [22, 100], tl: [16, 100], kr: [62, 86], ar: [80, 100], tr: [86, 100],
        });
      joint = 'kl';
      arrows = deep ? [{ from: [56, 26], to: [36, 44], bulge: 8 }] : [{ from: [74, 64], to: [42, 64], bulge: -6 }];
    }
    return { view: 'front', solid, ghost, eq: items, joint, arrows, floor: FLOOR };
  },

  lunge({ eq = 'none', rear = 'floor' } = {}) {
    let solid = {
      h: [49, 26], s: [48, 41], p: [46, 72],
      e: [50, 57], w: [52, 73], E: [46, 57], W: [45, 73],
      k: [68, 74], a: [68, 100], t: [77, 100], K: [40, 96], A: [20, 94], T: [14, 100],
    };
    let ghost = { ...solid, h: [49, 10], s: [48, 25], p: [46, 56], k: [56, 78], K: [36, 78], A: [24, 99], T: [16, 102], e: [50, 41], w: [52, 57], E: [46, 41], W: [45, 57] };
    let items = [];
    if (rear === 'bench') {
      solid = pose(solid, { K: [36, 94], A: [20, 74], T: [12, 70] });
      ghost = pose(ghost, { K: [32, 80], A: [20, 74], T: [12, 70] });
      items.push(...bench(0, 26, 72));
    }
    if (eq === 'db') items.push(...inHands(solid, 'db'));
    return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [92, 30], to: [92, 64], bulge: -5 }], floor: FLOOR };
  },

  step_up() {
    const solid = {
      h: [44, 22], s: [44, 37], p: [44, 68],
      e: [46, 53], w: [48, 69], E: [42, 53], W: [41, 69],
      k: [66, 54], a: [66, 76], t: [75, 76], K: [44, 89], A: [36, 100], T: [44, 101],
    };
    const ghost = {
      h: [66, -4], s: [66, 11], p: [66, 42], e: [68, 27], w: [70, 43], E: [64, 27], W: [63, 43],
      k: [68, 60], a: [66, 76], t: [75, 76], K: [64, 60], A: [62, 76], T: [71, 76],
    };
    const items = [...box(58, 96, 80), ...inHands(solid, 'db')];
    return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [26, 40], to: [50, 2], bulge: 8 }], floor: FLOOR };
  },

  step_lateral() {
    const ghost = pose(FRONT, {
      kr: [70, 64], ar: [72, 82], tr: [78, 82], pr: [56, 58],
    });
    const solid = shift(pose(FRONT, { kl: [43, 79], al: [42, 100], tl: [36, 100], kr: [58, 79], ar: [60, 100], tr: [66, 100] }), 14, -18);
    Object.assign(solid, { kl: [48, 70], al: [42, 86], tl: [36, 86] });
    const items = [...box(60, 98, 86), ...dumbbell(solid.hl, true), ...dumbbell(solid.hr, true)];
    return { view: 'front', solid, ghost, eq: items, joint: 'kr', arrows: [{ from: [14, 74], to: [24, 28], bulge: -8 }], floor: FLOOR };
  },

  step_down({ tap = 'down' } = {}) {
    // Standing on a low step (top y=88) on the near, bright leg; the far leg reaches to the floor.
    const solid = tap === 'down'
      ? {
        h: [52, 5], s: [48, 20], p: [42, 50], k: [60, 66], a: [48, 84], t: [57, 84],
        e: [60, 28], w: [76, 26], E: [58, 29], W: [74, 27],
        K: [54, 72], A: [60, 97], T: [68, 100],
      }
      : {
        h: [50, 11], s: [46, 26], p: [40, 56], k: [60, 68], a: [48, 84], t: [57, 84],
        e: [36, 40], w: [44, 52], E: [34, 41], W: [42, 53],
        K: [62, 74], A: [82, 96], T: [90, 100],
      };
    const ghost = {
      h: [48, -6], s: [48, 9], p: [48, 40], k: [50, 62], a: [48, 84], t: [57, 84],
      e: [50, 25], w: [52, 41], E: [46, 25], W: [45, 41], K: [46, 62], A: [44, 84], T: [53, 84],
    };
    const items = box(24, 62, 88);
    const arrow = tap === 'down' ? { from: [82, 74], to: [78, 98], bulge: -4 } : { from: [80, 62], to: [102, 90], bulge: -10 };
    return { solid, ghost, eq: items, joint: 'k', arrows: [arrow], floor: FLOOR };
  },

  /* ---------- hinges */

  hinge({ eq = 'bb', mode = 'rdl' } = {}) {
    let solid = {
      h: [73, 34], s: [60, 41], p: [28, 54],
      k: [46, 77], a: [44, 100], t: [53, 100], K: [43, 77], A: [41, 100], T: [50, 100],
      e: [60, 59], w: [58, 76], E: [58, 59], W: [56, 76],
    };
    let ghost = pose(STAND, { w: [54, 59], W: [49, 59] });
    let items = [];
    let joint = 'p';
    let arrows = [{ from: [86, 20], to: [86, 50], bulge: -6 }];
    if (eq === 'bb') items = [...barbellSide([60, 78]), ...ghosted(barbellSide([54, 60]))];
    if (eq === 'db') items = [...inHands(solid, 'db'), ...inHands(ghost, 'db', { ghost: true })];
    if (mode === 'good-morning') {
      solid = pose(solid, { e: [56, 54], w: [62, 40], E: [54, 55], W: [60, 41] });
      ghost = pose(STAND, { e: [42, 36], w: [50, 24], E: [40, 37], W: [48, 25] });
      items = [...barbellSide([58, 37]), ...ghosted(barbellSide([48, 22]))];
    } else if (mode === 'single-leg') {
      // both arms hang straight down from the shoulders all the way: the weight ends up in front
      // of the standing leg, clear of it, as the torso goes level
      solid = {
        h: [81, 45], s: [67, 48], p: [37, 58], e: [67, 63.5], w: [67, 79], E: [65, 63.5], W: [65, 79],
        k: [44.5, 78.8], a: [44, 100], t: [53, 100], K: [15, 60], A: [-6, 62], T: [-7.5, 71],
      };
      ghost = {
        h: [44, 11.5], s: [43, 26.5], p: [43, 57.5], e: [43, 42], w: [43, 57.5], E: [41, 42], W: [41, 57.5],
        k: [45, 79], a: [44, 100], t: [53, 100], K: [41, 79], A: [38, 98], T: [46, 99],
      };
      items = [...kettlebell(solid.w), ...ghosted(kettlebell(ghost.w))];
    } else if (mode === 'kickback') {
      solid = pose(solid, {
        h: [72, 22], s: [64, 34], p: [44, 58], e: [76, 42], w: [88, 44], E: [74, 43], W: [86, 45],
        k: [46, 79], a: [44, 100], t: [53, 100], K: [28, 74], A: [10, 86], T: [5, 92],
      });
      ghost = pose(solid, { K: [46, 79], A: [44, 99], T: [52, 100] });
      items = [...cable([100, 96], [12, 88], 30), L([94, 30], [88, 44], 'rail')];
      arrows = [{ from: [40, 94], to: [12, 76], bulge: -6 }];
    } else if (mode === 'harness') {
      solid = pose(solid, {
        h: [70, 34], s: [60, 34], p: [36, 58], e: [56, 50], w: [52, 66], E: [54, 51], W: [50, 67],
        k: [46, 79], a: [44, 100], t: [53, 100], K: [43, 79], A: [41, 100], T: [50, 100],
      });
      solid.h = [70, 44];
      ghost = { h: [72, 24], s: solid.s };
      // the plate hangs from the head on its chain: one piece, so it moves with the head
      items = [L([70, 52], [70, 72], 'eq-line'), ...plate([70, 80], 8)].map((it) => ({ ...it, grp: 'harness' }));
      joint = neckOf(solid);
      arrows = [{ from: [84, 22], to: [82, 46], bulge: -6 }];
    }
    return { solid, ghost, eq: items, joint, arrows, floor: FLOOR };
  },

  back_extension() {
    const solid = {
      h: [74, 22], s: [62, 32], p: [38, 58],
      e: [70, 44], w: [62, 40], E: [68, 45], W: [60, 41],
      k: [24, 72], a: [10, 86], t: [6, 94], K: [23, 73], A: [9, 87], T: [5, 95],
    };
    const ghost = pose(solid, { h: [58, 98], s: [52, 86], e: [60, 80], w: [54, 76], E: [58, 81], W: [52, 77] });
    const items = [POLY([[34, 66], [50, 50], [56, 56], [40, 72]], 'eq-fill'), L([45, 66], [45, FLOOR], 'rail'), RECT(2, 90, 18, 98, 'eq-block'), L([10, 98], [10, FLOOR], 'rail')];
    return { solid, ghost, eq: items, joint: 'p', arrows: [{ from: [70, 98], to: [86, 34], bulge: 14 }], floor: FLOOR };
  },

  kneel_lean({ machine: onMachine = false } = {}) {
    // Nordic / glute-ham: knees fixed, the whole body pivots forward from upright.
    const knee = [40, 88];
    const ghost = {
      h: [42, 9], s: [42, 24], p: [41, 56], k: knee, a: [16, 88], t: [10, 82], K: [39, 88], A: [15, 88], T: [9, 82],
      e: [46, 38], w: [52, 32], E: [44, 39], W: [50, 33],
    };
    const solid = {
      h: [96, 46], s: [84, 54], p: [60, 72], k: knee, a: [16, 88], t: [10, 82], K: [39, 88], A: [15, 88], T: [9, 82],
      e: [90, 68], w: [98, 78], E: [88, 69], W: [96, 79],
    };
    const items = onMachine
      ? [RECT(28, 92, 58, 99, 'eq-fill'), RECT(8, 76, 20, 84, 'eq-block'), L([42, 99], [42, FLOOR], 'rail'), L([14, 84], [14, FLOOR], 'rail')]
      : [RECT(6, 78, 22, 85, 'eq-block')];
    return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [58, 14], to: [92, 34], bulge: -8 }], floor: onMachine ? FLOOR : 92 };
  },

  /* ---------- hips and glutes */

  // Upper back on the edge of a bench, feet flat on the floor. Solid: hips low at the start;
  // faint: hips driven up until knees, hips and shoulders make one straight line.
  hip_thrust() {
    const base = { h: [16, 55], s: [30, 62], a: [82, 85], t: [91, 85], A: [79, 85], T: [88, 85] };
    const solid = pose(base, {
      p: [52, 82], k: [70, 68], K: [68, 69],
      e: [40, 75], w: [52, 75], E: [38, 76], W: [50, 76],
    });
    const ghost = pose(base, {
      p: [60, 62], k: [80, 63], K: [78, 64],
      e: [44, 57], w: [58, 56], E: [42, 58], W: [56, 57],
    });
    const items = [
      ...bench(4, 32, 66, 89),
      ...front([C([53, 75], 4.5, 'eq-block')]), ...ghosted(front([C([60, 55], 4.5, 'eq-block')])),
    ];
    return { solid, ghost, eq: items, joint: 'p', arrows: [{ from: [55, 103], to: [55, 89], bulge: 0 }], floor: 89 };
  },

  glute_bridge() {
    const solid = pose(SUPINE, { p: [58, 74], k: [80, 64], K: [78, 65], a: [88, 96], A: [85, 96], e: [40, 96], w: [54, 96] });
    const ghost = pose(SUPINE);
    return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [50, 106], to: [52, 74], bulge: -10 }], floor: 100 };
  },

  clamshell({ eq = 'band' } = {}) {
    const base = {
      h: [12, 80], s: [26, 90], p: [60, 90],
      e: [18, 97], w: [5, 94], E: [38, 82], W: [52, 84],
      K: [82, 96], A: [62, 97], T: [56, 97],
    };
    const solid = pose(base, { k: [74, 68], a: [62, 93], t: [56, 92] });
    // the start: the finish's top leg turned down about the hip onto the bottom leg, at the same lengths
    const ghost = pose(base, { k: [86.1, 88.8], a: [58.7, 93.4], t: [52.7, 92.4] });
    const items = eq === 'band' ? band([74, 70], [82, 94], 2, 2) : [];
    return {
      solid, ghost, eq: items, joint: 'p', arrows: [{ from: [94, 86], to: [84, 62], bulge: 6 }], floor: 101,
    };
  },

  side_lying({ mode = 'leg' } = {}) {
    const base = {
      h: [12, 80], s: [26, 90], p: [60, 90],
      E: [18, 97], W: [5, 94],
      K: [80, 94], A: [100, 97], T: [104, 93],
    };
    if (mode === 'leg') {
      const ghost = pose(base, { e: [40, 84], w: [54, 86], k: [80, 90], a: [100, 92], t: [104, 88] });
      const solid = pose(base, { e: [40, 84], w: [54, 86], k: [80, 78], a: [98, 66], t: [103, 63] });
      return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [110, 90], to: [106, 64], bulge: -6 }], floor: 101 };
    }
    // external rotation: elbow pinned at the ribs, forearm rotates up from the floor
    const ghost = pose(base, { e: [40, 88], w: [44, 98], k: [80, 90], a: [100, 92], t: [104, 88] });
    const solid = pose(base, { e: [40, 88], w: [42, 70], k: [80, 90], a: [100, 92], t: [104, 88] });
    const items = [...dumbbell([42, 67], true), ...ghosted(dumbbell([46, 100], true))];
    return { solid, ghost, eq: items, joint: 's', arrows: [{ from: [58, 96], to: [52, 70], bulge: -8 }], floor: 104 };
  },

  leg_side_cable({ mode = 'abduct', eq = 'cable' } = {}) {
    // Front view, standing on the left leg, the right leg (viewer's right) works.
    const base = pose(FRONT, { el: [30, 38], hl: [18, 44] });
    let ghost;
    let solid;
    let anchor;
    if (mode === 'abduct') {
      ghost = pose(base, { kr: [57, 79], ar: [58, 100], tr: [64, 100] });
      solid = pose(base, { kr: [68, 76], ar: [80, 94], tr: [86, 94] });
      anchor = [4, 96];
    } else {
      ghost = pose(base, { kr: [68, 76], ar: [80, 94], tr: [86, 94] });
      solid = pose(base, { kr: [52, 80], ar: [42, 98], tr: [36, 98] });
      anchor = [100, 96];
      if (eq === 'band') Object.assign(solid, { el: [34, 44], hl: [46, 40], er: [66, 44], hr: [54, 40] });
      if (eq === 'band') Object.assign(ghost, { el: [34, 44], hl: [46, 40], er: [66, 44], hr: [54, 40] });
    }
    const items = eq === 'cable'
      ? [L([anchor[0], 20], [anchor[0], FLOOR], 'rail'), C(anchor, 5, 'eq'), L(anchor, solid.ar, 'eq-line', { z: 'front' })]
      : [...post(anchor[0], 76), ...band(anchor, solid.ar, 3, 2.4)];
    if (mode === 'abduct') { solid.hl = [8, 36]; items.push(L([4, 20], [4, FLOOR], 'rail')); }
    const arrows = mode === 'abduct' ? [{ from: [62, 104], to: [90, 90], bulge: 6 }] : [{ from: [88, 104], to: [44, 108], bulge: -6 }];
    return { view: 'front', solid, ghost, eq: items, joint: 'pr', arrows, floor: FLOOR };
  },

  hip_machine({ mode = 'abduct' } = {}) {
    // Front view, seated: thighs point at the viewer, so knees sit just below the hips.
    const seated = {
      h: [50, 27], n: [50, 40], q: [50, 72],
      sl: [40, 43], sr: [60, 43], el: [33, 58], hl: [28, 72], er: [67, 58], hr: [72, 72],
      pl: [43, 73], pr: [57, 73],
    };
    const apart = { kl: [28, 80], al: [32, 100], tl: [26, 100], kr: [72, 80], ar: [68, 100], tr: [74, 100] };
    const together = { kl: [45, 82], al: [44, 100], tl: [38, 100], kr: [55, 82], ar: [56, 100], tr: [62, 100] };
    const solid = pose(seated, mode === 'abduct' ? apart : together);
    const ghost = pose(seated, mode === 'abduct' ? together : apart);
    const pads = mode === 'abduct'
      ? [RECT(14, 74, 21, 90, 'eq-block'), RECT(79, 74, 86, 90, 'eq-block')]
      : [RECT(46.5, 74, 53.5, 90, 'eq-block')];
    const items = [...machine(16, 84, 30), RECT(28, 70, 72, 77, 'eq-fill'), ...front(pads)];
    const arrows = mode === 'abduct' ? [{ from: [50, 106], to: [86, 100], bulge: 4 }] : [{ from: [92, 100], to: [60, 108], bulge: -4 }];
    return { view: 'front', solid, ghost, eq: items, joint: 'pr', arrows, floor: FLOOR };
  },

  band_walk({ at = 'knee' } = {}) {
    const ghost = pose(FRONT, { kr: [56, 80], ar: [56, 100], tr: [62, 100] });
    const solid = pose(FRONT, {
      h: [50, 19], n: [50, 32], q: [50, 64], sl: [40, 35], sr: [60, 35], el: [36, 50], hl: [40, 62], er: [64, 50], hr: [60, 62],
      pl: [44, 65], pr: [56, 65], kl: [34, 82], al: [32, 100], tl: [26, 100], kr: [70, 82], ar: [74, 100], tr: [80, 100],
    });
    Object.assign(ghost, { h: solid.h, n: solid.n, q: solid.q, sl: solid.sl, sr: solid.sr, el: solid.el, hl: solid.hl, er: solid.er, hr: solid.hr, pl: solid.pl, pr: solid.pr, kl: solid.kl, al: solid.al, tl: solid.tl, kr: [58, 82], ar: [56, 100], tr: [62, 100] });
    const items = at === 'knee' ? band([34, 82], [70, 82], 3, 2.4) : band([32, 94], [74, 94], 3, 2.4);
    return { view: 'front', solid, ghost, eq: items, joint: 'pr', arrows: [{ from: [70, 12], to: [100, 12], bulge: -6 }], floor: FLOOR };
  },

  /* ---------- machines for the legs */

  leg_press() {
    const base = { h: [12, 46], s: [22, 56], p: [44, 80], E: [32, 72], W: [42, 82], e: [34, 70], w: [44, 80] };
    const ghost = pose(base, { k: [50, 48], a: [74, 54], t: [80, 46], K: [48, 49], A: [72, 55], T: [78, 47] });
    const solid = pose(base, { k: [66, 64], a: [86, 44], t: [90, 34], K: [64, 65], A: [84, 45], T: [88, 35] });
    const items = [
      POLY([[2, 52], [10, 44], [50, 84], [40, 90]], 'eq-fill'), L([44, 88], [44, FLOOR], 'rail'),
      L([60, 96], [112, 26], 'rail'), L([60, 96], [60, FLOOR], 'rail'),
      POLY([[86, 26], [100, 40], [96, 44], [82, 30]], 'eq-block', { z: 'front' }),
      ...ghosted([POLY([[72, 38], [86, 52], [82, 56], [68, 42]], 'eq-block')]),
    ];
    return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [60, 36], to: [80, 22], bulge: -6 }], floor: FLOOR };
  },

  leg_extension({ partial = false } = {}) {
    const base = {
      h: [36, 27], s: [36, 42], p: [38, 74], e: [40, 58], w: [46, 74], E: [38, 59], W: [44, 75],
    };
    const ghost = partial
      ? pose(base, { k: [60, 73], a: [77, 89], t: [84, 92], K: [58, 74], A: [75, 90], T: [82, 93] })
      : pose(base, { k: [60, 73], a: [62, 99], t: [71, 100], K: [58, 74], A: [60, 99], T: [69, 100] });
    const solid = pose(base, { k: [60, 73], a: [85, 72], t: [89, 63], K: [58, 74], A: [83, 73], T: [87, 64] });
    const items = [
      ...machine(22, 64, 30, [24, 76, 56]), L([22, 30], [22, 76], 'rail'),
      ...front([RECT(82, 76, 92, 82, 'eq-block')]),
      ...ghosted(partial ? [RECT(74, 91, 84, 97, 'eq-block')] : [RECT(64, 96, 74, 102, 'eq-block')]),
    ];
    return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [74, 100], to: [98, 72], bulge: 8 }], floor: FLOOR };
  },

  leg_curl() {
    const base = {
      h: [90, 62], s: [78, 68], p: [42, 68], e: [86, 78], w: [94, 84], E: [84, 79], W: [92, 85],
    };
    const ghost = pose(base, { k: [20, 68], a: [-2, 68], t: [-7, 62], K: [20, 67], A: [-2, 67], T: [-7, 61] });
    const solid = pose(base, { k: [20, 68], a: [28, 46], t: [22, 40], K: [20, 67], A: [28, 45], T: [22, 39] });
    const items = [
      ...bench(8, 96, 72, FLOOR, 7), ...front([RECT(30, 40, 38, 52, 'eq-block')]),
      ...ghosted([RECT(-6, 58, 2, 66, 'eq-block')]),
    ];
    return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [-8, 50], to: [18, 34], bulge: 10 }], floor: FLOOR };
  },

  /* ---------- calves, shins and ankles */

  calf_raise({ mode = 'step' } = {}) {
    // On the toes (solid) from heels low (ghost). Step edge at x=56.
    const up = pose(STAND, {
      h: [50, 3], s: [50, 18], p: [50, 49], e: [52, 34], w: [54, 50], E: [48, 34], W: [47, 50],
      k: [52, 71], a: [51, 89], t: [60, 96], K: [48, 71], A: [47, 89], T: [56, 96],
    });
    const down = { ...STAND, a: [49, 100], t: [58, 96], A: [45, 100], T: [54, 96] };
    let solid = up;
    let ghost = down;
    let items = [];
    let floor = FLOOR;
    let arrow = { from: [76, 40], to: [76, 14], bulge: -4 };
    if (mode === 'step') {
      items = box(54, 96, 100);
      solid = pose(up, { t: [62, 96], T: [58, 96] });
      ghost = pose(down, { t: [62, 96], T: [58, 96] });
      floor = 108;
    } else if (mode === 'machine') {
      items = [...box(54, 96, 100), L([86, 0], [86, 108], 'rail'), L([86, 16], [52, 16], 'rail'), ...front([RECT(46, 12, 60, 20, 'eq-block')])];
      solid = pose(up, { t: [62, 96], T: [58, 96] });
      ghost = pose(down, { t: [62, 96], T: [58, 96] });
      floor = 108;
    } else if (mode === 'single') {
      items = [...box(54, 96, 100), ...wall(104, 20, 108)];
      solid = pose(up, { t: [62, 96], K: [44, 70], A: [36, 84], T: [38, 92], e: [70, 34], w: [100, 34] });
      ghost = pose(down, { t: [62, 96], K: [44, 78], A: [36, 92], T: [38, 100] });
      floor = 108;
    } else if (mode === 'heel-walk') {
      // floor only: up on the toes, ghost walking on the heels with toes up
      solid = pose(up, { a: [51, 92], t: [58, 100], A: [47, 92], T: [54, 100] });
      ghost = pose(STAND, { t: [58, 92], T: [54, 92] });
      floor = 104;
    } else if (mode === 'seated') {
      const base = {
        h: [32, 27], s: [32, 42], p: [36, 70], e: [44, 56], w: [56, 64], E: [42, 57], W: [54, 65],
        k: [60, 66], K: [58, 67],
      };
      solid = pose(base, { a: [62, 84], t: [70, 92], A: [60, 85], T: [68, 93] });
      ghost = pose(base, { k: [60, 72], K: [58, 73], a: [60, 92], t: [70, 88], A: [58, 93], T: [68, 89] });
      items = [...machine(18, 92, 40, [20, 74, 48]), ...front([RECT(52, 56, 74, 62, 'eq-block')]), ...box(64, 92, 96)];
      floor = FLOOR;
      arrow = { from: [84, 70], to: [84, 50], bulge: -4 };
    }
    return { solid, ghost, eq: items, joint: 'a', arrows: [arrow], floor };
  },

  hop({ mode = 'pogo' } = {}) {
    const air = pose(STAND, {
      h: [50, -9], s: [50, 6], p: [50, 37], e: [52, 22], w: [54, 38], E: [48, 22], W: [47, 38],
      k: [52, 59], a: [51, 80], t: [56, 88], K: [48, 59], A: [47, 80], T: [52, 88],
    });
    const toes = pose(STAND, {
      h: [50, 3], s: [50, 18], p: [50, 49], e: [56, 32], w: [62, 44], E: [44, 32], W: [38, 44],
      k: [52, 71], a: [51, 91], t: [58, 100], K: [48, 71], A: [47, 91], T: [54, 100],
    });
    if (mode === 'pogo') {
      return { solid: air, ghost: STAND, eq: [], joint: 'a', arrows: [{ from: [76, 96], to: [76, 64], bulge: -4 }], floor: FLOOR };
    }
    if (mode === 'point') {
      return { solid: toes, ghost: air, eq: [], joint: 'a', arrows: [{ from: [74, 70], to: [74, 96], bulge: 4 }], floor: FLOOR };
    }
    // jump rope: front view in the air, the rope arcing over the head
    const solid = pose(FRONT, {
      h: [50, 1], n: [50, 14], q: [50, 47], sl: [40, 17], sr: [60, 17], el: [33, 32], hl: [24, 40], er: [67, 32], hr: [76, 40],
      pl: [44, 48], pr: [56, 48], kl: [44, 69], al: [44, 88], tl: [40, 94], kr: [56, 69], ar: [56, 88], tr: [60, 94],
    });
    const items = [{ k: 'path', d: [['M', 24, 40], ['C', 8, -26, 92, -26, 76, 40]], cls: 'eq-line', z: 'front' }];
    return { view: 'front', solid, ghost: pose(FRONT, { el: [33, 46], hl: [24, 56], er: [67, 46], hr: [76, 56] }), eq: items, joint: 'ar', arrows: [{ from: [88, 100], to: [88, 76], bulge: -4 }], floor: FLOOR };
  },

  depth_drop() {
    const ghost = shift(STAND, -28, -34);
    const solid = {
      h: [70, 37], s: [66, 51], p: [52, 76],
      e: [76, 60], w: [84, 66], E: [74, 61], W: [82, 67],
      k: [76, 84], a: [70, 99], t: [79, 100], K: [73, 85], A: [67, 99], T: [76, 100],
    };
    return { solid, ghost, eq: box(0, 40, 70), joint: 'a', arrows: [{ from: [38, 28], to: [80, 30], bulge: -12 }], floor: FLOOR };
  },

  balance({ mode = 'pad' } = {}) {
    if (mode === 'pad') {
      const solid = pose(STAND, {
        a: [51, 94], t: [60, 94], k: [53, 73], p: [50, 51], s: [50, 20], h: [50, 5],
        e: [64, 28], w: [80, 30], E: [36, 28], W: [20, 30],
        K: [64, 64], A: [60, 84], T: [68, 86],
      });
      const ghost = { K: [48, 73], A: [47, 94], T: [56, 94], p: solid.p };
      return { solid, ghost, eq: [RECT(36, 96, 74, 102, 'eq-fill')], joint: 'a', arrows: [{ from: [80, 92], to: [72, 70], bulge: 6 }], floor: 104 };
    }
    // balance on one leg on a low step, seen from the front: the other foot lifted a little,
    // arms out a little; the standing ankle is the one working
    const solid = pose(FRONT, {
      el: [30, 39], hl: [20, 50], er: [70, 39], hr: [80, 50],
      kr: [59, 76], ar: [62, 90], tr: [68, 91],
    });
    return { view: 'front', solid, eq: box(26, 74, 104, 112), joint: 'al', arrows: [], floor: 112 };
  },

  tib_raise({ mode = 'wall' } = {}) {
    if (mode === 'wall') {
      const solid = {
        h: [32, 11], s: [31, 26], p: [36, 57], e: [33, 42], w: [37, 57], E: [31, 42], W: [34, 57],
        k: [46, 79], a: [56, 99], t: [62, 88], K: [44, 79], A: [53, 99], T: [59, 88],
      };
      const ghost = { a: [56, 99], t: [66, 100], A: [53, 99], T: [63, 100] };
      return { solid, ghost, eq: wall(22, 0), joint: 'a', arrows: [{ from: [74, 100], to: [70, 84], bulge: -6 }], floor: FLOOR };
    }
    if (mode === 'single') {
      // one heel on a low step, toes free and lifting; the other foot lifted clear of the floor
      const solid = pose(STAND, {
        k: [56, 80], a: [58, 97], t: [64, 84], K: [46, 76], A: [34, 86], T: [28, 78],
        e: [46, 40], w: [40, 50], E: [54, 40], W: [60, 50],
      });
      const ghost = { a: solid.a, t: [66, 97], A: solid.A, T: solid.T };
      const items = [...box(50, 96, 76)];
      return { solid, ghost, eq: items, joint: 'a', arrows: [{ from: [76, 92], to: [74, 78], bulge: -5 }], floor: FLOOR };
    }
    if (mode === 'bar') {
      const solid = pose(STAND, { t: [58, 90], T: [54, 90] });
      const ghost = { a: STAND.a, t: [61, 100], A: STAND.A, T: [57, 100] };
      const items = [...front([L([54, 92], [64, 86], 'eq'), C([66, 82], 7.5, 'eq')]), ...ghosted(front([C([68, 94], 7.5, 'eq')]))];
      return { solid, ghost, eq: items, joint: 'a', arrows: [{ from: [80, 100], to: [78, 80], bulge: -6 }], floor: FLOOR };
    }
    if (mode === 'seated') {
      const base = {
        h: [30, 27], s: [30, 42], p: [32, 72], e: [36, 58], w: [44, 70], E: [34, 59], W: [42, 71],
        k: [58, 70], a: [66, 88], K: [56, 71], A: [64, 89],
      };
      const solid = pose(base, { t: [72, 78], T: [70, 79] });
      const ghost = { a: base.a, t: [76, 92], A: base.A, T: [74, 93] };
      const items = [
        ...box(14, 40, 76), L([16, 30], [16, 76], 'rail'), ...box(58, 80, 92),
        ...front([C([74, 74], 6.5, 'eq')]), ...ghosted(front([C([78, 88], 6.5, 'eq')])),
      ];
      return { solid, ghost, eq: items, joint: 'a', arrows: [{ from: [88, 94], to: [84, 72], bulge: -6 }], floor: FLOOR };
    }
    // heel walk (mode 'heels'), or a sled dragged behind on a strap ('sled')
    // weight on the heels, both feet pointing steeply up so the toes are clearly off the floor
    const solid = pose(STAND, {
      k: [58, 79], a: [62, 100], t: [67, 90], K: [44, 79], A: [38, 100], T: [43, 90],
      e: [56, 42], w: [62, 54], E: [44, 42], W: [38, 54],
    });
    if (mode === 'heels') {
      return { solid, eq: [], joint: 'a', arrows: [{ from: [74, 98], to: [94, 98], bulge: 0 }], floor: FLOOR };
    }
    const items = [L([48, 60], [10, 84], 'eq-line', { z: 'front' }), POLY([[-14, 84], [16, 84], [20, 96], [-14, 96]], 'eq-fill'), L([-16, 100], [20, 100], 'eq')];
    return { solid, eq: items, joint: 'a', arrows: [{ from: [74, 30], to: [100, 30], bulge: -6 }], floor: FLOOR };
  },

  sled_push() {
    const solid = {
      h: [68, 28], s: [60, 40], p: [38, 64],
      e: [72, 52], w: [86, 50], E: [70, 53], W: [84, 51],
      k: [52, 84], a: [56, 96], t: [64, 100], K: [32, 84], A: [20, 94], T: [26, 100],
    };
    const ghost = { k: [52, 84], a: [52, 99], t: [62, 100], p: solid.p };
    const items = [L([88, 46], [88, 90], 'rail'), POLY([[86, 84], [116, 84], [118, 98], [86, 98]], 'eq-fill'), L([84, 101], [120, 101], 'eq')];
    return { solid, ghost, eq: items, joint: 'a', arrows: [{ from: [96, 30], to: [118, 30], bulge: -5 }], floor: FLOOR };
  },

  seated_ankle({ mode = 'band' } = {}) {
    const base = {
      h: [22, 49], s: [24, 64], p: [30, 95],
      k: [54, 95], a: [76, 95],
      K: [50, 76], A: [66, 95], T: [74, 96],
    };
    if (mode === 'band') {
      const solid = pose(base, { e: [14, 80], w: [10, 96], E: [16, 80], W: [12, 96], t: [80, 84] });
      const ghost = { a: base.a, t: [86, 94] };
      return { solid, ghost, eq: [...post(108, 70, 100), ...band([82, 86], [108, 80], 3, 2.2)], joint: 'a', arrows: [{ from: [92, 96], to: [86, 78], bulge: -6 }], floor: 100 };
    }
    const solid = pose(base, { e: [38, 74], w: [50, 78], E: [36, 75], W: [48, 79], t: [82, 86] });
    return {
      solid, eq: band([50, 78], [82, 86], 3, 2.2), joint: 'a',
      arrows: [{ circle: true, c: [80, 88], r: 10, from: 160, to: 430 }], floor: 100,
    };
  },

  /* ---------- floor core */

  crunch({ mode = 'situp' } = {}) {
    if (mode === 'situp') {
      const solid = pose(SUPINE, { p: [50, 95.5], h: [62, 50], s: [58, 64], e: [70, 74], w: [80, 70], E: [68, 75], W: [78, 71] });
      const ghost = pose(SUPINE, { p: [50, 95.5], s: [17, 95.5], h: [4, 88.5], e: [6, 96], w: [-6, 96], E: [6, 95], W: [-6, 95] });
      return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [6, 74], to: [46, 50], bulge: 10 }], floor: 100 };
    }
    if (mode === 'cable') {
      const solid = {
        h: [80, 72], s: [70, 64], m: [58, 56], p: [42, 70],
        e: [74, 78], w: [80, 66], E: [72, 79], W: [78, 67],
        k: [48, 98], a: [24, 98], t: [18, 98], K: [46, 98], A: [22, 98], T: [16, 98],
      };
      const ghost = { h: [46, 24], s: [44, 39], p: [42, 70], e: [52, 50], w: [52, 32], E: [50, 51], W: [50, 33] };
      const items = cable([60, 0], [80, 64], 0);
      return { solid, ghost, eq: items, joint: 'p', arrows: [{ from: [26, 34], to: [56, 76], bulge: 12 }], floor: 102 };
    }
    return null;
  },

  reverse_crunch({ eq = 'none' } = {}) {
    const ghost = pose(SUPINE, { k: [58, 72], a: [78, 72], t: [84, 68], K: [57, 73], A: [77, 73], T: [83, 69] });
    const solid = pose(SUPINE, { p: [56, 86], k: [42, 64], a: [62, 56], t: [66, 50], K: [41, 65], A: [61, 57], T: [65, 51] });
    const items = eq === 'cable' ? cable([104, 96], [62, 56], 74, 100) : [];
    return { solid, ghost, eq: items, joint: 'p', arrows: [{ from: [92, 70], to: [70, 46], bulge: 10 }], floor: 100 };
  },

  leg_raise() {
    const ghost = pose(SUPINE, { k: [80, 95.5], a: [100, 95.5], t: [105, 89], K: [80, 95], A: [100, 95], T: [105, 88] });
    const solid = pose(SUPINE, { k: [62, 74], a: [64, 52], t: [72, 50], K: [61, 75], A: [63, 53], T: [71, 51] });
    return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [104, 82], to: [78, 52], bulge: 12 }], floor: 100 };
  },

  hollow({ v = false } = {}) {
    const flat = pose(SUPINE, {
      h: [14, 88.5], s: [27, 95.5], e: [14, 96], w: [0, 96], E: [14, 95], W: [0, 95],
      k: [80, 95.5], a: [100, 95.5], t: [105, 89], K: [80, 95], A: [100, 95], T: [105, 88],
    });
    if (v) {
      const solid = {
        h: [28, 54], s: [36, 67], p: [54, 94],
        e: [52, 56], w: [64, 46], E: [50, 57], W: [62, 47],
        k: [70, 76], a: [80, 56], t: [86, 52], K: [69, 77], A: [79, 57], T: [85, 53],
      };
      return { solid, ghost: flat, eq: [], joint: 'p', arrows: [{ from: [6, 82], to: [26, 60], bulge: 6 }, { from: [104, 82], to: [90, 56], bulge: -6 }], floor: 100 };
    }
    const solid = {
      h: [22, 76], s: [34, 86], p: [58, 95.5],
      e: [20, 80], w: [6, 72], E: [20, 81], W: [6, 73],
      k: [78, 88], a: [98, 80], t: [103, 74], K: [78, 89], A: [98, 81], T: [103, 75],
    };
    return { solid, ghost: flat, eq: [], joint: 'p', arrows: [{ from: [110, 94], to: [108, 72], bulge: -4 }], floor: 100 };
  },

  dead_bug() {
    const base = pose(SUPINE, { E: [27, 78], W: [28, 60], K: [60, 74], A: [78, 74], T: [83, 70] });
    const ghost = pose(base, { e: [29, 78], w: [30, 60], k: [62, 74], a: [80, 74], t: [85, 70] });
    const solid = pose(base, { e: [12, 92], w: [-4, 90], k: [78, 88], a: [98, 86], t: [103, 80] });
    return { solid, ghost, eq: [], joint: 'p', arrows: [{ from: [30, 52], to: [-6, 80], bulge: 10 }, { from: [92, 72], to: [104, 84], bulge: -4 }], floor: 100 };
  },

  russian_twist() {
    const base = {
      h: [28, 52], s: [34, 66], p: [50, 94],
      k: [68, 72], a: [84, 82], t: [90, 78], K: [67, 73], A: [83, 83], T: [89, 79],
    };
    const ghost = pose(base, { e: [46, 78], w: [60, 70], E: [44, 79], W: [58, 71] });
    const solid = pose(base, { e: [46, 78], w: [56, 88], E: [44, 76], W: [54, 86] });
    const items = [...dumbbell([56, 90], false), ...ghosted(dumbbell([62, 68], false))];
    return { solid, ghost, eq: items, joint: 'p', arrows: [{ from: [72, 62], to: [70, 92], bulge: -10 }], floor: 100 };
  },

  /* ---------- neck */

  neck_lying({ face = 'up' } = {}) {
    const body = face === 'up'
      ? { s: [38, 68], p: [72, 68], e: [44, 56], w: [36, 46], E: [42, 57], W: [34, 47], k: [90, 66], a: [94, 100], t: [103, 100], K: [88, 67], A: [90, 100], T: [99, 100] }
      : { s: [38, 68], p: [72, 68], e: [34, 56], w: [24, 50], E: [32, 57], W: [22, 51], k: [92, 69], a: [110, 70], t: [114, 76], K: [92, 68], A: [110, 69], T: [114, 75] };
    const solid = face === 'up' ? { ...body, h: [28, 54] } : { ...body, h: [24, 56] };
    const ghost = face === 'up' ? { s: body.s, h: [24, 78] } : { s: body.s, h: [27, 80] };
    const items = [...bench(34, 100, 72), ...plate(face === 'up' ? [30, 42] : [20, 44], 8)];
    return { solid, ghost, eq: items, joint: neckOf(solid), arrows: [{ from: [10, 84], to: [12, 56], bulge: -8 }], floor: FLOOR };
  },

  neck_band() {
    const base = {
      s: [40, 42], p: [40, 74], e: [44, 58], w: [54, 68], E: [42, 59], W: [52, 69],
      k: [62, 73], a: [64, 100], t: [73, 100], K: [60, 74], A: [60, 100], T: [69, 100],
    };
    const solid = { ...base, h: [36, 27] };
    const ghost = { s: base.s, h: [50, 31] };
    const items = [...box(28, 52, 76), L([28, 40], [28, 76], 'rail'), ...post(104, 18), ...band([34, 18], [104, 26], 4, 2.4)];
    return { solid, ghost, eq: items, joint: neckOf(solid), arrows: [{ from: [56, 14], to: [36, 8], bulge: -6 }], floor: FLOOR };
  },
};

/* ------------------------------------------------------------------ the table: id -> archetype */

// Every exercise, explicitly. [archetype, options]. Fix a wrong picture here.
export const EXERCISE_DIAGRAMS = {
  // chest
  'push-up': ['push_up'],
  'incline-push-up': ['push_up', { variant: 'feet-up' }],
  'bench-press': ['press_bench', { eq: 'bb' }],
  'incline-press-dumbbell': ['press_incline'],
  'cable-fly': ['fly'],
  'dumbbell-press-home': ['press_floor'],
  'chest-press-machine': ['press_seated'],
  // shoulders
  'pike-push-up': ['pike_push'],
  'lateral-raise': ['raise_lateral'],
  'shoulder-press': ['press_overhead', { eq: 'bb' }],
  'rear-delt-fly': ['raise_rear'],
  'upright-row-cable': ['upright_row'],
  'band-face-pull': ['face_pull', { eq: 'band' }],
  // biceps
  'db-curl': ['curl', { grip: 'db' }],
  'hammer-curl': ['curl', { grip: 'hammer' }],
  'barbell-curl': ['curl', { grip: 'bb' }],
  'incline-curl': ['curl_incline'],
  'preacher-curl': ['curl_preacher'],
  'band-curl': ['curl', { grip: 'band' }],
  'chin-up': ['pull_hanging', { grip: 'under' }],
  // triceps
  'diamond-push-up': ['push_up', { variant: 'diamond' }],
  'bench-dip': ['dip'],
  'skull-crusher': ['press_bench', { eq: 'bb', mode: 'skull' }],
  'rope-pushdown': ['pushdown'],
  'overhead-extension': ['overhead_extension'],
  'close-grip-press': ['press_bench', { eq: 'bb', mode: 'close' }],
  // grip
  'dead-hang-hold': ['hang'],
  'plate-pinch': ['stand_hold', { eq: 'plate' }],
  'towel-hang': ['hang', { towel: true }],
  'hand-gripper': ['gripper'],
  'fat-grip-hold': ['hold_fat_grip'],
  'finger-curl-bar': ['wrist_roller'],
  'wrist-roller-home': ['towel_wring'],
  // forearms
  'wrist-curl': ['wrist', { mode: 'curl' }],
  'wrist-extension': ['wrist', { mode: 'extension' }],
  'farmer-carry': ['carry'],
  'dead-hang': ['hang'],
  'reverse-curl': ['curl', { grip: 'reverse' }],
  // abs
  plank: ['plank'],
  'dead-bug': ['dead_bug'],
  'cable-crunch': ['crunch', { mode: 'cable' }],
  'hanging-leg-raise': ['hang', { legs: 'straight' }],
  'ab-wheel': ['ab_wheel'],
  'sit-up': ['crunch', { mode: 'situp' }],
  'reverse-crunch': ['reverse_crunch'],
  'lying-leg-raise': ['leg_raise'],
  'hollow-hold': ['hollow'],
  'v-up': ['hollow', { v: true }],
  'mountain-climber': ['push_up', { variant: 'climber' }],
  'hanging-knee-raise': ['hang', { legs: 'knees' }],
  'cable-reverse-crunch': ['reverse_crunch', { eq: 'cable' }],
  // obliques
  'side-plank': ['plank', { side: true }],
  'russian-twist': ['russian_twist'],
  'wood-chop': ['wood_chop'],
  'suitcase-carry': ['carry', { oneHand: true }],
  'pallof-press': ['pallof'],
  // upper back
  'seated-row': ['pull_seated_row'],
  'barbell-row': ['row_bent', { eq: 'bb' }],
  'db-row': ['row_one_arm'],
  'face-pull-cable': ['face_pull', { eq: 'cable' }],
  'inverted-row': ['inverted_row'],
  shrug: ['shrug'],
  // rotator cuff
  'band-external-rotation': ['rotate', { dir: 'out', eq: 'band' }],
  'band-internal-rotation': ['rotate', { dir: 'in', eq: 'band' }],
  'side-lying-external-rotation': ['side_lying', { mode: 'rotation' }],
  'face-pull-rotator': ['face_pull', { eq: 'cable', high: true }],
  'prone-y-raise': ['prone_y'],
  scarecrow: ['scarecrow'],
  'cable-external-rotation': ['rotate', { dir: 'out', eq: 'cable' }],
  // lats
  'pull-up': ['pull_hanging', { grip: 'over' }],
  'lat-pulldown': ['pull_down', { eq: 'machine' }],
  'band-pulldown': ['pull_down', { eq: 'band' }],
  'straight-arm-pulldown': ['pull_straight_arm'],
  'db-pullover': ['press_bench', { eq: 'db', mode: 'pullover' }],
  // lower back
  'back-extension': ['back_extension'],
  superman: ['superman'],
  'good-morning': ['hinge', { mode: 'good-morning' }],
  'bird-dog': ['bird_dog'],
  // abductors
  clamshell: ['clamshell'],
  'lateral-band-walk': ['band_walk', { at: 'knee' }],
  'side-lying-raise': ['side_lying', { mode: 'leg' }],
  'abductor-machine': ['hip_machine', { mode: 'abduct' }],
  'cable-hip-abduction': ['leg_side_cable', { mode: 'abduct', eq: 'cable' }],
  'single-leg-hip-hinge': ['hinge', { mode: 'single-leg' }],
  'lateral-step-up': ['step_lateral'],
  // glutes
  'hip-thrust': ['hip_thrust'],
  'glute-bridge': ['glute_bridge'],
  'bulgarian-split-squat': ['lunge', { eq: 'db', rear: 'bench' }],
  'cable-kickback': ['hinge', { mode: 'kickback' }],
  'band-walk': ['band_walk', { at: 'ankle' }],
  // adductors
  'copenhagen-plank': ['copenhagen'],
  'adductor-machine': ['hip_machine', { mode: 'adduct' }],
  'cable-adduction': ['leg_side_cable', { mode: 'adduct', eq: 'cable' }],
  'sumo-squat': ['squat_wide', { kind: 'sumo' }],
  'side-lunge': ['squat_wide', { kind: 'side-lunge' }],
  'cossack-squat': ['squat_wide', { kind: 'cossack' }],
  'band-adduction': ['leg_side_cable', { mode: 'adduct', eq: 'band' }],
  // quads
  squat: ['squat', { eq: 'bb' }],
  'goblet-squat': ['squat', { eq: 'kb' }],
  'leg-press': ['leg_press'],
  lunge: ['lunge'],
  'leg-extension': ['leg_extension'],
  'step-up': ['step_up'],
  // hamstrings
  deadlift: ['hinge', { eq: 'bb' }],
  'db-rdl': ['hinge', { eq: 'db' }],
  'leg-curl': ['leg_curl'],
  'nordic-curl': ['kneel_lean'],
  'glute-ham-raise': ['kneel_lean', { machine: true }],
  // tibialis
  'tibialis-raise': ['tib_raise', { mode: 'wall' }],
  'wall-toe-raise': ['tib_raise', { mode: 'seated' }],
  'toe-walk': ['tib_raise', { mode: 'heels' }],
  'band-dorsiflexion': ['seated_ankle', { mode: 'band' }],
  'tib-bar-raise': ['tib_raise', { mode: 'bar' }],
  'single-leg-balance-toe': ['tib_raise', { mode: 'single' }],
  'sled-drag-heel': ['tib_raise', { mode: 'sled' }],
  // calves
  'standing-calf-raise': ['calf_raise', { mode: 'machine' }],
  'seated-calf-raise': ['calf_raise', { mode: 'seated' }],
  'single-leg-calf-raise': ['calf_raise', { mode: 'single' }],
  'jump-rope': ['hop', { mode: 'rope' }],
  // knees
  'wall-sit': ['squat', { eq: 'wall' }],
  'terminal-knee-extension': ['tke'],
  'spanish-squat': ['squat', { eq: 'band' }],
  'step-down': ['step_down', { tap: 'down' }],
  'leg-extension-partial': ['leg_extension', { partial: true }],
  'sissy-squat': ['squat', { eq: 'sissy' }],
  'copenhagen-knee': ['step_down', { tap: 'front' }],
  // ankles
  'pogo-hop': ['hop', { mode: 'pogo' }],
  'ankle-hop-in': ['hop', { mode: 'point' }],
  'ankle-circle-load': ['seated_ankle', { mode: 'circle' }],
  'calf-stretch-strength': ['calf_raise', { mode: 'heel-walk' }],
  'single-leg-balance-pad': ['balance', { mode: 'pad' }],
  'depth-drop-land': ['depth_drop'],
  'sled-ankle-push': ['sled_push'],
  // neck
  'neck-flexion': ['neck_lying', { face: 'up' }],
  'neck-extension': ['neck_band'],
  'neck-side': ['neck_side'],
  'neck-harness': ['hinge', { mode: 'harness' }],
  'neck-plate-extension': ['neck_lying', { face: 'down' }],
};

// Two archetypes that only a couple of movements use.
A.wrist = ({ mode = 'curl' } = {}) => {
  if (mode === 'curl') {
    const base = {
      h: [56, 25], s: [50, 39], p: [30, 68], e: [46, 62], w: [64, 62], E: [44, 63], W: [62, 63],
      k: [60, 68], a: [62, 100], t: [71, 100], K: [58, 69], A: [58, 100], T: [67, 100],
    };
    const solid = pose(base, { x: [70, 52], X: [68, 53] });
    const ghost = { w: base.w, x: [69, 72], W: base.W, X: [67, 73] };
    const items = [...box(10, 40, 72), ...dumbbell([72, 48], true), ...ghosted(dumbbell([70, 76], true))];
    return { solid, ghost, eq: items, joint: 'w', arrows: [{ from: [84, 76], to: [84, 50], bulge: -6 }], floor: FLOOR };
  }
  // extension: kneeling beside a bench, forearms flat on it, palms down, hands over the end
  const base = {
    h: [54, 32], s: [48, 46], p: [30, 72], e: [60, 62], w: [80, 62], E: [58, 63], W: [78, 63],
    k: [36, 100], a: [12, 100], t: [6, 100], K: [34, 100], A: [10, 100], T: [4, 100],
  };
  const solid = pose(base, { x: [88, 54], X: [86, 55] });
  const ghost = { w: base.w, x: [86, 74], W: base.W, X: [84, 75] };
  const items = [...bench(50, 82, 66), ...dumbbell([90, 50], true), ...ghosted(dumbbell([88, 78], true))];
  return { solid, ghost, eq: items, joint: 'w', arrows: [{ from: [100, 76], to: [100, 50], bulge: -6 }], floor: FLOOR };
};

A.tke = () => {
  const solid = pose(STAND, { k: [52, 79], K: [47, 79], A: [44, 100], T: [53, 100] });
  // a soft knee lowers the hips: the leg is no shorter, it is bent
  const ghost = {
    ...shift(solid, -2, 3.5, ['h', 's', 'e', 'w', 'E', 'W']), p: [48, 60.5], k: [58, 80.2], K: [53, 80],
  };
  const items = [...post(104, 66), ...band([54, 80], [104, 82], 4, 2.4)];
  return { solid, ghost, eq: items, joint: 'k', arrows: [{ from: [72, 64], to: [60, 66], bulge: -4 }], floor: FLOOR };
};

/** Only for an id missing from the table: a keyword guess, never a crash. */
function guess(id) {
  const rules = [
    [/curl/, ['curl']], [/press/, ['press_overhead', { eq: 'db' }]], [/squat/, ['squat', { eq: 'kb' }]],
    [/deadlift|rdl|hinge/, ['hinge', { eq: 'db' }]], [/row/, ['row_bent', { eq: 'db' }]], [/lunge/, ['lunge']],
    [/raise/, ['raise_lateral']], [/plank/, ['plank']], [/calf/, ['calf_raise']], [/hang|pull/, ['hang']],
  ];
  for (const [re, entry] of rules) if (re.test(id)) return entry;
  return ['stand_hold', { eq: 'db' }];
}

/* ------------------------------------------------------------------ rendering */

const scenes = new Map();
function scene(id) {
  const key = String(id);
  if (!scenes.has(key)) scenes.set(key, buildScene(id));
  return scenes.get(key);
}

function buildScene(id) {
  const [name, opts] = EXERCISE_DIAGRAMS[id] ?? guess(String(id));
  const built = A[name](opts ?? {});
  const view = built.view ?? 'side';
  const solid = built.solid;
  const ghostKeys = built.ghost ? Object.keys(built.ghost) : [];
  // A ghost may list only the joints that move; fill the rest from the solid pose.
  let ghost = built.ghost ? startPose(solid, { ...solid, ...built.ghost }, ghostKeys, view) : null;
  let eq = built.eq ?? [];
  if (ghost && !built.startAsDrawn) {
    const drawn = ghost;
    ghost = fitStart(solid, drawn, view, built.floor, built.hold ?? []);
    eq = carryGhostEq(eq, drawn, ghost);
  }
  return {
    name, view, solid, ghost, eq, joint: built.joint, arrows: built.arrows ?? [], floor: built.floor, ghostKeys,
    startAsDrawn: built.startAsDrawn ?? null, via: built.via ?? null,
  };
}

/* ------------------------------------------------------------------ one skeleton, two poses */

// The bones of the figure. Some are drawn (limbs), some are not (head to shoulder, shoulders to the
// neck in a front view) but are still bones: the same figure, so the same lengths in both poses.
export const BONES = {
  side: [
    ['s', 'h'], ['s', 'm'], ['m', 'p'], ['s', 'p'],
    ['s', 'e'], ['e', 'w'], ['w', 'x'], ['s', 'E'], ['E', 'W'], ['W', 'X'],
    ['p', 'k'], ['k', 'a'], ['a', 't'], ['p', 'K'], ['K', 'A'], ['A', 'T'],
  ],
  front: [
    ['n', 'h'], ['n', 'q'], ['n', 'sl'], ['n', 'sr'], ['sl', 'el'], ['el', 'hl'], ['sr', 'er'], ['er', 'hr'],
    ['q', 'pl'], ['q', 'pr'], ['pl', 'kl'], ['kl', 'al'], ['al', 'tl'], ['pr', 'kr'], ['kr', 'ar'], ['ar', 'tr'],
  ],
};
/** The bones present in a pose: a mid-spine point replaces the straight shoulder-hip bone. */
export function bonesOf(keys, view) {
  const has = (k) => keys.includes(k);
  return BONES[view === 'front' ? 'front' : 'side'].filter(([a, b]) => has(a) && has(b) && !(a === 's' && b === 'p' && has('m')));
}

const MOVE_EPS = 1.5; // a joint that travels less than this (design units) is planted
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** The start pose as drawn, made whole: a straight back unless it bends its own, far limbs going with near. */
function startPose(solid, ghost, ghostKeys, view) {
  const out = { ...ghost };
  // A ghost that bends no mid-spine of its own takes a straight back, not the solid's bend.
  if (solid.m && !ghostKeys.includes('m')) out.m = lerp(out.s, out.p, 0.5);
  // A start pose that moves the hips and the near knee but leaves the far knee where it was (the
  // plank's sag) would tear the far leg off the hips: the far knee goes with the near one.
  if (view === 'side') {
    for (const [near, far, root] of [['k', 'K', 'p'], ['e', 'E', 's']]) {
      const moves = (k) => solid[k] && out[k] && dist(solid[k], out[k]) > MOVE_EPS;
      if (moves(near) && moves(root) && solid[far] && same(solid[far], out[far])) {
        out[far] = add(solid[far], out[near][0] - solid[near][0], out[near][1] - solid[near][1]);
      }
    }
  }
  return out;
}

/**
 * The start pose redrawn on the finish pose's skeleton: every bone takes its length in `solid`,
 * and keeps its drawn direction wherever it can. Joints that hold the figure in place stay exactly
 * where they are drawn: a hand or toe that does not move between the poses (on a bar, a handle, the
 * floor), anything lying still on the floor, and any joint the archetype names in `hold` (an ankle
 * on a bench); a joint on the floor that moves may slide along it. Between two such anchors the
 * chain is solved inward (only the elbows, knees and hips in between move); every limb hanging off
 * that frame is laid out from it bone by bone, in the drawn direction at the finish length.
 */
function fitStart(solid, ghost, view, floor, hold) {
  const keys = Object.keys(ghost);
  const bones = bonesOf(keys, view);
  const adj = new Map(keys.map((k) => [k, []]));
  for (const [a, b] of bones) { adj.get(a).push(b); adj.get(b).push(a); }
  const inSkeleton = keys.filter((k) => adj.get(k).length);
  const travel = (k) => dist(ghost[k], solid[k]);
  // a joint resting on the floor may slide along it, but not leave it
  const onFloor = (k) => floor != null && ghost[k][1] >= floor - 5 && ghost[k][1] <= floor + 0.5;
  // Contacts: a hand or foot that does not move (on a bar, a handle, the floor), and anything lying
  // on the floor that does not move (an elbow in a plank, the back in a bridge).
  const contact = (k, eps) => hold.includes(k) || (travel(k) < eps && (ENDS.has(k) || onFloor(k)));
  // Strictest first; a foot may lift off the floor only when nothing else fits (stepping off a box
  // to hang from a bar)
  const attempts = [[MOVE_EPS, true], [0.01, true], [0.01, false]];
  let best = null;
  for (const [eps, slide] of attempts) {
    const pins = new Set(inSkeleton.filter((k) => contact(k, eps)));
    const slides = new Set(slide ? inSkeleton.filter((k) => !pins.has(k) && onFloor(k)) : []);
    if (!pins.size && !slides.size) pins.add(view === 'front' ? 'q' : 'p');
    // the joints the drawing moves are where it wants them: they give way less than the rest
    const stiff = (k) => (travel(k) >= MOVE_EPS ? 0.25 : 1);
    const fit = fitWith(solid, ghost, keys, bones, adj, pins, slides, stiff);
    if (!best || fit.residual < best.residual - 1e-9) best = fit;
    if (fit.residual < 1e-9) break;
  }
  const out = best.out;
  // a joint that comes back to where the finish has it is the finish's joint
  for (const k of keys) if (dist(out[k], solid[k]) < 1e-9) out[k] = solid[k];
  return out;
}
const ENDS = new Set(['w', 'W', 'x', 'X', 't', 'T', 'hl', 'hr', 'tl', 'tr']); // hands, fingertips, toes

function fitWith(solid, ghost, keys, bones, adj, pins, slides, stiff) {
  // the frame: the joints on a path between two anchors (prune free leaves until none is left)
  const core = new Set(keys.filter((k) => adj.get(k).length));
  for (let pruned = true; pruned;) {
    pruned = false;
    for (const k of [...core]) {
      if (pins.has(k) || slides.has(k)) continue;
      if (adj.get(k).filter((n) => core.has(n)).length <= 1) { core.delete(k); pruned = true; }
    }
  }
  const out = {};
  for (const k of keys) out[k] = [...ghost[k]];
  const frame = bones.filter(([a, b]) => core.has(a) && core.has(b)).map(([a, b]) => [a, b, dist(solid[a], solid[b])]);
  // Unknowns: x and y of each free joint in the frame, x only for one on the floor.
  const vars = [];
  for (const k of core) {
    if (pins.has(k)) continue;
    vars.push([k, 0]);
    if (!slides.has(k)) vars.push([k, 1]);
  }
  const residual = settleBones(out, frame, vars, stiff);
  // lay out everything hanging off the frame, bone by bone, in the drawn direction
  const placed = new Set(core);
  const queue = [...core];
  while (queue.length) {
    const p = queue.shift();
    for (const c of adj.get(p)) {
      if (placed.has(c)) continue;
      const v = [ghost[c][0] - ghost[p][0], ghost[c][1] - ghost[p][1]];
      const l = Math.hypot(v[0], v[1]);
      const L = dist(solid[p], solid[c]);
      const w = l > 1e-9 ? v : [solid[c][0] - solid[p][0], solid[c][1] - solid[p][1]];
      const wl = Math.hypot(w[0], w[1]) || 1;
      out[c] = [out[p][0] + (w[0] / wl) * L, out[p][1] + (w[1] / wl) * L];
      placed.add(c);
      queue.push(c);
    }
  }
  return { out, residual };
}

/**
 * Move the joints named in `vars` ([joint, axis] pairs: 0 for x, 1 for y) until every bone in
 * `bones` ([a, b, length]) has its length, changing `joints` in place. Gauss-Newton, smallest
 * (weighted by `stiff`) step each time: the joints move as little as the lengths need, so the limbs
 * keep the directions they had. Damped, halved when a step makes it worse. Returns the largest
 * length error left (0 when the lengths can all be met).
 */
export function settleBones(joints, bones, vars, stiff = () => 1, iterations = 200) {
  const out = joints;
  const residuals = () => bones.map(([a, b, L]) => dist(out[a], out[b]) - L);
  const worst = () => Math.max(0, ...residuals().map(Math.abs));
  for (let it = 0; it < iterations && vars.length && bones.length; it += 1) {
    const r = residuals();
    const e0 = Math.max(...r.map(Math.abs));
    if (e0 < 1e-12) break;
    const J = bones.map(([a, b]) => {
      const d = [out[b][0] - out[a][0], out[b][1] - out[a][1]];
      const l = Math.hypot(d[0], d[1]) || 1e-9;
      return vars.map(([k, ax]) => (k === b ? d[ax] / l : k === a ? -d[ax] / l : 0));
    });
    // (J W J^T + mu I) y = r ; step = -W J^T y
    const give = vars.map(([k]) => stiff(k));
    const M = J.map((ri, i) => J.map((rj, j) => ri.reduce((sum, v, c) => sum + v * give[c] * rj[c], 0) + (i === j ? 1e-9 + 1e-3 * e0 : 0)));
    const y = solveLinear(M, r);
    if (!y) break;
    const step = vars.map((_, c) => -give[c] * J.reduce((sum, row, i) => sum + row[c] * y[i], 0));
    const saved = vars.map(([k, ax]) => out[k][ax]);
    let scale = 1;
    for (; scale > 1e-4; scale /= 2) {
      vars.forEach(([k, ax], c) => { out[k] = [...out[k]]; out[k][ax] = saved[c] + step[c] * scale; });
      if (worst() < e0) break;
    }
    if (scale <= 1e-4) { vars.forEach(([k, ax], c) => { out[k][ax] = saved[c]; }); break; }
  }
  return worst();
}

/** Gaussian elimination with partial pivoting; null when the system is singular. */
function solveLinear(M, r) {
  const n = r.length;
  const A2 = M.map((row, i) => [...row, r[i]]);
  for (let c = 0; c < n; c += 1) {
    let piv = c;
    for (let i = c + 1; i < n; i += 1) if (Math.abs(A2[i][c]) > Math.abs(A2[piv][c])) piv = i;
    if (Math.abs(A2[piv][c]) < 1e-15) return null;
    [A2[c], A2[piv]] = [A2[piv], A2[c]];
    for (let i = c + 1; i < n; i += 1) {
      const f = A2[i][c] / A2[c][c];
      for (let j = c; j <= n; j += 1) A2[i][j] -= f * A2[c][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i -= 1) {
    let sum = A2[i][n];
    for (let j = i + 1; j < n; j += 1) sum -= A2[i][j] * x[j];
    x[i] = sum / A2[i][i];
  }
  return x;
}

/** Equipment drawn faint at the start goes where the hand (or foot) holding it went. */
function carryGhostEq(eq, drawn, fitted) {
  const keys = Object.keys(drawn);
  const moved = (k) => [fitted[k][0] - drawn[k][0], fitted[k][1] - drawn[k][1]];
  const reach = (pt, k) => dist(pt, drawn[k]) - (k === 'h' ? HEAD_R : 0);
  const nearest = (pt, within) => {
    let best = null;
    let bd = within;
    for (const k of keys) { const d = reach(pt, k); if (d <= bd) { bd = d; best = k; } }
    return best;
  };
  const tr = (pt, o) => [pt[0] + o[0], pt[1] + o[1]];
  const byGroup = new Map();
  for (const it of eq) if (it.ghost && it.grp != null) byGroup.set(it.grp, [...(byGroup.get(it.grp) ?? []), ...itemPoints(it)]);
  const groupOff = new Map([...byGroup].map(([g, pts]) => {
    const k = nearest(centroid(pts), 14);
    return [g, k ? moved(k) : [0, 0]];
  }));
  return eq.map((it) => {
    if (!it.ghost) return it;
    if (it.band) {
      const ka = nearest(it.band.a, 6);
      const kb = nearest(it.band.b, 6);
      const a = ka ? tr(it.band.a, moved(ka)) : it.band.a;
      const b = kb ? tr(it.band.b, moved(kb)) : it.band.b;
      return { ...it, band: { ...it.band, a, b }, d: bandPath(a, b, it.band.waves, it.band.amp) };
    }
    if (it.k === 'line' && it.grp == null) {
      const ka = nearest(it.a, 6);
      const kb = nearest(it.b, 6);
      return { ...it, a: ka ? tr(it.a, moved(ka)) : it.a, b: kb ? tr(it.b, moved(kb)) : it.b };
    }
    let o = groupOff.get(it.grp);
    if (!o) { const k = nearest(centroid(itemPoints(it)), 14); o = k ? moved(k) : [0, 0]; }
    if (Math.hypot(o[0], o[1]) < 1e-9) return it;
    if (it.k === 'line') return { ...it, a: tr(it.a, o), b: tr(it.b, o) };
    if (it.k === 'circle') return { ...it, c: tr(it.c, o) };
    if (it.k === 'poly') return { ...it, pts: it.pts.map((p) => tr(p, o)) };
    return { ...it, d: it.d.map(([op, ...v]) => [op, ...v.map((val, i) => val + o[i % 2])]) };
  });
}

const same = (a, b) => Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01;

function eqPoints(item) {
  // [point, margin in output px] pairs for the bounding box
  const out = [];
  if (item.k === 'line') { out.push([item.a, 2], [item.b, 2]); }
  if (item.k === 'circle') {
    const [x, y] = item.c;
    out.push([[x - item.r, y - item.r], 2], [[x + item.r, y + item.r], 2]);
  }
  if (item.k === 'poly') for (const pt of item.pts) out.push([pt, 1.5]);
  if (item.k === 'path') {
    for (const cmd of item.d) for (let i = 1; i < cmd.length; i += 2) out.push([[cmd[i], cmd[i + 1]], 2]);
  }
  return out;
}

/** Where the drawing sits in the 120 box: the scale and offset that make the scene fill it. */
function layout(sc) {
  const solidSegs = segments(sc.solid, sc.view);
  const ghostSegs = sc.ghost
    ? segments(sc.ghost, sc.view).filter((g) => !solidSegs.some((s) => same(s.a, g.a) && same(s.b, g.b)))
    : [];
  const ghostHead = sc.ghost && !same(sc.ghost.h, sc.solid.h) ? sc.ghost.h : null;

  // Bounding box in design units, with margins in output pixels.
  const pts = [];
  for (const sg of [...solidSegs, ...ghostSegs]) pts.push([sg.a, LIMB_HALF], [sg.b, LIMB_HALF]);
  pts.push([sc.solid.h, HEAD_OUT]);
  if (ghostHead) pts.push([ghostHead, HEAD_OUT]);
  for (const it of sc.eq) pts.push(...eqPoints(it));
  for (const ar of sc.arrows) {
    if (ar.circle) pts.push([[ar.c[0] - ar.r, ar.c[1] - ar.r], 3], [[ar.c[0] + ar.r, ar.c[1] + ar.r], 3]);
    else pts.push([ar.from, 3], [ar.to, 5]);
  }
  const ys = sc.floor != null ? [sc.floor] : [];

  let s = 1;
  let box = null;
  for (let i = 0; i < 4; i += 1) {
    let minX = Infinity; let maxX = -Infinity; let minY = Infinity; let maxY = -Infinity;
    for (const [[x, y], m] of pts) {
      minX = Math.min(minX, x - m / s); maxX = Math.max(maxX, x + m / s);
      minY = Math.min(minY, y - m / s); maxY = Math.max(maxY, y + m / s);
    }
    for (const y of ys) { minY = Math.min(minY, y - 1.5 / s); maxY = Math.max(maxY, y + 1.5 / s); }
    box = { minX, maxX, minY, maxY };
    s = Math.min(1.7, (SIZE - 2 * PAD) / Math.max(maxX - minX, maxY - minY));
  }
  const tx = SIZE / 2 - s * (box.minX + box.maxX) / 2;
  const ty = SIZE / 2 - s * (box.minY + box.maxY) / 2;
  const X = (x) => r1(tx + s * x);
  const Y = (y) => r1(ty + s * y);
  return { solidSegs, ghostSegs, ghostHead, s, box, X, Y };
}

/** Drawing helpers bound to one layout: equipment, a limb segment, a head. Same markup everywhere. */
function painter(sc, { s, X, Y }) {
  const P = (pt) => [X(pt[0]), Y(pt[1])];
  const cls = (base, item) => `${base}${item.ghost ? ' ghost' : ''}`;
  const drawEq = (it) => {
    const c = cls(it.cls, it);
    if (it.k === 'line') return `<line class="${c}" x1="${X(it.a[0])}" y1="${Y(it.a[1])}" x2="${X(it.b[0])}" y2="${Y(it.b[1])}"/>`;
    if (it.k === 'circle') return `<circle class="${c}" cx="${X(it.c[0])}" cy="${Y(it.c[1])}" r="${r1(it.r * s)}"/>`;
    if (it.k === 'poly') return `<path class="${c}" d="M${it.pts.map((p) => P(p).join(' ')).join('L')}Z"/>`;
    const d = it.d.map(([op, ...v]) => op + v.map((val, i) => (i % 2 === 0 ? X(val) : Y(val))).join(' ')).join('');
    return `<path class="${c}" d="${d}"/>`;
  };
  const drawSeg = (sg, ghost) => {
    const c = `limb${sg.far && sc.view === 'side' ? ' far' : ''}${ghost ? ' ghost' : ''}`;
    return `<line class="${c}" x1="${X(sg.a[0])}" y1="${Y(sg.a[1])}" x2="${X(sg.b[0])}" y2="${Y(sg.b[1])}"/>`;
  };
  const drawHead = (h, ghost = false) => `<circle class="head${ghost ? ' ghost' : ''}" cx="${X(h[0])}" cy="${Y(h[1])}" r="${HEAD_R}"/>`;
  const drawJoint = (pt) => `<circle class="joint" cx="${X(pt[0])}" cy="${Y(pt[1])}" r="${JOINT_R}"/>`;
  const drawFloor = () => (sc.floor != null ? `<line class="floor" x1="4" y1="${Y(sc.floor)}" x2="116" y2="${Y(sc.floor)}"/>` : '');
  return { drawEq, drawSeg, drawHead, drawJoint, drawFloor };
}

const jointOf = (sc) => (Array.isArray(sc.joint) ? sc.joint : (sc.joint === 'neck' ? neckOf(sc.solid) : sc.solid[sc.joint]));

function render(id) {
  const sc = scene(id);
  const lay = layout(sc);
  const { solidSegs, ghostSegs, ghostHead, s, box, X, Y } = lay;
  const { drawEq, drawSeg, drawHead, drawJoint, drawFloor } = painter(sc, lay);
  const jointPt = jointOf(sc);

  let out = drawFloor();
  const back = sc.eq.filter((it) => it.z !== 'front');
  const fore = sc.eq.filter((it) => it.z === 'front');
  out += back.filter((it) => !it.ghost).map(drawEq).join('');
  out += ghostSegs.map((sg) => drawSeg(sg, true)).join('');
  if (ghostHead) out += drawHead(ghostHead, true);
  out += [...back, ...fore].filter((it) => it.ghost).map(drawEq).join('');
  out += solidSegs.map((sg) => drawSeg(sg, false)).join('');
  out += drawHead(sc.solid.h);
  out += fore.filter((it) => !it.ghost).map(drawEq).join('');
  for (const ar of sc.arrows) out += arrowSvg(ar, X, Y, s);
  if (jointPt) out += drawJoint(jointPt);
  return { svg: out, scene: sc, box: { x: X(box.minX), y: Y(box.minY), w: r1(s * (box.maxX - box.minX)), h: r1(s * (box.maxY - box.minY)) } };
}

/** A curved arrow (or a circular one, for turning movements) with a filled head, in output space. */
function arrowSvg(ar, X, Y, s) {
  const head = (tip, ux, uy) => {
    const h = 6.5;
    const w = 4.2;
    const bx = tip[0] - ux * h;
    const by = tip[1] - uy * h;
    return `<path class="arrow-head" d="M${r1(tip[0])} ${r1(tip[1])}L${r1(bx - uy * w)} ${r1(by + ux * w)}L${r1(bx + uy * w)} ${r1(by - ux * w)}Z"/>`;
  };
  if (ar.circle) {
    const cx = X(ar.c[0]);
    const cy = Y(ar.c[1]);
    const r = ar.r * s;
    const pt = (deg) => [cx + Math.cos((deg * Math.PI) / 180) * r, cy + Math.sin((deg * Math.PI) / 180) * r];
    const [x0, y0] = pt(ar.from);
    const [x1, y1] = pt(ar.to);
    const large = ar.to - ar.from > 180 ? 1 : 0;
    const tangent = ((ar.to + 90) * Math.PI) / 180;
    return `<path class="arrow" d="M${r1(x0)} ${r1(y0)}A${r1(r)} ${r1(r)} 0 ${large} 1 ${r1(x1)} ${r1(y1)}"/>${head([x1, y1], Math.cos(tangent), Math.sin(tangent))}`;
  }
  const a = [X(ar.from[0]), Y(ar.from[1])];
  const b = [X(ar.to[0]), Y(ar.to[1])];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const bulge = (ar.bulge ?? 0) * s;
  const c = [(a[0] + b[0]) / 2 + (-dy / len) * bulge, (a[1] + b[1]) / 2 + (dx / len) * bulge];
  const tx = b[0] - c[0];
  const ty = b[1] - c[1];
  const tl = Math.hypot(tx, ty) || 1;
  // stop the shaft short of the tip so the round cap does not poke through the head
  const end = [b[0] - (tx / tl) * 4, b[1] - (ty / tl) * 4];
  return `<path class="arrow" d="M${r1(a[0])} ${r1(a[1])}Q${r1(c[0])} ${r1(c[1])} ${r1(end[0])} ${r1(end[1])}"/>${head(b, tx / tl, ty / tl)}`;
}

const LABEL = {
  side: 'side view', front: 'front view',
};

/** For the self-check page and tests: the scene measurements of one drawing. */
export function diagramStats(id) {
  const { svg, box, scene: sc } = render(id);
  return {
    archetype: sc.name,
    limbs: (svg.match(/class="limb(?![^"]*ghost)/g) ?? []).length,
    equipment: (svg.match(/class="(eq|eq-line|eq-block|eq-fill|rail|floor)(?: ghost)?"/g) ?? []).length,
    fill: Math.max(box.w, box.h) / SIZE,
    area: (box.w * box.h) / (SIZE * SIZE),
  };
}

/** The full <svg> string for one exercise (or its id). Deterministic: same id, same string. */
export function diagramFor(exerciseOrId) {
  const id = typeof exerciseOrId === 'string' ? exerciseOrId : exerciseOrId?.id;
  const { svg, scene: sc } = render(id);
  const label = `Stick figure, ${LABEL[sc.view]}: ${sc.name.replace(/_/g, ' ')}, start position faint, finish position solid`;
  return `<svg class="diagram-svg" viewBox="0 0 ${SIZE} ${SIZE}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
}

/* ------------------------------------------------------------------ the rig, for the animator */

// The animator (animate.js) moves the figure joint by joint between the two poses. It needs the
// poses themselves, and a way to draw any in-between pose with exactly the static drawing's scale,
// classes and stacking order. Equipment is attached here, where the archetypes are known:
// a dumbbell rides the hand that holds it, a cable's free end follows the hand, a bench stays put.

/**
 * The two poses of one drawing: { view, solid, ghost, joint, floor, via }. `ghost` is the start of the
 * rep and `solid` the finish, both complete joint dicts on the same 120x120 design box. `ghost` is
 * null when the drawing has no second pose (a hold), so there is nothing to animate. `via`, when
 * given, is where some joints are halfway through the rep (a mountain climber's foot off the floor).
 */
export function diagramPose(id) {
  const sc = scene(id);
  let ghost = sc.ghost ? { ...sc.ghost } : null;
  if (ghost && !Object.keys({ ...sc.solid, ...ghost }).some((k) => sc.solid[k] && ghost[k] && dist(sc.solid[k], ghost[k]) > 0.01)) ghost = null;
  return { view: sc.view, solid: sc.solid, ghost, joint: sc.joint, floor: sc.floor ?? null, startAsDrawn: sc.startAsDrawn, via: sc.via };
}

/** The limb segments and head of `joints`, drawn exactly like the solid figure of `id`. */
export function diagramLimbs(id, joints) {
  const r = rigFor(id);
  return segments(joints, r.sc.view).map((sg) => r.paint.drawSeg(sg, false)).join('') + r.paint.drawHead(joints.h);
}

/** The arrows of `id` on their own, in output space, for fading while the figure moves. */
export function diagramArrows(id) {
  const r = rigFor(id);
  return r.sc.arrows.map((ar) => arrowSvg(ar, r.lay.X, r.lay.Y, r.lay.s)).join('');
}

/**
 * One frame of the movement: floor, equipment, limbs, head and the joint dot for `joints`, on the
 * static drawing's layout. `u` is how far from start (0) to finish (1) the rep is, for equipment
 * that moves on its own track. Ghost pieces and arrows are left out: the moving figure replaces them.
 */
export function diagramFrame(id, joints, u = 1) {
  const r = rigFor(id);
  const { drawEq, drawSeg, drawHead, drawJoint, drawFloor } = r.paint;
  const off = (key) => (key && joints[key] ? [joints[key][0] - r.sc.solid[key][0], joints[key][1] - r.sc.solid[key][1]] : [0, 0]);
  const moved = r.items.map(({ item, at }) => moveItem(item, at, off, u));
  const back = moved.filter((it) => it.z !== 'front');
  const fore = moved.filter((it) => it.z === 'front');
  let out = drawFloor();
  out += back.map(drawEq).join('');
  out += segments(joints, r.sc.view).map((sg) => drawSeg(sg, false)).join('');
  out += drawHead(joints.h);
  out += fore.map(drawEq).join('');
  const jp = r.jointAt(joints);
  if (jp) out += drawJoint(jp);
  return out;
}

const rigs = new Map();
function rigFor(id) {
  if (rigs.has(id)) return rigs.get(id);
  const sc = scene(id);
  const lay = layout(sc);
  const paint = painter(sc, lay);
  const pz = diagramPose(id);
  const solid = sc.solid;
  const ghost = pz.ghost ?? solid;
  const moving = Object.keys(solid).filter((k) => ghost[k] && dist(solid[k], ghost[k]) > MOVE_EPS);
  // distance to a joint; for the head, to the edge of the circle (a plate rests on it, a strap goes round it)
  const reach = (pt, k) => dist(pt, solid[k]) - (k === 'h' ? HEAD_R : 0);
  const nearest = (pt, keys, within) => {
    let best = null;
    let bd = within;
    for (const k of keys) { const d = reach(pt, k); if (d <= bd) { bd = d; best = k; } }
    return best;
  };

  const ghosts = sc.eq.filter((it) => it.ghost);
  const used = new Set();
  const items = [];
  for (const item of sc.eq) {
    if (item.ghost) continue;
    items.push({ item, at: attach(item) });
  }
  // a piece drawn with others (a bar and its plates) goes where the first of them attached goes
  for (const entry of items) {
    if (entry.at || entry.item.grp == null || entry.item.cls === 'rail') continue;
    const lead = items.find((o) => o.item.grp === entry.item.grp && o.at && (o.at.key || o.at.track));
    if (lead) entry.at = lead.at;
  }
  function attach(item) {
    if (!pz.ghost || item.cls === 'rail' || item.cls === 'floor') return null;
    if (item.band) {
      const ea = nearest(item.band.a, moving, 6);
      const eb = nearest(item.band.b, moving, 6);
      return ea || eb ? { band: [ea, eb] } : null;
    }
    const pts = itemPoints(item);
    const c = centroid(pts);
    // the same piece drawn faint at the start: it travels from there to here
    const sig = signature(item);
    const twin = ghosts.find((g) => !used.has(g) && signature(g) === sig);
    if (twin) {
      used.add(twin);
      const tc = centroid(itemPoints(twin));
      const D = [tc[0] - c[0], tc[1] - c[1]];
      if (Math.hypot(...D) > MOVE_EPS) {
        let best = null;
        let score = Math.max(6, 0.35 * Math.hypot(...D));
        for (const k of moving) {
          const dj = [ghost[k][0] - solid[k][0], ghost[k][1] - solid[k][1]];
          const sc2 = Math.hypot(dj[0] - D[0], dj[1] - D[1]) + 0.3 * dist(c, solid[k]);
          if (sc2 < score) { score = sc2; best = k; }
        }
        return best ? { key: best } : { track: D };
      }
    }
    // a small piece in or next to a moving hand (or foot) rides it
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    if (span <= 30 && item.cls !== 'eq-fill') {
      const k = nearest(c, moving, 12);
      if (k) return { key: k };
    }
    // a bar held in a moving hand rides it
    if (item.k === 'line' && item.cls === 'eq') {
      const hands = moving.filter((k) => ['w', 'W', 'hl', 'hr'].includes(k));
      const k = hands.find((h) => segDist(solid[h], item.a, item.b) <= 6);
      if (k) return { key: k };
    }
    // a cable or strap: the end at the hand follows it, the anchor stays
    if (item.k === 'line') {
      const ea = nearest(item.a, moving, 8);
      const eb = nearest(item.b, moving, 8);
      if (ea || eb) return { ends: [ea, eb] };
    }
    // a rope from hand to hand: each end goes with its hand, the loop between follows both
    if (item.k === 'path') {
      const ea = nearest(pts[0], moving, 6);
      const eb = nearest(pts[pts.length - 1], moving, 6);
      if (ea && eb) return { ends: [ea, eb] };
    }
    return null;
  }

  let jointAt = () => null;
  const jp = jointOf(sc);
  if (typeof sc.joint === 'string' && sc.joint !== 'neck') jointAt = (j) => j[sc.joint] ?? jp;
  else if (jp && (sc.joint === 'neck' || same(jp, neckOf(solid)))) jointAt = (j) => neckOf(j);
  else if (jp) {
    const k = nearest(jp, Object.keys(solid), Infinity);
    jointAt = (j) => [jp[0] + j[k][0] - solid[k][0], jp[1] + j[k][1] - solid[k][1]];
  }

  const rig = { sc, lay, paint, items, jointAt };
  rigs.set(id, rig);
  return rig;
}

function segDist(p, a, b) {
  const v = [b[0] - a[0], b[1] - a[1]];
  const L2 = v[0] * v[0] + v[1] * v[1] || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / L2));
  return dist(p, [a[0] + v[0] * t, a[1] + v[1] * t]);
}

function itemPoints(it) {
  if (it.k === 'line') return [it.a, it.b];
  if (it.k === 'circle') return [it.c];
  if (it.k === 'poly') return it.pts;
  const out = [];
  for (const cmd of it.d) for (let i = 1; i < cmd.length; i += 2) out.push([cmd[i], cmd[i + 1]]);
  return out;
}
const centroid = (pts) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
function signature(it) {
  const pts = itemPoints(it);
  const [x0, y0] = pts[0];
  return `${it.k}|${it.cls}|${it.r ?? ''}|${pts.map((p) => `${Math.round(p[0] - x0)},${Math.round(p[1] - y0)}`).join(' ')}`;
}

function moveItem(item, at, off, u) {
  if (!at) return item;
  const tr = (pt, o) => [pt[0] + o[0], pt[1] + o[1]];
  if (at.band) {
    const a = tr(item.band.a, off(at.band[0]));
    const b = tr(item.band.b, off(at.band[1]));
    return { ...item, d: bandPath(a, b, item.band.waves, item.band.amp) };
  }
  if (at.ends && item.k === 'path') {
    const oa = off(at.ends[0]);
    const ob = off(at.ends[1]);
    const n = item.d.reduce((sum, cmd) => sum + (cmd.length - 1) / 2, 0);
    let i = 0;
    return {
      ...item,
      d: item.d.map(([op, ...v]) => [op, ...v.map((val, j) => {
        const f = (i + Math.floor(j / 2)) / Math.max(1, n - 1);
        if (j === v.length - 1) i += v.length / 2;
        return val + (j % 2 === 0 ? oa[0] + (ob[0] - oa[0]) * f : oa[1] + (ob[1] - oa[1]) * f);
      })]),
    };
  }
  if (at.ends) return { ...item, a: tr(item.a, off(at.ends[0])), b: tr(item.b, off(at.ends[1])) };
  const o = at.key ? off(at.key) : [at.track[0] * (1 - u), at.track[1] * (1 - u)];
  if (item.k === 'line') return { ...item, a: tr(item.a, o), b: tr(item.b, o) };
  if (item.k === 'circle') return { ...item, c: tr(item.c, o) };
  if (item.k === 'poly') return { ...item, pts: item.pts.map((p) => tr(p, o)) };
  return { ...item, d: item.d.map(([op, ...v]) => [op, ...v.map((val, i) => val + o[i % 2])]) };
}

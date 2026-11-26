// Stick-figure diagrams for every movement, drawn on a 100x100 grid with plain SVG strings.
//
// Nothing is fetched and no art is hand-drawn per exercise: a small set of body rigs (standing,
// bent over, sitting, lying) place a head, torso and limbs from angles, and a small library of
// equipment draws the bar, dumbbell, bench, cable, band, machine, kettlebell and so on. Each
// movement is a pose plus an optional ghosted second pose and a curved arrow showing the end of
// the rep. Everything is deterministic: the same id always gives the same string.

const BOX = '0 0 100 100';

const rad = (deg) => (deg * Math.PI) / 180;
const n = (value) => Math.round(value * 10) / 10;
const pt = (x, y) => ({ x, y });
const limb = (a, b) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });

/** A point `len` away from `from`, in the direction `deg` (0 = right, 90 = down). */
function off(from, len, deg) {
  return { x: from.x + Math.cos(rad(deg)) * len, y: from.y + Math.sin(rad(deg)) * len };
}

/** Two-bone chain shoulder -> elbow -> hand (or hip -> knee -> ankle) from absolute angles. */
function chain(root, upper, upperDeg, lower, lowerDeg) {
  const mid = off(root, upper, upperDeg);
  const end = off(mid, lower, lowerDeg);
  return [limb(root, mid), limb(mid, end)];
}

/* ---------------------------------------------------------------- body rigs */

const TORSO = 22;
const UPPER_ARM = 10;
const LOWER_ARM = 10;
const UPPER_LEG = 12;
const LOWER_LEG = 12;

function four(sh, hip, armL, armR, legL, legR) {
  return [
    ...chain(sh, UPPER_ARM, armL[0], LOWER_ARM, armL[1]),
    ...chain(sh, UPPER_ARM, armR[0], LOWER_ARM, armR[1]),
    ...chain(hip, UPPER_LEG, legL[0], LOWER_LEG, legL[1]),
    ...chain(hip, UPPER_LEG, legR[0], LOWER_LEG, legR[1]),
  ];
}

/** Standing: torso up from the hips, head on top, arms and legs from absolute limb angles. */
function standing({ hip = pt(50, 62), shoulder = null, head = null, armL, armR, legL, legR }) {
  const sh = shoulder ?? pt(hip.x, hip.y - TORSO);
  const hd = head ?? pt(sh.x, sh.y - 7);
  return { head: hd, shoulder: sh, hip, limbs: four(sh, hip, armL, armR, legL, legR) };
}

/** Same body as standing, but with the torso leaning forward by `lean` degrees from vertical. */
function hinged({ hip = pt(50, 58), lean = 60, armL, armR, legL, legR }) {
  const sh = off(hip, TORSO, -90 + lean);
  const hd = off(sh, 7, -90 + lean);
  return { head: hd, shoulder: sh, hip, limbs: four(sh, hip, armL, armR, legL, legR) };
}

/** Lying on the back: everything laid out directly on the floor line. */
function lying({ head, shoulder, hip, kneeL, footL, kneeR, footR, armL, armR }) {
  return {
    head, shoulder, hip,
    limbs: [limb(shoulder, armL[0]), limb(armL[0], armL[1]), limb(shoulder, armR[0]), limb(armR[0], armR[1]),
      limb(hip, kneeL), limb(kneeL, footL), limb(hip, kneeR), limb(kneeR, footR)],
  };
}

/* ---------------------------------------------------------------- equipment */

function bar(x1, y1, x2, y2, sleeves = true) {
  let out = `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" />`;
  if (sleeves) out += `<circle class="eq" cx="${n(x1)}" cy="${n(y1)}" r="3.2" /><circle class="eq" cx="${n(x2)}" cy="${n(y2)}" r="3.2" />`;
  return out;
}

function dumbbell(x, y, deg = 0) {
  const a = off(pt(x, y), 4.5, deg + 90);
  const b = off(pt(x, y), 4.5, deg - 90);
  return `<line x1="${n(b.x)}" y1="${n(b.y)}" x2="${n(a.x)}" y2="${n(a.y)}" />
    <rect class="eq-block" x="${n(x - 2.6)}" y="${n(y - 2.6)}" width="5.2" height="5.2" transform="rotate(${deg} ${n(x)} ${n(y)})" />`;
}

function bench(x1, x2, y, legs = true) {
  let out = `<rect class="eq-fill" x="${n(x1)}" y="${n(y)}" width="${n(x2 - x1)}" height="5" rx="1.5" />`;
  if (legs) out += `<line x1="${n(x1 + 4)}" y1="${n(y + 5)}" x2="${n(x1 + 4)}" y2="${n(y + 15)}" /><line x1="${n(x2 - 4)}" y1="${n(y + 5)}" x2="${n(x2 - 4)}" y2="${n(y + 15)}" />`;
  return out;
}

const floor = (y = 90) => `<line class="floor" x1="6" y1="${y}" x2="94" y2="${y}" />`;
const ground = (y = 92) => `<line class="ground" x1="4" y1="${y}" x2="96" y2="${y}" />`;
const wall = (x = 26) => `<line class="floor" x1="${x}" y1="18" x2="${x}" y2="90" />`;
const box = (x, w, y, h) => `<rect class="eq-fill" x="${n(x)}" y="${n(y)}" width="${w}" height="${h}" rx="1" />`;
const pulley = (x, y) => `<circle class="eq" cx="${x}" cy="${y}" r="3.4" /><circle cx="${x}" cy="${y}" r="1" fill="#e8e2dc" fill-opacity="0.6" />`;
const cable = (a, b) => `<line class="eq-line" x1="${n(a.x)}" y1="${n(a.y)}" x2="${n(b.x)}" y2="${n(b.y)}" />`;

function band(from, to) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * 2.4;
  const cy = my + (dx / len) * 2.4;
  return `<path class="eq-line" d="M${n(from.x)} ${n(from.y)} Q${n(cx)} ${n(cy)} ${n(to.x)} ${n(to.y)}" />`;
}

const machine = (x1, x2, top = 18, bottom = 92) =>
  `<line class="rail" x1="${x1}" y1="${top}" x2="${x1}" y2="${bottom}" /><line class="rail" x1="${x2}" y1="${top}" x2="${x2}" y2="${bottom}" />`;

/* ---------------------------------------------------------------- the figure */

function bodySvg(pose, { ghost = false, accent = null } = {}) {
  const c = ghost ? 'ghost' : '';
  let out = `<line class="limb ${c}" x1="${n(pose.hip.x)}" y1="${n(pose.hip.y)}" x2="${n(pose.shoulder.x)}" y2="${n(pose.shoulder.y)}" />`;
  for (const l of pose.limbs) {
    out += `<line class="limb ${c}" x1="${n(l.x1)}" y1="${n(l.y1)}" x2="${n(l.x2)}" y2="${n(l.y2)}" />`;
  }
  out += `<circle class="head${ghost ? ' ghost' : ''}" cx="${n(pose.head.x)}" cy="${n(pose.head.y)}" r="5.2" />`;
  if (accent && !ghost) out += `<circle class="joint" cx="${n(accent.x)}" cy="${n(accent.y)}" r="2.4" />`;
  return out;
}

const elbowOf = (pose) => pt(pose.limbs[1].x2, pose.limbs[1].y2);
const kneeOf = (pose) => pt(pose.limbs[5].x2, pose.limbs[5].y2);

/* ---------------------------------------------------------------- arrows */

function arcArrow(from, to, bulge = 12) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bulge;
  const cy = my + (dx / len) * bulge;
  const tx = to.x - cx;
  const ty = to.y - cy;
  const tl = Math.hypot(tx, ty) || 1;
  const ux = tx / tl;
  const uy = ty / tl;
  const h = 4.2;
  const a = pt(to.x - ux * h - uy * h * 0.6, to.y - uy * h + ux * h * 0.6);
  const b = pt(to.x - ux * h + uy * h * 0.6, to.y - uy * h - ux * h * 0.6);
  return `<path class="arrow" d="M${n(from.x)} ${n(from.y)} Q${n(cx)} ${n(cy)} ${n(to.x)} ${n(to.y)}" />
    <path class="arrow-head" d="M${n(a.x)} ${n(a.y)} L${n(to.x)} ${n(to.y)} L${n(b.x)} ${n(b.y)}" />`;
}

/* ---------------------------------------------------------------- movements */

function deadHang() {
  const pose = standing({ hip: pt(50, 66), shoulder: pt(50, 44), armL: [-80, -85], armR: [-100, -95], legL: [95, 95], legR: [85, 85] });
  return { pose, equip: bar(20, 22, 80, 22) };
}

const MOVES = {
  // ---- squat family
  squat: () => {
    const top = standing({ armL: [-60, -10], armR: [-120, -170], legL: [90, 90], legR: [90, 90] });
    const bottom = standing({ hip: pt(44, 72), shoulder: pt(58, 52), armL: [-20, 10], armR: [-160, -190], legL: [60, 90], legR: [120, 90] });
    return { pose: bottom, ghost: top, arrow: arcArrow(pt(60, 70), pt(60, 58), 8), accent: kneeOf(bottom), equip: bar(36, 50, 64, 46) };
  },
  'goblet-squat': () => {
    const pose = standing({ hip: pt(48, 72), shoulder: pt(50, 50), armL: [30, -60], armR: [150, 240], legL: [62, 90], legR: [118, 90] });
    return { pose, accent: kneeOf(pose), arrow: arcArrow(pt(60, 64), pt(60, 52)), equip: kettlebellAt(50, 56) };
  },
  'sumo-squat': () => {
    const pose = standing({ hip: pt(50, 70), shoulder: pt(50, 50), armL: [40, 70], armR: [140, 110], legL: [50, 80], legR: [130, 100] });
    return { pose, accent: kneeOf(pose), equip: dumbbell(50, 62) };
  },
  'wall-sit': () => {
    const pose = standing({ hip: pt(40, 64), shoulder: pt(34, 42), armL: [10, 10], armR: [40, 70], legL: [90, 90], legR: [90, 90] });
    return { pose, equip: wall(30) };
  },
  'spanish-squat': () => {
    const pose = standing({ hip: pt(46, 68), shoulder: pt(54, 48), armL: [-10, 20], armR: [-170, -160], legL: [70, 90], legR: [110, 90] });
    return { pose, accent: kneeOf(pose), equip: band(pt(30, 64), pt(70, 64)) };
  },
  'leg-press': () => {
    const pose = seated({ seat: pt(34, 74), lean: -20, knee: pt(60, 66), armL: [120, 90], armR: [150, 110], foot: pt(74, 66) });
    return { pose, accent: kneeOf(pose), equip: machine(70, 82, 40, 92) + cable(pt(74, 48), pt(74, 66)) };
  },
  lunge: () => {
    const pose = standing({ hip: pt(48, 60), shoulder: pt(52, 38), armL: [80, 90], armR: [100, 90], legL: [120, 90], legR: [60, 60] });
    return { pose, accent: kneeOf(pose), arrow: arcArrow(pt(30, 70), pt(30, 50)) };
  },
  'step-up': () => {
    const pose = standing({ hip: pt(44, 52), shoulder: pt(46, 30), armL: [80, 90], armR: [100, 90], legL: [90, 90], legR: [30, 90] });
    return { pose, equip: box(58, 26, 66, 24) + dumbbell(30, 52) + dumbbell(62, 48), arrow: arcArrow(pt(44, 46), pt(44, 34)) };
  },
  'lateral-step-up': () => {
    const pose = standing({ hip: pt(42, 52), shoulder: pt(44, 30), armL: [70, 80], armR: [20, 10], legL: [90, 90], legR: [40, 100] });
    return { pose, equip: box(64, 24, 70, 20) + dumbbell(28, 52) };
  },
  'bulgarian-split-squat': () => {
    const pose = standing({ hip: pt(44, 58), shoulder: pt(46, 36), armL: [80, 90], armR: [100, 90], legL: [90, 90], legR: [40, 10] });
    return { pose, equip: bench(66, 88, 56) + dumbbell(30, 54) + dumbbell(62, 54) };
  },
  'side-lunge': () => {
    const pose = standing({ hip: pt(46, 62), shoulder: pt(46, 40), armL: [20, 0], armR: [160, 180], legL: [90, 90], legR: [0, 0] });
    return { pose, accent: kneeOf(pose), arrow: arcArrow(pt(76, 68), pt(62, 60)) };
  },
  'cossack-squat': () => {
    const pose = standing({ hip: pt(44, 66), shoulder: pt(44, 44), armL: [20, 0], armR: [160, 180], legL: [60, 90], legR: [0, -20] });
    return { pose, accent: kneeOf(pose) };
  },
  'sissy-squat': () => {
    const pose = standing({ hip: pt(44, 60), shoulder: pt(56, 42), armL: [-20, -40], armR: [-160, -140], legL: [110, 100], legR: [70, 80] });
    return { pose, accent: kneeOf(pose), arrow: arcArrow(pt(40, 58), pt(46, 66)) };
  },
  'step-down': () => {
    const pose = standing({ hip: pt(40, 50), shoulder: pt(40, 28), armL: [20, 0], armR: [160, 180], legL: [90, 90], legR: [60, 10] });
    return { pose, equip: box(24, 32, 84, 8), arrow: arcArrow(pt(52, 56), pt(52, 70)) };
  },
  'pogo-hop': () => {
    const pose = standing({ hip: pt(50, 60), shoulder: pt(50, 38), armL: [80, 90], armR: [100, 90], legL: [88, 88], legR: [92, 92] });
    return { pose, equip: ground(), arrow: arcArrow(pt(70, 56), pt(70, 38), -10) };
  },
  'depth-drop-land': () => {
    const pose = standing({ hip: pt(50, 60), shoulder: pt(50, 38), armL: [70, 40], armR: [110, 140], legL: [70, 80], legR: [110, 100] });
    return { pose, equip: box(24, 18, 64, 28), arrow: arcArrow(pt(34, 56), pt(48, 64)) };
  },

  // ---- hinge family
  deadlift: () => {
    const bottom = hinged({ hip: pt(46, 58), lean: 70, armL: [90, 90], armR: [90, 90], legL: [90, 90], legR: [90, 90] });
    const top = standing({ armL: [78, 88], armR: [102, 92], legL: [90, 90], legR: [90, 90] });
    return { pose: bottom, ghost: top, arrow: arcArrow(pt(24, 56), pt(24, 42)), accent: pt(46, 58), equip: bar(30, 80, 62, 80, false) };
  },
  'db-rdl': () => {
    const pose = hinged({ hip: pt(46, 58), lean: 65, armL: [90, 90], armR: [90, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(46, 58), equip: dumbbell(31, 79) + dumbbell(61, 79), arrow: arcArrow(pt(24, 52), pt(24, 42)) };
  },
  'good-morning': () => {
    const pose = hinged({ hip: pt(48, 58), lean: 75, armL: [40, -10], armR: [140, 250], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(48, 58), equip: bar(38, 40, 46, 32, false) };
  },
  'single-leg-hip-hinge': () => {
    const pose = hinged({ hip: pt(46, 58), lean: 75, armL: [-5, 5], armR: [185, 175], legL: [90, 90], legR: [0, 10] });
    return { pose, accent: pt(46, 58), equip: kettlebellAt(50, 54), arrow: arcArrow(pt(28, 50), pt(28, 38)) };
  },
  'hip-thrust': () => {
    const pose = lying({ head: pt(26, 58), shoulder: pt(32, 60), hip: pt(56, 66), kneeL: pt(66, 54), footL: pt(70, 78), kneeR: pt(66, 56), footR: pt(70, 78), armL: [pt(46, 70), pt(56, 74)], armR: [pt(46, 70), pt(56, 74)] });
    return { pose, accent: pt(56, 66), equip: bench(14, 38, 58) + `<line class="eq-line" x1="44" y1="64" x2="68" y2="64" />`, arrow: arcArrow(pt(56, 74), pt(56, 64), 8) };
  },
  'glute-bridge': () => {
    const pose = lying({ head: pt(24, 78), shoulder: pt(30, 78), hip: pt(52, 80), kneeL: pt(64, 64), footL: pt(68, 80), kneeR: pt(64, 64), footR: pt(68, 80), armL: [pt(40, 80), pt(50, 82)], armR: [pt(40, 80), pt(50, 82)] });
    return { pose, accent: pt(52, 80), arrow: arcArrow(pt(52, 74), pt(52, 60), 8) };
  },
  'nordic-curl': () => {
    const pose = hinged({ hip: pt(50, 62), lean: 40, armL: [70, 60], armR: [120, 130], legL: [70, 70], legR: [110, 110] });
    return { pose, accent: kneeOf(pose), arrow: arcArrow(pt(50, 50), pt(50, 66)) };
  },
  'glute-ham-raise': () => {
    const pose = hinged({ hip: pt(46, 52), lean: 60, armL: [60, 50], armR: [120, 130], legL: [70, 70], legR: [110, 110] });
    return { pose, accent: pt(46, 52), equip: bench(30, 62, 60) };
  },
  'back-extension': () => {
    const pose = hinged({ hip: pt(48, 56), lean: 80, armL: [30, 0], armR: [30, 0], legL: [60, 70], legR: [120, 110] });
    return { pose, accent: pt(48, 56), equip: bench(34, 58, 56), arrow: arcArrow(pt(30, 40), pt(34, 30)) };
  },

  // ---- push-up family
  'push-up': () => {
    const pose = { head: pt(76, 52), shoulder: pt(68, 56), hip: pt(44, 66), limbs: [limb(pt(68, 56), pt(64, 76)), limb(pt(64, 76), pt(62, 90)), limb(pt(68, 56), pt(66, 76)), limb(pt(66, 76), pt(64, 90)), limb(pt(44, 66), pt(30, 76)), limb(pt(30, 76), pt(16, 84)), limb(pt(44, 66), pt(30, 72)), limb(pt(30, 72), pt(16, 82))] };
    return { pose, accent: pt(64, 76), equip: floor(), arrow: arcArrow(pt(58, 60), pt(58, 48), -6) };
  },
  'incline-push-up': () => {
    const pose = { head: pt(74, 48), shoulder: pt(66, 52), hip: pt(44, 62), limbs: [limb(pt(66, 52), pt(62, 72)), limb(pt(62, 72), pt(60, 88)), limb(pt(66, 52), pt(64, 72)), limb(pt(64, 72), pt(62, 88)), limb(pt(44, 62), pt(28, 64)), limb(pt(28, 64), pt(12, 62)), limb(pt(44, 62), pt(28, 60)), limb(pt(28, 60), pt(12, 58))] };
    return { pose, accent: pt(62, 72), equip: box(8, 20, 58, 32) + floor(), arrow: arcArrow(pt(56, 56), pt(56, 44), -6) };
  },
  'diamond-push-up': () => {
    const pose = { head: pt(74, 52), shoulder: pt(66, 56), hip: pt(42, 66), limbs: [limb(pt(66, 56), pt(64, 78)), limb(pt(64, 78), pt(60, 90)), limb(pt(66, 56), pt(65, 78)), limb(pt(65, 78), pt(60, 90)), limb(pt(42, 66), pt(28, 76)), limb(pt(28, 76), pt(14, 84)), limb(pt(42, 66), pt(28, 72)), limb(pt(28, 72), pt(14, 82))] };
    return { pose, accent: pt(63, 78), equip: floor() };
  },
  'pike-push-up': () => {
    const pose = { head: pt(50, 62), shoulder: pt(52, 56), hip: pt(62, 34), limbs: [limb(pt(52, 56), pt(48, 74)), limb(pt(48, 74), pt(46, 90)), limb(pt(52, 56), pt(54, 74)), limb(pt(54, 74), pt(56, 90)), limb(pt(62, 34), pt(60, 62)), limb(pt(60, 62), pt(58, 90)), limb(pt(62, 34), pt(62, 60)), limb(pt(62, 60), pt(60, 90))] };
    return { pose, accent: pt(50, 74), equip: floor(), arrow: arcArrow(pt(44, 58), pt(44, 70)) };
  },
  'bench-press': () => {
    const pose = lying({ head: pt(24, 58), shoulder: pt(34, 60), hip: pt(60, 64), kneeL: pt(52, 78), footL: pt(46, 90), kneeR: pt(52, 78), footR: pt(46, 90), armL: [pt(38, 48), pt(40, 38)], armR: [pt(38, 48), pt(40, 38)] });
    return { pose, accent: pt(40, 48), equip: bench(20, 64, 62) + bar(34, 40, 48, 40), arrow: arcArrow(pt(34, 40), pt(38, 48), 6) };
  },
  'incline-press-dumbbell': () => {
    const pose = seated({ seat: pt(36, 64), lean: -25, knee: pt(48, 64), armL: [-30, -50], armR: [-150, -130], foot: pt(50, 90) });
    return { pose, accent: elbowOf(pose), equip: bench(24, 56, 62) + dumbbell(58, 34) + dumbbell(26, 34), arrow: arcArrow(pt(42, 32), pt(42, 44)) };
  },
  'dumbbell-press-home': () => {
    const pose = lying({ head: pt(26, 80), shoulder: pt(36, 80), hip: pt(60, 82), kneeL: pt(52, 68), footL: pt(60, 88), kneeR: pt(52, 68), footR: pt(60, 88), armL: [pt(40, 66), pt(42, 56)], armR: [pt(40, 66), pt(42, 56)] });
    return { pose, accent: pt(40, 66), equip: floor() + dumbbell(42, 54), arrow: arcArrow(pt(32, 52), pt(32, 44)) };
  },
  'chest-press-machine': () => {
    const pose = seated({ seat: pt(40, 66), lean: 0, knee: pt(52, 66), armL: [0, 0], armR: [-10, 5], foot: pt(54, 90) });
    return { pose, accent: elbowOf(pose), equip: machine(40, 58, 40, 92) + cable(pt(52, 66), pt(72, 58)) + `<circle class="eq" cx="72" cy="58" r="2.4" />`, arrow: arcArrow(pt(62, 52), pt(74, 52)) };
  },
  'cable-fly': () => {
    const pose = standing({ hip: pt(46, 64), shoulder: pt(46, 42), armL: [-20, -40], armR: [-160, -140], legL: [100, 90], legR: [80, 100] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 20) + cable(pt(84, 20), pt(30, 56)) + cable(pt(84, 20), pt(62, 56)), arrow: arcArrow(pt(64, 50), pt(50, 46), -8) };
  },
  'close-grip-press': () => {
    const pose = lying({ head: pt(24, 58), shoulder: pt(34, 60), hip: pt(60, 64), kneeL: pt(52, 78), footL: pt(46, 90), kneeR: pt(52, 78), footR: pt(46, 90), armL: [pt(38, 48), pt(40, 38)], armR: [pt(38, 48), pt(40, 38)] });
    return { pose, accent: pt(40, 48), equip: bench(20, 64, 62) + bar(38, 40, 44, 40), arrow: arcArrow(pt(34, 40), pt(38, 48), 5) };
  },

  // ---- press, vertical
  'shoulder-press': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [-80, -90], armR: [-100, -90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: bar(34, 32, 66, 32), arrow: arcArrow(pt(64, 40), pt(64, 24), 6) };
  },
  'overhead-extension': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [-60, -120], armR: [-120, -60], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: dumbbell(50, 28), arrow: arcArrow(pt(64, 34), pt(66, 46)) };
  },
  'lateral-raise': () => {
    const pose = standing({ armL: [10, 10], armR: [170, 170], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: dumbbell(30, 40) + dumbbell(70, 40), arrow: arcArrow(pt(36, 56), pt(30, 44), 8) };
  },
  'rear-delt-fly': () => {
    const pose = hinged({ hip: pt(48, 56), lean: 80, armL: [20, 0], armR: [160, 180], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: dumbbell(28, 46) + dumbbell(68, 46), arrow: arcArrow(pt(38, 50), pt(30, 42), 6) };
  },
  'upright-row-cable': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [70, 40], armR: [110, 140], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 86) + cable(pt(84, 86), pt(50, 62)) + bar(40, 60, 60, 60), arrow: arcArrow(pt(64, 54), pt(64, 42)) };
  },
  'band-face-pull': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [-60, -30], armR: [-120, -150], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: `<circle class="eq" cx="84" cy="42" r="3" />` + band(pt(84, 42), pt(28, 42)) + band(pt(84, 42), pt(72, 42)), arrow: arcArrow(pt(64, 50), pt(52, 44), -8) };
  },
  'face-pull-cable': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [-60, -30], armR: [-120, -150], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 42) + cable(pt(84, 42), pt(28, 42)) + cable(pt(84, 42), pt(72, 42)), arrow: arcArrow(pt(64, 50), pt(52, 44), -8) };
  },
  'face-pull-rotator': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [-50, -70], armR: [-130, -110], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 42) + cable(pt(84, 42), pt(28, 40)) + cable(pt(84, 42), pt(72, 40)), arrow: arcArrow(pt(30, 42), pt(30, 30)) };
  },
  'prone-y-raise': () => {
    const pose = lying({ head: pt(20, 84), shoulder: pt(32, 84), hip: pt(60, 86), kneeL: pt(76, 86), footL: pt(90, 86), kneeR: pt(76, 86), footR: pt(90, 86), armL: [pt(40, 72), pt(30, 66)], armR: [pt(40, 72), pt(30, 66)] });
    return { pose, accent: pt(40, 72), equip: floor(), arrow: arcArrow(pt(40, 70), pt(32, 60)) };
  },
  scarecrow: () => {
    const pose = standing({ armL: [0, -90], armR: [180, 270], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: dumbbell(30, 42) + dumbbell(70, 42), arrow: arcArrow(pt(30, 40), pt(30, 30), -8) };
  },

  // ---- pull, horizontal
  'barbell-row': () => {
    const pose = hinged({ hip: pt(48, 58), lean: 45, armL: [90, 90], armR: [90, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: bar(28, 74, 70, 74), arrow: arcArrow(pt(24, 70), pt(28, 58)) };
  },
  'db-row': () => {
    const pose = hinged({ hip: pt(44, 58), lean: 85, armL: [90, 90], armR: [90, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: bench(24, 48, 58) + dumbbell(50, 80), arrow: arcArrow(pt(46, 74), pt(46, 62)) };
  },
  'seated-row': () => {
    const pose = seated({ seat: pt(38, 70), lean: -5, knee: pt(56, 68), armL: [0, 0], armR: [0, 0], foot: pt(58, 88) });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 60) + cable(pt(84, 60), pt(66, 56)) + bar(64, 54, 64, 58), arrow: arcArrow(pt(70, 56), pt(58, 56), -6) };
  },
  'inverted-row': () => {
    const pose = { head: pt(24, 56), shoulder: pt(34, 58), hip: pt(58, 64), limbs: [limb(pt(34, 58), pt(38, 42)), limb(pt(38, 42), pt(40, 28)), limb(pt(34, 58), pt(38, 42)), limb(pt(38, 42), pt(40, 28)), limb(pt(58, 64), pt(74, 74)), limb(pt(74, 74), pt(90, 84)), limb(pt(58, 64), pt(74, 72)), limb(pt(74, 72), pt(90, 82))] };
    return { pose, accent: pt(38, 42), equip: `<line class="eq" x1="30" y1="26" x2="52" y2="26" />` + `<circle class="eq" cx="30" cy="26" r="2.4" /><circle class="eq" cx="52" cy="26" r="2.4" />`, arrow: arcArrow(pt(46, 46), pt(40, 32)) };
  },
  shrug: () => {
    const pose = standing({ armL: [85, 90], armR: [95, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(50, 42), equip: bar(32, 62, 68, 62), arrow: arcArrow(pt(66, 52), pt(66, 40)) };
  },

  // ---- pull, vertical
  'pull-up': () => {
    const pose = standing({ hip: pt(50, 66), shoulder: pt(50, 44), armL: [-75, -80], armR: [-105, -100], legL: [95, 95], legR: [85, 85] });
    return { pose, accent: elbowOf(pose), equip: bar(20, 22, 80, 22), arrow: arcArrow(pt(64, 42), pt(64, 26)) };
  },
  'chin-up': () => {
    const pose = standing({ hip: pt(50, 66), shoulder: pt(50, 44), armL: [-70, -80], armR: [-110, -100], legL: [95, 95], legR: [85, 85] });
    return { pose, accent: elbowOf(pose), equip: bar(20, 22, 80, 22), arrow: arcArrow(pt(36, 42), pt(36, 26)) };
  },
  'hanging-leg-raise': () => {
    const pose = standing({ hip: pt(50, 66), shoulder: pt(50, 44), armL: [-80, -85], armR: [-100, -95], legL: [20, 5], legR: [25, 10] });
    return { pose, accent: pt(50, 66), equip: bar(20, 22, 80, 22), arrow: arcArrow(pt(64, 68), pt(64, 54)) };
  },
  'hanging-knee-raise': () => {
    const pose = standing({ hip: pt(50, 66), shoulder: pt(50, 44), armL: [-80, -85], armR: [-100, -95], legL: [40, 80], legR: [45, 85] });
    return { pose, accent: pt(50, 66), equip: bar(20, 22, 80, 22), arrow: arcArrow(pt(68, 72), pt(68, 58)) };
  },
  'dead-hang-hold': deadHang,
  deadHang,
  'towel-hang': () => {
    const pose = standing({ hip: pt(50, 66), shoulder: pt(50, 44), armL: [-80, -85], armR: [-100, -95], legL: [95, 95], legR: [85, 85] });
    return { pose, equip: bar(20, 22, 80, 22) + `<path class="eq-line" d="M44 24 Q38 34 44 44 M56 24 Q62 34 56 44" />` };
  },
  'lat-pulldown': () => {
    const pose = seated({ seat: pt(44, 70), lean: -8, knee: pt(60, 66), armL: [-70, -80], armR: [-110, -100], foot: pt(62, 90) });
    return { pose, accent: elbowOf(pose), equip: machine(28, 70, 16, 92) + bar(30, 24, 66, 24), arrow: arcArrow(pt(64, 20), pt(62, 32)) };
  },
  'band-pulldown': () => {
    const pose = seated({ seat: pt(44, 70), lean: -8, knee: pt(60, 66), armL: [-70, -80], armR: [-110, -100], foot: pt(62, 90) });
    return { pose, accent: elbowOf(pose), equip: `<circle class="eq" cx="52" cy="14" r="3" />` + band(pt(52, 14), pt(34, 26)) + band(pt(52, 14), pt(70, 26)), arrow: arcArrow(pt(64, 20), pt(62, 32)) };
  },
  'straight-arm-pulldown': () => {
    const pose = standing({ hip: pt(46, 64), shoulder: pt(48, 42), armL: [15, 5], armR: [15, 5], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 24) + cable(pt(84, 24), pt(60, 62)) + bar(50, 60, 64, 60), arrow: arcArrow(pt(58, 52), pt(58, 66)) };
  },
  'db-pullover': () => {
    const pose = lying({ head: pt(24, 58), shoulder: pt(34, 60), hip: pt(60, 64), kneeL: pt(52, 78), footL: pt(46, 90), kneeR: pt(52, 78), footR: pt(46, 90), armL: [pt(28, 46), pt(18, 44)], armR: [pt(28, 46), pt(18, 44)] });
    return { pose, accent: pt(28, 46), equip: bench(20, 64, 62) + dumbbell(16, 44), arrow: arcArrow(pt(22, 36), pt(32, 42)) };
  },

  // ---- curl family
  'db-curl': () => {
    const pose = standing({ armL: [88, 20], armR: [92, 160], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: dumbbell(36, 48) + dumbbell(64, 48), arrow: arcArrow(pt(30, 60), pt(30, 48)) };
  },
  'hammer-curl': () => {
    const pose = standing({ armL: [88, 30], armR: [92, 150], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: dumbbell(34, 50, 90) + dumbbell(66, 50, 90), arrow: arcArrow(pt(30, 60), pt(30, 48)) };
  },
  'barbell-curl': () => {
    const pose = standing({ armL: [85, 40], armR: [95, 140], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: bar(30, 50, 70, 50), arrow: arcArrow(pt(64, 58), pt(66, 46)) };
  },
  'incline-curl': () => {
    const pose = seated({ seat: pt(36, 64), lean: -35, knee: pt(48, 64), armL: [80, 40], armR: [100, 140], foot: pt(50, 90) });
    return { pose, accent: elbowOf(pose), equip: bench(24, 56, 62) + dumbbell(30, 52) + dumbbell(58, 52), arrow: arcArrow(pt(30, 60), pt(32, 48)) };
  },
  'preacher-curl': () => {
    const pose = seated({ seat: pt(38, 70), lean: 10, knee: pt(56, 66), armL: [30, 20], armR: [40, 30], foot: pt(58, 88) });
    return { pose, accent: elbowOf(pose), equip: bench(48, 70, 56) + dumbbell(52, 44), arrow: arcArrow(pt(58, 50), pt(48, 44)) };
  },
  'band-curl': () => {
    const pose = standing({ armL: [85, 35], armR: [95, 145], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: band(pt(40, 90), pt(40, 50)) + band(pt(60, 90), pt(60, 50)), arrow: arcArrow(pt(30, 60), pt(30, 48)) };
  },
  'reverse-curl': () => {
    const pose = standing({ armL: [85, 45], armR: [95, 135], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: bar(30, 52, 70, 52), arrow: arcArrow(pt(64, 60), pt(66, 48)) };
  },

  // ---- extension family
  'skull-crusher': () => {
    const pose = lying({ head: pt(24, 58), shoulder: pt(34, 60), hip: pt(60, 64), kneeL: pt(52, 78), footL: pt(46, 90), kneeR: pt(52, 78), footR: pt(46, 90), armL: [pt(34, 44), pt(26, 40)], armR: [pt(34, 44), pt(26, 40)] });
    return { pose, accent: pt(34, 44), equip: bench(20, 64, 62) + bar(24, 38, 32, 38), arrow: arcArrow(pt(30, 46), pt(38, 42)) };
  },
  'rope-pushdown': () => {
    const pose = standing({ hip: pt(46, 64), shoulder: pt(48, 42), armL: [80, 85], armR: [80, 88], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 24) + cable(pt(84, 24), pt(60, 56)) + `<path class="eq-line" d="M63 58 l-3 6 M63 58 l3 6" />`, arrow: arcArrow(pt(66, 52), pt(66, 66)) };
  },
  'bench-dip': () => {
    const pose = seated({ seat: pt(46, 60), lean: 0, knee: pt(62, 58), armL: [100, 90], armR: [100, 90], foot: pt(72, 82) });
    return { pose, accent: elbowOf(pose), equip: bench(30, 52, 60), arrow: arcArrow(pt(52, 66), pt(54, 74)) };
  },

  // ---- hand grip
  'plate-pinch': () => {
    const pose = standing({ armL: [90, 90], armR: [90, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(70, 84), equip: `<circle class="eq" cx="70" cy="86" r="5" />` };
  },
  'hand-gripper': () => {
    const pose = standing({ armL: [80, 10], armR: [100, 170], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: `<path class="eq-line" d="M62 44 q6 8 0 16 M58 44 q-6 8 0 16" />` };
  },
  'fat-grip-hold': () => {
    const pose = standing({ armL: [88, 90], armR: [92, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(34, 82), equip: bar(30, 84, 70, 84) + `<rect class="eq-block" x="32" y="79" width="5" height="10" /><rect class="eq-block" x="63" y="79" width="5" height="10" />` };
  },
  'finger-curl-bar': () => {
    const pose = standing({ armL: [0, 0], armR: [-10, 5], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: `<line class="eq-line" x1="70" y1="44" x2="70" y2="60" /><circle class="eq" cx="70" cy="64" r="4" />` };
  },
  'wrist-roller-home': () => {
    const pose = standing({ armL: [0, 0], armR: [0, 0], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: `<rect class="eq-fill" x="46" y="40" width="16" height="6" rx="2" /><path class="eq-line" d="M62 46 q6 6 -6 12" />` };
  },
  'wrist-curl': () => {
    const pose = seated({ seat: pt(44, 66), lean: 10, knee: pt(60, 66), armL: [70, 30], armR: [70, 30], foot: pt(64, 90) });
    return { pose, accent: elbowOf(pose), equip: dumbbell(66, 60), arrow: arcArrow(pt(70, 66), pt(64, 58)) };
  },
  'wrist-extension': () => {
    const pose = seated({ seat: pt(44, 66), lean: 10, knee: pt(60, 66), armL: [70, 10], armR: [70, 10], foot: pt(64, 90) });
    return { pose, accent: elbowOf(pose), equip: dumbbell(66, 62, 90), arrow: arcArrow(pt(70, 60), pt(64, 56)) };
  },

  // ---- core: holds and crunches
  plank: () => {
    const pose = { head: pt(74, 60), shoulder: pt(66, 62), hip: pt(42, 66), limbs: [limb(pt(66, 62), pt(64, 76)), limb(pt(64, 76), pt(60, 90)), limb(pt(66, 62), pt(64, 76)), limb(pt(64, 76), pt(60, 90)), limb(pt(42, 66), pt(26, 80)), limb(pt(26, 80), pt(10, 88)), limb(pt(42, 66), pt(26, 80)), limb(pt(26, 80), pt(10, 88))] };
    return { pose, accent: pt(42, 66), equip: floor() };
  },
  'side-plank': () => {
    const pose = { head: pt(70, 44), shoulder: pt(64, 54), hip: pt(40, 66), limbs: [limb(pt(64, 54), pt(62, 74)), limb(pt(62, 74), pt(64, 90)), limb(pt(48, 60), pt(56, 50)), limb(pt(56, 50), pt(64, 42)), limb(pt(40, 66), pt(24, 78)), limb(pt(24, 78), pt(8, 88)), limb(pt(40, 66), pt(24, 78)), limb(pt(24, 78), pt(8, 88))] };
    return { pose, accent: pt(40, 66), equip: floor(), arrow: arcArrow(pt(46, 76), pt(44, 64)) };
  },
  'copenhagen-plank': () => {
    const pose = { head: pt(70, 50), shoulder: pt(62, 58), hip: pt(38, 66), limbs: [limb(pt(62, 58), pt(60, 76)), limb(pt(60, 76), pt(62, 90)), limb(pt(62, 58), pt(54, 52)), limb(pt(54, 52), pt(46, 50)), limb(pt(38, 66), pt(24, 66)), limb(pt(24, 66), pt(10, 66)), limb(pt(38, 66), pt(26, 72)), limb(pt(26, 72), pt(14, 76))] };
    return { pose, accent: pt(38, 66), equip: bench(6, 30, 62), arrow: arcArrow(pt(44, 76), pt(44, 64)) };
  },
  'cable-crunch': () => {
    const pose = { head: pt(44, 50), shoulder: pt(46, 58), hip: pt(46, 78), limbs: [limb(pt(46, 58), pt(50, 48)), limb(pt(50, 48), pt(48, 42)), limb(pt(46, 58), pt(50, 48)), limb(pt(50, 48), pt(48, 42)), limb(pt(46, 78), pt(58, 66)), limb(pt(58, 66), pt(58, 86)), limb(pt(46, 78), pt(58, 66)), limb(pt(58, 66), pt(58, 86))] };
    return { pose, accent: pt(46, 66), equip: pulley(84, 24) + cable(pt(84, 24), pt(48, 42)), arrow: arcArrow(pt(30, 54), pt(38, 64)) };
  },
  'cable-reverse-crunch': () => {
    const pose = lying({ head: pt(20, 78), shoulder: pt(30, 80), hip: pt(54, 82), kneeL: pt(64, 68), footL: pt(70, 60), kneeR: pt(64, 68), footR: pt(70, 60), armL: [pt(40, 82), pt(50, 84)], armR: [pt(40, 82), pt(50, 84)] });
    return { pose, accent: pt(54, 82), equip: pulley(84, 88) + cable(pt(84, 88), pt(52, 82)), arrow: arcArrow(pt(64, 62), pt(54, 72)) };
  },
  'sit-up': () => {
    const pose = seated({ seat: pt(48, 82), lean: 40, knee: pt(62, 72), armL: [40, 30], armR: [40, 30], foot: pt(64, 90) });
    return { pose, accent: pt(48, 82), equip: floor(), arrow: arcArrow(pt(40, 72), pt(46, 58)) };
  },
  'reverse-crunch': () => {
    const pose = lying({ head: pt(20, 82), shoulder: pt(30, 82), hip: pt(52, 82), kneeL: pt(62, 68), footL: pt(68, 66), kneeR: pt(62, 68), footR: pt(68, 66), armL: [pt(40, 84), pt(50, 86)], armR: [pt(40, 84), pt(50, 86)] });
    return { pose, accent: pt(52, 82), equip: floor(), arrow: arcArrow(pt(60, 62), pt(50, 72)) };
  },
  'lying-leg-raise': () => {
    const pose = lying({ head: pt(20, 82), shoulder: pt(30, 82), hip: pt(54, 84), kneeL: pt(64, 66), footL: pt(64, 46), kneeR: pt(64, 66), footR: pt(66, 46), armL: [pt(40, 84), pt(50, 86)], armR: [pt(40, 84), pt(50, 86)] });
    return { pose, accent: pt(54, 84), equip: floor(), arrow: arcArrow(pt(78, 54), pt(78, 74)) };
  },
  'hollow-hold': () => {
    const pose = lying({ head: pt(24, 66), shoulder: pt(34, 70), hip: pt(56, 82), kneeL: pt(70, 72), footL: pt(84, 64), kneeR: pt(70, 72), footR: pt(84, 64), armL: [pt(30, 60), pt(20, 56)], armR: [pt(30, 60), pt(20, 56)] });
    return { pose, accent: pt(56, 82), equip: floor() };
  },
  'v-up': () => {
    const pose = lying({ head: pt(30, 60), shoulder: pt(40, 66), hip: pt(56, 82), kneeL: pt(68, 64), footL: pt(74, 50), kneeR: pt(68, 64), footR: pt(74, 50), armL: [pt(52, 56), pt(66, 50)], armR: [pt(52, 56), pt(66, 50)] });
    return { pose, accent: pt(56, 82), equip: floor(), arrow: arcArrow(pt(44, 56), pt(56, 50)) };
  },
  'mountain-climber': () => {
    const pose = { head: pt(74, 56), shoulder: pt(66, 60), hip: pt(40, 62), limbs: [limb(pt(66, 60), pt(64, 76)), limb(pt(64, 76), pt(62, 90)), limb(pt(66, 60), pt(64, 76)), limb(pt(64, 76), pt(62, 90)), limb(pt(40, 62), pt(48, 74)), limb(pt(48, 74), pt(60, 76)), limb(pt(40, 62), pt(24, 74)), limb(pt(24, 74), pt(10, 86))] };
    return { pose, accent: pt(40, 62), equip: floor(), arrow: arcArrow(pt(52, 78), pt(40, 68)) };
  },
  'russian-twist': () => {
    const pose = seated({ seat: pt(48, 80), lean: -20, knee: pt(62, 66), armL: [20, 0], armR: [160, 180], foot: pt(66, 84) });
    return { pose, accent: pt(48, 80), equip: floor() + `<circle class="eq" cx="48" cy="56" r="3.5" />`, arrow: arcArrow(pt(54, 48), pt(66, 54)) };
  },
  'wood-chop': () => {
    const pose = standing({ hip: pt(48, 66), shoulder: pt(48, 44), armL: [40, 60], armR: [40, 60], legL: [95, 90], legR: [85, 90] });
    return { pose, accent: pt(48, 58), equip: pulley(84, 20) + cable(pt(84, 20), pt(66, 58)), arrow: arcArrow(pt(66, 40), pt(40, 64), 10) };
  },
  'pallof-press': () => {
    const pose = standing({ hip: pt(48, 64), shoulder: pt(48, 42), armL: [0, 0], armR: [0, 0], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(48, 42), equip: `<circle class="eq" cx="84" cy="46" r="3" />` + band(pt(84, 46), pt(58, 46)), arrow: arcArrow(pt(66, 54), pt(76, 46)) };
  },
  'farmer-carry': () => {
    const pose = standing({ armL: [88, 90], armR: [92, 90], legL: [80, 80], legR: [100, 100] });
    return { pose, accent: pt(50, 64), equip: dumbbell(34, 84) + dumbbell(66, 84), arrow: arcArrow(pt(70, 58), pt(84, 58)) };
  },
  'suitcase-carry': () => {
    const pose = standing({ armL: [88, 90], armR: [70, 40], legL: [88, 88], legR: [92, 92] });
    return { pose, accent: pt(50, 64), equip: dumbbell(34, 84), arrow: arcArrow(pt(70, 58), pt(84, 58)) };
  },
  superman: () => {
    const pose = lying({ head: pt(20, 80), shoulder: pt(30, 82), hip: pt(56, 86), kneeL: pt(72, 82), footL: pt(88, 78), kneeR: pt(72, 82), footR: pt(88, 78), armL: [pt(22, 74), pt(12, 66)], armR: [pt(22, 74), pt(12, 66)] });
    return { pose, accent: pt(56, 86), equip: floor(), arrow: arcArrow(pt(20, 72), pt(12, 62)) };
  },
  'bird-dog': () => {
    const pose = { head: pt(64, 50), shoulder: pt(60, 58), hip: pt(38, 64), limbs: [limb(pt(60, 58), pt(72, 50)), limb(pt(72, 50), pt(84, 44)), limb(pt(60, 58), pt(60, 76)), limb(pt(60, 76), pt(60, 90)), limb(pt(38, 64), pt(26, 78)), limb(pt(26, 78), pt(24, 90)), limb(pt(38, 64), pt(24, 54)), limb(pt(24, 54), pt(12, 44))] };
    return { pose, accent: pt(38, 64), equip: floor() };
  },
  'ab-wheel': () => {
    const pose = { head: pt(58, 56), shoulder: pt(54, 64), hip: pt(40, 80), limbs: [limb(pt(54, 64), pt(64, 74)), limb(pt(64, 74), pt(74, 84)), limb(pt(54, 64), pt(64, 74)), limb(pt(64, 74), pt(74, 84)), limb(pt(40, 80), pt(34, 88)), limb(pt(34, 88), pt(30, 90)), limb(pt(40, 80), pt(34, 88)), limb(pt(34, 88), pt(30, 90))] };
    return { pose, accent: pt(54, 64), equip: floor() + `<circle class="eq" cx="76" cy="86" r="3.5" />`, arrow: arcArrow(pt(66, 78), pt(80, 84)) };
  },
  'dead-bug': () => {
    const pose = lying({ head: pt(20, 80), shoulder: pt(30, 80), hip: pt(56, 86), kneeL: pt(50, 64), footL: pt(60, 60), kneeR: pt(50, 64), footR: pt(60, 60), armL: [pt(32, 66), pt(30, 52)], armR: [pt(32, 66), pt(30, 52)] });
    return { pose, accent: pt(56, 86), equip: floor(), arrow: arcArrow(pt(64, 58), pt(80, 66)) };
  },

  // ---- lying and side-lying leg work
  clamshell: () => {
    const pose = lying({ head: pt(22, 64), shoulder: pt(32, 70), hip: pt(56, 82), kneeL: pt(66, 70), footL: pt(76, 86), kneeR: pt(66, 64), footR: pt(76, 84), armL: [pt(30, 76), pt(20, 78)], armR: [pt(30, 76), pt(20, 78)] });
    return { pose, accent: pt(56, 82), equip: floor() + band(pt(66, 68), pt(66, 72)), arrow: arcArrow(pt(70, 62), pt(70, 72)) };
  },
  'side-lying-external-rotation': () => {
    const pose = lying({ head: pt(22, 64), shoulder: pt(32, 70), hip: pt(56, 82), kneeL: pt(68, 74), footL: pt(82, 82), kneeR: pt(68, 74), footR: pt(82, 82), armL: [pt(34, 62), pt(40, 52)], armR: [pt(34, 76), pt(46, 82)] });
    return { pose, accent: pt(34, 70), equip: floor() + dumbbell(40, 50), arrow: arcArrow(pt(44, 56), pt(38, 48)) };
  },
  'side-lying-raise': () => {
    const pose = lying({ head: pt(22, 64), shoulder: pt(32, 70), hip: pt(56, 82), kneeL: pt(74, 82), footL: pt(90, 82), kneeR: pt(74, 68), footR: pt(90, 64), armL: [pt(30, 76), pt(20, 78)], armR: [pt(30, 76), pt(20, 78)] });
    return { pose, accent: pt(56, 82), equip: floor(), arrow: arcArrow(pt(88, 74), pt(76, 68)) };
  },
  'single-leg-balance-pad': () => {
    const pose = standing({ hip: pt(50, 60), shoulder: pt(50, 38), armL: [20, -10], armR: [160, 190], legL: [90, 90], legR: [50, 30] });
    return { pose, accent: pt(48, 88), equip: `<ellipse class="eq-fill" cx="48" cy="88" rx="12" ry="3" />` };
  },
  'cable-kickback': () => {
    const pose = hinged({ hip: pt(46, 58), lean: 60, armL: [90, 90], armR: [90, 90], legL: [90, 90], legR: [0, 10] });
    return { pose, accent: pt(46, 58), equip: pulley(84, 84) + cable(pt(84, 84), pt(70, 60)), arrow: arcArrow(pt(66, 66), pt(82, 66)) };
  },
  'cable-hip-abduction': () => {
    const pose = standing({ hip: pt(44, 62), shoulder: pt(44, 40), armL: [10, 10], armR: [170, 170], legL: [90, 90], legR: [0, -10] });
    return { pose, accent: pt(44, 62), equip: pulley(84, 84) + cable(pt(84, 84), pt(70, 74)), arrow: arcArrow(pt(64, 76), pt(78, 72)) };
  },
  'cable-adduction': () => {
    const pose = standing({ hip: pt(54, 62), shoulder: pt(54, 40), armL: [10, 10], armR: [170, 170], legL: [90, 90], legR: [180, 200] });
    return { pose, accent: pt(54, 62), equip: pulley(84, 84) + cable(pt(84, 84), pt(70, 74)), arrow: arcArrow(pt(76, 78), pt(62, 82)) };
  },
  'band-adduction': () => {
    const pose = standing({ hip: pt(52, 62), shoulder: pt(52, 40), armL: [10, 10], armR: [170, 170], legL: [90, 90], legR: [160, 170] });
    return { pose, accent: pt(52, 62), equip: band(pt(30, 86), pt(70, 84)), arrow: arcArrow(pt(70, 88), pt(56, 88)) };
  },
  'lateral-band-walk': () => {
    const pose = standing({ hip: pt(48, 64), shoulder: pt(48, 44), armL: [40, 60], armR: [140, 120], legL: [70, 90], legR: [110, 70] });
    return { pose, accent: pt(48, 64), equip: band(pt(40, 72), pt(58, 72)), arrow: arcArrow(pt(64, 80), pt(76, 80)) };
  },
  'band-walk': () => {
    const pose = standing({ hip: pt(48, 70), shoulder: pt(48, 50), armL: [40, 60], armR: [140, 120], legL: [75, 90], legR: [105, 75] });
    return { pose, accent: pt(48, 70), equip: band(pt(40, 78), pt(58, 78)), arrow: arcArrow(pt(64, 86), pt(76, 86)) };
  },
  'single-leg-calf-raise': () => {
    const pose = standing({ hip: pt(50, 56), shoulder: pt(50, 34), armL: [10, 5], armR: [90, 90], legL: [80, 120], legR: [95, 95] });
    return { pose, accent: pt(52, 86), equip: box(38, 30, 88, 8), arrow: arcArrow(pt(76, 74), pt(76, 58)) };
  },

  // ---- shins and ankles
  'tibialis-raise': () => {
    const pose = standing({ hip: pt(46, 60), shoulder: pt(40, 38), armL: [80, 80], armR: [100, 100], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(50, 86), equip: wall(32), arrow: arcArrow(pt(66, 84), pt(78, 78)) };
  },
  'wall-toe-raise': () => {
    const pose = seated({ seat: pt(44, 66), lean: 5, knee: pt(60, 66), armL: [80, 90], armR: [100, 90], foot: pt(64, 90) });
    return { pose, accent: pt(64, 82), equip: box(56, 14, 88, 8) + `<rect class="eq-fill" x="60" y="80" width="8" height="4" />`, arrow: arcArrow(pt(80, 80), pt(80, 68)) };
  },
  'toe-walk': () => {
    const pose = standing({ hip: pt(48, 60), shoulder: pt(50, 38), armL: [70, 70], armR: [110, 110], legL: [80, 110], legR: [100, 70] });
    return { pose, accent: pt(44, 86), equip: ground(), arrow: arcArrow(pt(64, 50), pt(80, 50)) };
  },
  'heel-walk': () => {
    const pose = standing({ hip: pt(48, 60), shoulder: pt(50, 38), armL: [70, 70], armR: [110, 110], legL: [80, 110], legR: [100, 70] });
    return { pose, accent: pt(44, 86), equip: ground(), arrow: arcArrow(pt(64, 50), pt(80, 50)) };
  },
  'band-dorsiflexion': () => {
    const pose = seated({ seat: pt(40, 66), lean: 5, knee: pt(54, 66), armL: [80, 60], armR: [100, 120], foot: pt(62, 90) });
    return { pose, accent: pt(62, 84), equip: band(pt(62, 82), pt(40, 82)), arrow: arcArrow(pt(70, 86), pt(70, 74)) };
  },
  'tib-bar-raise': () => {
    const pose = standing({ hip: pt(50, 58), shoulder: pt(50, 36), armL: [80, 80], armR: [100, 100], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: pt(48, 86), equip: ground() + bar(36, 88, 64, 88), arrow: arcArrow(pt(74, 84), pt(86, 80)) };
  },
  'single-leg-balance-toe': () => {
    const pose = standing({ hip: pt(50, 56), shoulder: pt(50, 34), armL: [20, -10], armR: [160, 190], legL: [95, 95], legR: [80, 70] });
    return { pose, accent: pt(50, 88), equip: box(38, 30, 88, 8), arrow: arcArrow(pt(78, 84), pt(78, 72)) };
  },
  'sled-drag-heel': () => {
    const pose = hinged({ hip: pt(48, 60), lean: 20, armL: [60, 50], armR: [120, 130], legL: [80, 105], legR: [100, 70] });
    return { pose, accent: pt(46, 84), equip: ground() + box(70, 16, 80, 10) + `<line class="eq-line" x1="70" y1="84" x2="52" y2="80" />`, arrow: arcArrow(pt(64, 46), pt(80, 46)) };
  },
  'ankle-hop-in': () => {
    const pose = standing({ hip: pt(50, 58), shoulder: pt(50, 36), armL: [60, 40], armR: [120, 140], legL: [95, 110], legR: [95, 110] });
    return { pose, accent: pt(50, 86), equip: ground(), arrow: arcArrow(pt(30, 76), pt(30, 60)) };
  },
  'ankle-circle-load': () => {
    const pose = seated({ seat: pt(40, 66), lean: 10, knee: pt(54, 66), armL: [70, 20], armR: [70, 20], foot: pt(60, 90) });
    return { pose, accent: pt(60, 82), equip: band(pt(60, 80), pt(40, 54)), arrow: arcArrow(pt(66, 80), pt(66, 92), 6) };
  },
  'calf-stretch-strength': () => {
    const pose = standing({ hip: pt(50, 58), shoulder: pt(50, 36), armL: [90, 90], armR: [90, 90], legL: [95, 115], legR: [85, 100] });
    return { pose, accent: pt(50, 86), equip: ground(), arrow: arcArrow(pt(72, 76), pt(72, 62)) };
  },

  // ---- knee work
  'terminal-knee-extension': () => {
    const pose = standing({ hip: pt(50, 58), shoulder: pt(50, 36), armL: [80, 80], armR: [100, 100], legL: [75, 90], legR: [105, 90] });
    return { pose, accent: pt(50, 74), equip: band(pt(44, 72), pt(56, 74)), arrow: arcArrow(pt(66, 74), pt(66, 86)) };
  },
  'copenhagen-knee': () => {
    const pose = standing({ hip: pt(50, 56), shoulder: pt(50, 34), armL: [20, 0], armR: [160, 180], legL: [90, 90], legR: [30, 70] });
    return { pose, accent: pt(50, 72), equip: box(34, 32, 88, 8), arrow: arcArrow(pt(70, 76), pt(58, 82)) };
  },
  'leg-extension': () => {
    const pose = seated({ seat: pt(40, 66), lean: -10, knee: pt(58, 64), armL: [80, 90], armR: [80, 90], foot: pt(76, 64) });
    return { pose, accent: pt(58, 64), equip: machine(30, 70, 50, 92) + cable(pt(70, 50), pt(76, 64)), arrow: arcArrow(pt(70, 56), pt(84, 60)) };
  },
  'leg-extension-partial': () => {
    const pose = seated({ seat: pt(40, 66), lean: -10, knee: pt(58, 64), armL: [80, 90], armR: [80, 90], foot: pt(72, 56) });
    return { pose, accent: pt(58, 64), equip: machine(30, 70, 50, 92), arrow: arcArrow(pt(70, 52), pt(80, 58)) };
  },
  'leg-curl': () => {
    const pose = { head: pt(24, 52), shoulder: pt(32, 56), hip: pt(58, 66), limbs: [limb(pt(32, 56), pt(40, 60)), limb(pt(40, 60), pt(50, 63)), limb(pt(32, 56), pt(40, 60)), limb(pt(40, 60), pt(50, 63)), limb(pt(58, 66), pt(76, 66)), limb(pt(76, 66), pt(74, 50)), limb(pt(58, 66), pt(76, 66)), limb(pt(76, 66), pt(74, 50))] };
    return { pose, accent: pt(76, 66), equip: bench(16, 58, 62) + machine(80, 90, 30, 92), arrow: arcArrow(pt(70, 52), pt(70, 42)) };
  },

  // ---- rotator cuff
  'band-external-rotation': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [60, 90], armR: [60, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: band(pt(84, 54), pt(58, 52)), arrow: arcArrow(pt(60, 48), pt(74, 46)) };
  },
  'band-internal-rotation': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [120, 90], armR: [120, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: band(pt(84, 52), pt(58, 52)), arrow: arcArrow(pt(76, 50), pt(62, 50)) };
  },
  'cable-external-rotation': () => {
    const pose = standing({ hip: pt(50, 64), shoulder: pt(50, 42), armL: [60, 90], armR: [60, 90], legL: [90, 90], legR: [90, 90] });
    return { pose, accent: elbowOf(pose), equip: pulley(84, 52) + cable(pt(84, 52), pt(60, 52)), arrow: arcArrow(pt(62, 48), pt(76, 46)) };
  },

  // ---- calves and machine isolation
  'standing-calf-raise': () => {
    const pose = standing({ hip: pt(50, 58), shoulder: pt(50, 36), armL: [80, 80], armR: [100, 100], legL: [93, 115], legR: [87, 100] });
    return { pose, accent: pt(50, 86), equip: machine(28, 72, 28, 92) + `<rect class="eq-fill" x="38" y="30" width="24" height="5" rx="2" />`, arrow: arcArrow(pt(72, 78), pt(72, 62)) };
  },
  'seated-calf-raise': () => {
    const pose = seated({ seat: pt(40, 58), lean: -10, knee: pt(58, 58), armL: [80, 90], armR: [80, 90], foot: pt(62, 84) });
    return { pose, accent: pt(62, 80), equip: box(36, 22, 52, 6) + box(56, 18, 84, 8) + `<rect class="eq-fill" x="50" y="50" width="10" height="6" />`, arrow: arcArrow(pt(70, 82), pt(70, 68)) };
  },
  'abductor-machine': () => {
    const pose = seated({ seat: pt(42, 64), lean: -15, knee: pt(58, 62), armL: [80, 90], armR: [80, 90], foot: pt(66, 86) });
    return { pose, accent: pt(58, 62), equip: machine(30, 74, 46, 92) + `<rect class="eq-fill" x="42" y="60" width="28" height="5" rx="2" />`, arrow: arcArrow(pt(66, 60), pt(76, 60)) };
  },
  'adductor-machine': () => {
    const pose = seated({ seat: pt(42, 64), lean: -15, knee: pt(58, 62), armL: [80, 90], armR: [80, 90], foot: pt(62, 86) });
    return { pose, accent: pt(58, 62), equip: machine(30, 74, 46, 92) + `<rect class="eq-fill" x="48" y="60" width="14" height="5" rx="2" />`, arrow: arcArrow(pt(74, 60), pt(60, 60)) };
  },
  'jump-rope': () => {
    const pose = standing({ hip: pt(50, 58), shoulder: pt(50, 36), armL: [-20, 20], armR: [-160, -200], legL: [88, 92], legR: [92, 88] });
    return { pose, accent: pt(50, 86), equip: `<path class="eq-line" d="M26 50 Q50 96 74 50" />`, arrow: arcArrow(pt(70, 56), pt(70, 40), -8) };
  },
  'sled-ankle-push': () => {
    const pose = hinged({ hip: pt(48, 60), lean: 25, armL: [60, 50], armR: [120, 130], legL: [110, 95], legR: [70, 105] });
    return { pose, accent: pt(40, 86), equip: ground() + box(72, 16, 80, 10) + `<line class="eq-line" x1="72" y1="84" x2="54" y2="80" />`, arrow: arcArrow(pt(64, 46), pt(80, 46)) };
  },

  // ---- neck
  'neck-flexion': () => {
    const pose = seated({ seat: pt(44, 66), lean: 0, knee: pt(60, 66), armL: [40, -10], armR: [20, -20], foot: pt(64, 90) });
    return { pose, accent: pt(44, 38), equip: '', arrow: arcArrow(pt(56, 30), pt(50, 40)) };
  },
  'neck-extension': () => {
    const pose = seated({ seat: pt(44, 66), lean: 0, knee: pt(60, 66), armL: [70, 70], armR: [110, 110], foot: pt(64, 90) });
    return { pose, accent: pt(44, 38), equip: band(pt(30, 30), pt(44, 34)), arrow: arcArrow(pt(52, 32), pt(58, 40)) };
  },
  'neck-side': () => {
    const pose = seated({ seat: pt(44, 66), lean: 0, knee: pt(60, 66), armL: [70, 70], armR: [110, 110], foot: pt(64, 90) });
    return { pose, accent: pt(44, 38), equip: dumbbell(28, 34), arrow: arcArrow(pt(38, 28), pt(48, 30)) };
  },
  'neck-harness': () => {
    const pose = seated({ seat: pt(44, 66), lean: 10, knee: pt(60, 66), armL: [70, 80], armR: [110, 100], foot: pt(64, 90) });
    return { pose, accent: pt(44, 38), equip: `<path class="eq-line" d="M36 32 q8 -6 16 0" /><circle class="eq" cx="44" cy="26" r="3" />`, arrow: arcArrow(pt(58, 30), pt(52, 42)) };
  },
  'neck-plate-extension': () => {
    const pose = hinged({ hip: pt(46, 56), lean: 90, armL: [70, 60], armR: [110, 120], legL: [70, 70], legR: [110, 110] });
    return { pose, accent: pt(26, 34), equip: bench(40, 70, 58), arrow: arcArrow(pt(20, 30), pt(24, 40)) };
  },
};

// Sitting needs a schematic: torso up from the seat, thighs forward, shins straight down.
function seated({ seat, lean = 0, knee, armL, armR, foot }) {
  const sh = off(seat, TORSO, -90 + lean);
  const hd = off(sh, 7, -90 + lean);
  const ft = foot ?? pt(knee.x, Math.min(90, knee.y + 14));
  const legs = [...chain(seat, UPPER_LEG, 0, LOWER_LEG, 90)].map((l, i) => (i === 0 ? limb(seat, knee) : limb(knee, ft)));
  return {
    head: hd, shoulder: sh, hip: seat,
    limbs: [...chain(sh, UPPER_ARM, armL[0], LOWER_ARM, armL[1]), ...chain(sh, UPPER_ARM, armR[0], LOWER_ARM, armR[1]), ...legs, ...legs.map((l) => ({ ...l }))],
  };
}

function kettlebellAt(x, y) {
  return `<path class="eq-line" d="M${n(x - 2.6)} ${n(y - 3)} Q${n(x)} ${n(y - 8)} ${n(x + 2.6)} ${n(y - 3)}" /><circle class="eq" cx="${n(x)}" cy="${n(y)}" r="4.2" />`;
}

function fallback() {
  return { pose: standing({ armL: [88, 88], armR: [92, 92], legL: [90, 90], legR: [90, 90] }), equip: '' };
}

/* ---------------------------------------------------------------- export */

// Fit every drawing inside a comfortable margin so nothing touches the edge of a 96px thumbnail and
// thin poses get blown up instead of shrinking to a sliver. The numbers are read back from the
// geometry, not typed in, so a pose never spills out of the frame.
function extent(drawing) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const grow = (x, y) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); };
  for (const m of drawing.matchAll(/x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)) { grow(+m[1], +m[2]); grow(+m[3], +m[4]); }
  for (const m of drawing.matchAll(/cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)) { grow(+m[1] - +m[3], +m[2] - +m[3]); grow(+m[1] + +m[3], +m[2] + +m[3]); }
  for (const m of drawing.matchAll(/<rect[^>]*x="([-\d.]+)"[^>]*y="([-\d.]+)"[^>]*width="([-\d.]+)"[^>]*height="([-\d.]+)"/g)) { grow(+m[1], +m[2]); grow(+m[1] + +m[3], +m[2] + +m[4]); }
  return { minX, minY, maxX, maxY };
}

function fit(drawing) {
  const { minX, minY, maxX, maxY } = extent(drawing);
  if (!Number.isFinite(minX)) return '';
  const span = Math.max(maxX - minX, maxY - minY) || 1;
  const scale = 84 / span;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const mid = 50;
  const tx = mid - cx * scale;
  const ty = mid - cy * scale;
  return `<g transform="translate(${n(tx)} ${n(ty)}) scale(${n(scale)})">${drawing}</g>`;
}

/** The full <svg> string for one exercise (or its id). Deterministic: same id, same string. */
export function diagramFor(exerciseOrId) {
  const id = typeof exerciseOrId === 'string' ? exerciseOrId : exerciseOrId?.id;
  const builder = MOVES[id] ?? fallback;
  const { pose, ghost, arrow, accent, equip } = builder();
  let drawing = equip ?? '';
  drawing += bodySvg(pose, { accent });
  if (ghost) drawing += bodySvg(ghost, { ghost: true });
  if (arrow) drawing += arrow;
  return `<svg class="diagram-svg" viewBox="${BOX}" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${fit(drawing)}</svg>`;
}

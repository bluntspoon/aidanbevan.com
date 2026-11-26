// The body map: two drawn SVG figures whose body parts are buttons.
//
// Art direction (see the design review): one material, one gradient for the whole figure, shading
// from a dozen soft form shadows and a single rim light down the left edge. The anatomy is carried
// by grooves that sit exactly where one tappable group meets the next. Each group carries a
// faint ember edge at rest, so the map reads as tappable; the selected group is the only solid
// warm thing on screen.
//
// Geometry is drawn for the left half of the picture (x < 100) and mirrored, so both sides of the
// body always match. Every path uses absolute M/L/C/Z commands only, which keeps mirroring a
// simple "x -> 200 - x" on each coordinate pair.

const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g,
  (_, x, y) => `${+(200 - Number(x)).toFixed(2)} ${y}`);

const both = (d) => `${d} ${mirror(d)}`; // one path, two sides (fine for shapes that do not overlap)

const H = (id, label, d) =>
  `<path class="hotspot" data-muscle="${id}" role="button" tabindex="0" aria-label="${label}" d="${d}"><title>${label}</title></path>`;

/** A pair of hotspots, one per side of the body. */
const pair = (id, label, d) => H(id, label, d) + H(id, label, mirror(d));

/* -------------------------------------------------------------- silhouette */

// The left contour, piece by piece, so the rim light can reuse the lit pieces.
const SIL_HEAD = 'M100.5 12 L100 12 C 93 12, 87.6 16.6, 87 24.6 C 86.6 30.6, 87.4 36.2, 89.6 40.6';
const SIL_SHOULDER = 'C 89.7 44, 89.2 48, 88.2 51 C 85 56, 77 60, 68 63 C 60 65.2, 55 69.4, 53 76 C 51.2 82, 50.6 90, 50 98';
const SIL_ARM_OUT = 'C 49.2 108, 49 120, 50 128 C 50.6 133, 50 138, 48.8 143 C 47 152, 46.4 165, 46.2 178 C 46 186, 46 191, 46.3 195';
// Relaxed hand, tilted a few degrees in: one tapered finger mass, and on the side toward the body
// a thumb that is its own lobe, split from the fingers by a clear notch at the web.
const SIL_HAND = 'C 45 200, 44.2 206, 44.6 212 C 45 217.6, 47 221.4, 50 221.4 C 52.6 221.4, 54.2 218.6, 54.4 214.6 '
  + 'C 54.5 212.8, 54.5 211.2, 54.7 209.8 C 55.8 211.6, 57.4 213.6, 58.5 213.2 C 59.5 212.6, 59.2 209.6, 58.3 206.8 '
  + 'C 57.4 203.6, 55.8 199.6, 53.6 196.4';
const SIL_ARM_IN = 'C 55 188, 57.5 176, 59.6 160 C 60.6 152, 61 146, 60.4 140 C 60 136, 62.5 128, 64 118 C 65 110, 66 100, 67.5 91.5';
const SIL_TORSO = 'C 66.6 97, 66.2 104, 67 112 C 68.5 124, 72 134, 72.8 142 C 73 150, 71.5 156, 70.5 162 C 69 172, 66.5 182, 66 192';
const SIL_LEG_OUT = 'C 65.8 210, 67 238, 71.5 262 C 73 270, 74 276, 73.4 282 C 72.5 290, 70.6 300, 71.2 312 C 72 326, 77 340, 79.6 350';
// Front: an ankle bone on each side, the top of the foot, toes as one rounded edge, and the heel
// showing behind the inner side of the foot.
const SIL_FOOT_FRONT = 'C 78.4 351.4, 77.6 354, 78.4 356 C 79 357.4, 79.8 357.8, 79.4 359.4 '
  + 'C 77.8 363, 77.4 368.4, 80.2 370.2 C 83 371.8, 89 371.8, 92.4 370.4 C 95 370, 96 367.4, 95 365 '
  + 'C 94.2 363.2, 92.4 362.4, 92 360.6 C 93.6 358.8, 94 354.6, 92.4 351.8 C 91.4 350.2, 90.6 348.6, 90.4 347';
// Back: the Achilles narrows, both ankle bones bump out, and the heel is a round bulb below.
const SIL_FOOT_BACK = 'C 80.6 352.4, 81.2 354, 80.2 356.4 C 79.4 358, 79.4 359.6, 80.6 361 '
  + 'C 79.8 364, 80.2 368.6, 83 370.6 C 85.4 372.2, 89.4 372, 91.2 369.6 C 92.6 367.6, 92.4 363.6, 91.4 361 '
  + 'C 92.4 359.4, 92.4 357.4, 91.4 355.6 C 90.8 353.4, 90.6 350, 90.4 347';
const SIL_LEG_IN = 'C 92 335, 93.5 315, 93 300 C 92.6 290, 91 284, 91.2 278 C 91.5 270, 94 255, 95 240';
const SIL_CROTCH_FRONT = 'C 96 225, 97.5 208, 98.8 199 C 99.3 197, 99.8 196.5, 100.5 196.5 Z';
// Seen from behind the glutes hang over the top of the thighs, so the legs part lower down.
const SIL_CROTCH_BACK = 'C 96.2 232, 97.6 225, 99.2 222.6 C 99.6 222.2, 100 222, 100.5 222 Z';

const half = (foot, crotch) =>
  [SIL_HEAD, SIL_SHOULDER, SIL_ARM_OUT, SIL_HAND, SIL_ARM_IN, SIL_TORSO, SIL_LEG_OUT, foot, SIL_LEG_IN, crotch].join(' ');

// Two overlapping halves, each its own path: mirroring flips the winding, so one path holding both
// would cancel out along the centre line. The shared userSpace gradient hides the overlap.
const halves = (d) => [d, mirror(d)];
const SIL_FRONT = halves(half(SIL_FOOT_FRONT, SIL_CROTCH_FRONT));
const SIL_BACK = halves(half(SIL_FOOT_BACK, SIL_CROTCH_BACK));

// The rim light only touches surfaces that face the light: head, shoulder, outer arm, hand, and the
// outer hip and leg. Never mirrored.
const RIM = [
  `${SIL_HEAD} ${SIL_SHOULDER} ${SIL_ARM_OUT} C 44.8 200, 44 207, 44.7 213`,
  `M70.5 162 C 69 172, 66.5 182, 66 192 ${SIL_LEG_OUT}`,
].join(' ');

// Small carved lines that are not group edges: the knuckles across the back of the fingers, and
// the crease where the foot meets the ankle (front) or the heel meets the Achilles (back).
const KNUCKLES = both('M45.2 211.4 C 47.8 212.8, 51.6 212.8, 54.4 211.6');
const DETAILS_FRONT = `${KNUCKLES} ${both('M79.8 359.4 C 83.4 360.8, 88 360.8, 91.6 359.6')}`;
const DETAILS_BACK = `${KNUCKLES} ${both('M80.8 361.4 C 83.8 360.2, 88 360.2, 91.2 361.2')}`;

/* ------------------------------------------------------------------ shared */

// The ids are fixed (ga-*) because only one figure is ever in the document: the map on home, or
// the miniature on a body-part page.
const defs = (silhouette) => `
  <defs>
    <linearGradient id="ga-skin" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="170" y2="380">
      <stop offset="0" stop-color="#6b584c"/>
      <stop offset="0.5" stop-color="#514237"/>
      <stop offset="1" stop-color="#3c312a"/>
    </linearGradient>
    <!-- solid ember with a white highlight (0.35 -> 0) baked in, top-left of each shape -->
    <radialGradient id="ga-lit" cx="0.35" cy="0.25" r="0.75">
      <stop offset="0" stop-color="#ff946d"/>
      <stop offset="1" stop-color="#ff5a1f"/>
    </radialGradient>
    <radialGradient id="ga-floor" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#000" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <!-- the neutral pool of light the figure stands in, so the floor shadow has something to fall on -->
    <radialGradient id="ga-pool" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fff" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="ga-clip">${silhouette.map((d) => `<path d="${d}"/>`).join('')}</clipPath>
    <!-- grooves fade out near the silhouette, so the edge never reads as an outline -->
    <filter id="ga-erode" x="0" y="0" width="1" height="1"><feMorphology operator="erode" radius="2.4"/></filter>
    <mask id="ga-inner" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="380">
      <g filter="url(#ga-erode)">${silhouette.map((d) => `<path d="${d}" fill="#fff"/>`).join('')}</g>
    </mask>
    <!-- one highlight per muscle belly: objectBoundingBox, so it lights the top-left of any shape -->
    <linearGradient id="ga-belly" x1="0.15" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#ffe6d2" stop-opacity="0.16"/>
      <stop offset="0.42" stop-color="#ffd0b0" stop-opacity="0.05"/>
      <stop offset="0.72" stop-color="#000" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.26"/>
    </linearGradient>
    <filter id="ga-soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="0.9"/>
    </filter>
    <filter id="ga-form" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2.5"/>
    </filter>
    <!-- one tight ember bloom, under the selected shape -->
    <filter id="ga-bloom" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="b"/>
      <feFlood flood-color="#ff5a1f" flood-opacity="0.5"/>
      <feComposite in2="b" operator="in" result="bloom"/>
      <feMerge><feMergeNode in="bloom"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

const shade = (opacity, d) => `<path d="${d}" fill="#000" fill-opacity="${opacity}"/>`;

// The box hugs the body (hands at x 44/156, head at 12, heels at 372) so the figure fills its
// space; both views share it, so switching never changes the scale.
export const VIEWBOX = { x: 38, y: 8, width: 124, height: 370 };

const figure = ({ label, silhouette, forms, lines, details, hotspots }) => {
  // The grooves are the edges of the tappable groups, so the carving and the targets always agree.
  const shapes = [...hotspots.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
  const grooves = shapes.join(' ');
  // Every muscle belly is shaded three times, in the anatomy layer only: a highlight from the
  // upper left, a soft dark edge along the lower right, and a hairline light edge on top. The
  // interactive hotspots sit above this and never carry paint of their own at rest.
  // A belly is lit from the upper left and falls into shadow at its lower edge. Filling, never
  // stroking: a closed outline around every muscle is what made the figure read as armour plating.
  const bellies = shapes.map((d) => `<path d="${d}" fill="url(#ga-belly)"/>`).join('');
  return `
<svg viewBox="${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.width} ${VIEWBOX.height}" class="figure" aria-label="${label}">${defs(silhouette)}
  <ellipse class="floor" cx="100" cy="371" rx="60" ry="7" fill="url(#ga-pool)"/>
  <ellipse class="floor" cx="100" cy="371.5" rx="30" ry="3.6" fill="url(#ga-floor)"/>
  <g class="anatomy">
    ${silhouette.map((d) => `<path class="skin" d="${d}" fill="url(#ga-skin)"/>`).join('')}
    <g class="forms" clip-path="url(#ga-clip)" filter="url(#ga-form)">${forms}</g>
    <g class="bellies" clip-path="url(#ga-clip)">${bellies}</g>
    <path class="lines hi" d="${lines}" clip-path="url(#ga-clip)" transform="translate(-0.4 -0.4)"/>
    <path class="lines" d="${lines}" clip-path="url(#ga-clip)"/>
    <path class="grooves details" d="${details}"/>
    <path class="rim" d="${RIM}" clip-path="url(#ga-clip)"/>
  </g>
  <g class="hotspots">${hotspots}</g>
</svg>`;
};


const FRONT_LINES = [
  // clavicles and the sternum groove
  'M100 70 C 94 67.6, 86 67.4, 79.6 69.6',
  'M100 70 C 106 67.6, 114 67.4, 120.4 69.6',
  'M100 71 L 100 99',
  // linea alba, then the creases of the rectus abdominis
  'M100 103 L 100 186',
  'M88.4 121 C 94 123.4, 106 123.4, 111.6 121',
  'M87.4 141 C 94 143.6, 106 143.6, 112.6 141',
  'M86.4 160 C 94 162.6, 106 162.6, 113.6 160',
  // serratus ticks under the pec, on the side of the ribs
  'M73.4 112 L 77.4 115',
  'M72.6 119 L 76.8 122',
  'M72.2 126 L 76.4 129',
  // where the deltoid meets the chest and the arm
  'M73 73 C 75 82, 75 90, 72.6 97',
  'M56.6 100 C 55.6 112, 54.6 124, 53.4 133',
  'M52.6 145 C 55.6 147.4, 58.6 147.4, 60.4 146',
  // rectus femoris, the vastus medialis teardrop and the patella
  'M78 196 C 80.4 220, 79.6 246, 76.4 266',
  'M86.4 244 C 88.6 256, 86.6 267, 82 273.6',
  'M77.6 274 C 81 270.6, 86.4 271.6, 88.6 275.6 C 90 280.6, 85.6 285, 81.4 284.6 C 77.4 284.2, 75.4 279.4, 77.6 274',
  // the shin bone and the medial calf
  'M78.6 291 L 78.6 344',
  'M78 299 C 80.4 315, 79.6 331, 77.4 343',
  // belly of the hand: the knuckle line
  'M46.2 210.6 C 48.6 212.2, 52.4 212.2, 54.6 210.8',
].join(' ');

/* ------------------------------------------------------------------- front */

const FRONT_FORMS = [
  shade(0.35, 'M89.6 41 C 94 47.6, 106 47.6, 110.4 41 L 110 49 C 105 53.4, 95 53.4, 90 49 Z'), // under the chin
  shade(0.35, both('M69.5 97.5 C 78 103.5, 90 105.6, 99 102 L 99 106.5 C 90 108.6, 77 107.4, 69 101.5 Z')), // under the pecs
  shade(0.3, both('M66.8 93 C 67.6 110, 71.6 128, 73.6 143 L 79 143 C 76 126, 72 108, 70.4 93 Z')), // under the lats
  shade(0.22, both('M52 95 C 55 99.5, 60 102, 65.6 100 L 65 104 C 59 105.6, 54 103.4, 51.4 99.6 Z')), // under the deltoid
  shade(0.25, both('M85.6 186 C 85.8 210, 86.4 236, 86 262 L 89.4 262 C 89.6 236, 89.2 210, 89 188 Z')), // between the quads
  shade(0.25, both('M75 287 C 80 291.5, 86 291.5, 91 287 L 91 292 C 86 295.6, 80 295.6, 75 292 Z')), // under the kneecap
  shade(0.25, both('M91.6 292 C 92.6 306, 92.2 326, 89.6 346 L 86.4 346 C 89 326, 89.6 306, 88.6 292 Z')), // inner calf
].join('');

const FRONT_HOTSPOTS = [
  H('neck', 'Neck', 'M91 46.4 C 94 48.8, 106 48.8, 109 46.4 L 110.6 53.4 C 106 58.4, 94 58.4, 89.4 53.4 Z'),
  pair('shoulders', 'Shoulders', 'M71 64.6 C 63 64.8, 56.6 68.6, 53.8 75 C 51.8 80, 51.4 87, 52 93 C 53.6 98, 56 100.6, 58.6 101.2 C 61.6 96, 64 88, 66.4 80 C 68 74, 70 69, 71 64.6 Z'),
  pair('chest', 'Chest', 'M99 68.2 C 92 66.6, 80 66.6, 73 68.2 C 70 74.4, 68 81, 66.8 89 C 67.2 93, 68 95.4, 69.4 97 C 75 101.4, 84 103.4, 92 102.6 C 95.4 102.2, 98 101.2, 99 100 Z'),
  pair('biceps', 'Biceps', 'M51.4 98.6 C 54 102, 57.4 103.6, 60 103.8 C 62.4 103.2, 64.2 100.8, 65.4 97.8 C 65 108, 63.6 120, 61.6 130.6 C 59 134.4, 54.6 134.4, 52 131.4 C 50.2 124, 49.8 112, 50.6 104 Z'),
  pair('forearms', 'Forearms', 'M50.6 137.2 C 54 136, 58 136.4, 60 139 C 59.8 150, 58.6 165, 56 178 C 54.8 184, 53.8 188, 52.8 191.4 L 47.4 191.4 C 47 180, 47.4 160, 49 146 Z'),
  pair('hand-grip', 'Hands & grip', 'M46.6 197.4 L 53.2 197.4 C 55.6 200.6, 57.4 204.6, 58 208 C 58.4 210.6, 58.1 212.2, 57.5 212.3 C 56.7 212.4, 55.6 211.2, 54.9 210.4 C 54.7 214, 54 218.4, 50.8 220.4 C 48 220.8, 46.2 218.6, 45.6 214.8 C 45 209, 45.6 202, 46.6 197.4 Z'),
  pair('obliques', 'Obliques', 'M70 100.8 C 75 103.6, 80 104.8, 84.4 104.8 L 85 150 C 82 156.6, 78 161.6, 73 164.4 C 72.2 158, 73.6 150, 73.6 142 C 72.8 132, 69.4 122, 68.2 112 C 68 107, 68.6 103, 70 100.8 Z'),
  H('abs', 'Abs', 'M86 104.4 C 92 104.6, 97 103.6, 100 101.6 C 103 103.6, 108 104.6, 114 104.4 L 114.4 139.2 C 110 141, 104 141.6, 100 141.6 C 96 141.6, 90 141, 85.6 139.2 Z'),
  H('lower-abs', 'Lower abs', 'M85.6 143.6 C 90 145.4, 96 146, 100 146 C 104 146, 110 145.4, 114.4 143.6 L 114 166 C 110 176, 105 182.6, 100 186 C 95 182.6, 90 176, 86 166 Z'),
  pair('quads', 'Quads', 'M71.6 168 C 77 173, 82 178, 86 183.6 C 85.6 200, 85.4 220, 85.8 240 C 86 250, 85.6 259, 84.4 266.4 C 80 268, 75.6 267.4, 72.6 265 C 70 252, 67.8 232, 67.6 210 C 67.6 192, 69 178, 71.6 168 Z'),
  pair('adductors', 'Inner thighs', 'M88 186.6 C 92.4 191, 96.4 195.4, 97.6 200 C 96.6 214, 95 232, 93.4 248 C 92.4 254, 90.6 258, 88.6 259.4 C 87.8 250, 87.4 238, 87.4 222 C 87.4 208, 87.6 196, 88 186.6 Z'),
  pair('knees', 'Knees', 'M74.4 270.4 C 79 271.8, 85 270.8, 90.4 265.4 C 91 271, 90.8 276, 90.4 281 C 89.8 287, 87 291.4, 82.2 291.8 C 77.8 291.8, 75 289, 74.2 284 C 74 279, 74.2 274, 74.4 270.4 Z'),
  pair('tibialis', 'Shins', 'M75.2 295.4 C 79 297.4, 86 297.4, 90.8 294.4 C 91.8 305, 92 318, 91 332 C 90.4 338, 89.6 342, 88.6 344 L 80.2 344 C 76.8 336, 73.4 324, 73 312 C 72.8 304, 73.6 298.4, 75.2 295.4 Z'),
  pair('ankles', 'Ankles', 'M80.6 347 L 89.6 347 C 90.6 349, 92.6 351.6, 93 354.6 C 93.2 357.6, 92.2 359.6, 91.2 360.8 C 92 362.8, 94 363.6, 94.4 365.6 '
    + 'C 95 368, 93.6 369.6, 91.8 369.8 C 88.6 371, 83 371, 80.6 369.6 C 78.4 368.2, 78.4 363.4, 79.8 359.6 C 80.4 357.8, 79.2 357, 78.8 355.4 C 78.6 352.6, 79.6 349.4, 80.6 347 Z'),
].join('');

export const FRONT_FIGURE = figure({
  label: 'Front of the body: tap a body part',
  silhouette: SIL_FRONT,
  forms: FRONT_FORMS,
  lines: FRONT_LINES,
  details: DETAILS_FRONT,
  hotspots: FRONT_HOTSPOTS,
});


const BACK_LINES = [
  // the spine, and the shoulder blades either side of it
  'M100 62 C 99 100, 99 142, 100 182',
  'M74 82 C 80 92, 86 96.4, 92.4 96.6',
  'M126 82 C 120 92, 114 96.4, 107.6 96.6',
  'M76 92 C 82 99, 88 102, 93 102',
  'M124 92 C 118 99, 112 102, 107 102',
  // the outer edge of the lat, and the erectors beside the spine
  'M84 104 C 80 124, 76.4 144, 74.6 160',
  'M116 104 C 120 124, 123.6 144, 125.4 160',
  'M93.4 122 C 92.4 142, 92 162, 93.4 178',
  'M106.6 122 C 107.6 142, 108 162, 106.6 178',
  // the split in the triceps, and the elbow
  'M56.6 100 C 55.6 112, 54.6 124, 53.4 133',
  'M52.6 145 C 55.6 147.4, 58.6 147.4, 60.4 146',
  'M143.4 100 C 144.4 112, 145.4 124, 146.6 133',
  'M147.4 145 C 144.4 147.4, 141.4 147.4, 139.6 146',
  // the glute cleft and its lower fold
  'M100 186 L 100 220',
  'M86 219 C 92 222.4, 108 222.4, 114 219',
  // the two heads of the hamstring, and the one that splits the calf
  'M78.4 230 C 80.4 250, 79.4 266, 77.4 274',
  'M121.6 230 C 119.6 250, 120.6 266, 122.6 274',
  'M80.4 288 C 82.4 306, 82 326, 80 340',
  'M119.6 288 C 117.6 306, 118 326, 120 340',
  // the Achilles
  'M81.6 344 L 81.6 360',
  'M118.4 344 L 118.4 360',
].join(' ');

/* -------------------------------------------------------------------- back */

const BACK_FORMS = [
  shade(0.3, 'M89.6 42 C 94 47, 106 47, 110.4 42 L 110 50 C 105 53.6, 95 53.6, 90 50 Z'), // under the skull
  shade(0.25, 'M98.6 62 L 101.4 62 L 101.6 184 L 98.4 184 Z'), // the spine channel
  shade(0.2, both('M72.4 92.4 C 78 98, 83 101, 88 102 L 87.6 106 C 81 105, 75 101.4, 70.6 95.6 Z')), // under the shoulder blades
  shade(0.3, both('M68 102 C 70 122, 72 140, 75 160 L 80 158 C 77 138, 73.6 120, 71.6 102 Z')), // under the lats
  shade(0.35, both('M72 217.6 C 80 224, 91 224.6, 99 220 L 99 225.4 C 91 229, 79 228.6, 71 222 Z')), // under the glutes
  shade(0.25, both('M75.4 268 C 80 272.6, 86 272.6, 91 268.6 L 91 274 C 86 277, 80 277, 75 273.6 Z')), // behind the knee
  shade(0.25, both('M91.6 290 C 92.6 305, 92.2 325, 89.6 345 L 86.4 345 C 89 325, 89.6 305, 88.6 290 Z')), // inner calf
].join('');

const BACK_HOTSPOTS = [
  H('neck', 'Neck', 'M90.6 45 C 94 47, 106 47, 109.4 45 L 111 55 C 106 58.6, 94 58.6, 89 55 Z'),
  H('upper-back', 'Upper back', 'M88.6 56.6 C 84 60, 77 62.6, 71 64.6 C 75.2 70.6, 81 75.6, 86.4 78.6 C 88 87, 88.6 96, 89.4 104 C 92.4 108.4, 96.4 112.8, 100 115.8 '
    + 'C 103.6 112.8, 107.6 108.4, 110.6 104 C 111.4 96, 112 87, 113.6 78.6 C 119 75.6, 124.8 70.6, 129 64.6 C 123 62.6, 116 60, 111.4 56.6 C 106.6 60.4, 93.4 60.4, 88.6 56.6 Z'),
  pair('shoulders', 'Shoulders', 'M69.4 65.8 C 62 66, 56.6 69.2, 53.8 75 C 51.8 80, 51.4 87, 52 93 C 53.6 98, 56 100.6, 58.6 101.2 C 63 96, 67.6 89.6, 69.8 84.6 C 69 78, 68.8 71.6, 69.4 65.8 Z'),
  pair('rotator-cuff', 'Rotator cuff', 'M71.6 67.6 C 76 72.6, 80.6 77, 85 80.2 C 86.4 88, 87 95, 87.6 101.6 C 82 101, 76.2 97.6, 72.4 92.6 C 71 86, 71 76, 71.6 67.6 Z'),
  pair('triceps', 'Triceps', 'M51.4 98.6 C 54 102, 57.4 103.6, 60 103.8 C 62.4 103.2, 64.2 100.8, 65.4 97.8 C 65 108, 63.6 120, 61.6 130.6 C 59 134.4, 54.6 134.4, 52 131.4 C 50.2 124, 49.8 112, 50.6 104 Z'),
  pair('forearms', 'Forearms', 'M50.6 137.2 C 54 136, 58 136.4, 60 139 C 59.8 150, 58.6 165, 56 178 C 54.8 184, 53.8 188, 52.8 191.4 L 47.4 191.4 C 47 180, 47.4 160, 49 146 Z'),
  pair('hand-grip', 'Hands & grip', 'M46.6 197.4 L 53.2 197.4 C 55.6 200.6, 57.4 204.6, 58 208 C 58.4 210.6, 58.1 212.2, 57.5 212.3 C 56.7 212.4, 55.6 211.2, 54.9 210.4 C 54.7 214, 54 218.4, 50.8 220.4 C 48 220.8, 46.2 218.6, 45.6 214.8 C 45 209, 45.6 202, 46.6 197.4 Z'),
  pair('lats', 'Lats', 'M68.6 96 C 74.6 100, 81 103, 88 105.6 C 91.6 110, 94.6 114, 96.4 118.6 C 93 124, 90 130, 88 137 C 84 146, 79 154, 74.4 159.6 C 73.8 154, 74 148, 73.6 142 C 72.8 132, 69.2 122, 68.2 112 C 68 106, 68 100, 68.6 96 Z'),
  H('lower-back', 'Lower back', 'M100 121.6 C 96.6 124.6, 93.4 129, 90.6 134.6 C 88.6 144, 86.6 152, 85.8 160 C 86 166.6, 87 172, 88.4 177 C 92 179.6, 96 180.6, 100 180.6 '
    + 'C 104 180.6, 108 179.6, 111.6 177 C 113 172, 114 166.6, 114.2 160 C 113.4 152, 111.4 144, 109.4 134.6 C 106.6 129, 103.4 124.6, 100 121.6 Z'),
  pair('abductors', 'Hips (sides)', 'M74.6 163 C 78.4 166, 81.6 170, 83.8 176.4 C 81.6 183.6, 76.6 189.4, 68.8 194.2 C 67.8 186, 69.6 174, 74.6 163 Z'),
  pair('glutes', 'Glutes', 'M98.6 185 C 95 182.4, 90.6 180.6, 86.6 180.4 C 83 186.4, 77 192.6, 70.2 197.4 C 70 206, 71.6 213.6, 75.4 219 C 82 223.2, 92 222.8, 98.6 219.2 Z'),
  pair('hamstrings', 'Hamstrings', 'M72 225 C 80 228, 90 227.6, 96.6 225.2 C 96 238, 94.4 252, 92 264 C 89 270, 82 271.4, 74.8 268 C 70.8 256, 68.4 242, 68.6 230 C 69.2 228, 70.4 226, 72 225 Z'),
  pair('calves', 'Calves', 'M75.6 276.6 C 80 278.6, 86 278.4, 91 275 C 92.4 284, 93 296, 92.6 310 C 92 322, 89.4 332, 85.6 338 C 81 336, 77.6 328, 74.6 318 C 72.2 308, 72 298, 73.2 289 C 73.8 284, 74.6 280, 75.6 276.6 Z'),
  pair('ankles', 'Ankles', 'M81 342.6 L 90.4 342.6 C 91 350, 91.6 356, 91 361 C 91.8 364, 91.6 368, 89.4 369.8 C 87 371, 84 370.8, 82.4 369.4 C 80.6 367.6, 80.4 364, 81 361 C 80.6 356, 80.8 349, 81 342.6 Z'),
].join('');

export const BACK_FIGURE = figure({
  label: 'Back of the body: tap a body part',
  silhouette: SIL_BACK,
  forms: BACK_FORMS,
  lines: BACK_LINES,
  details: DETAILS_BACK,
  hotspots: BACK_HOTSPOTS,
});

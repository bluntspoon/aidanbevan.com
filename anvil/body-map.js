// The body map: two hand-drawn SVG figures whose muscle groups are buttons.
// Shapes are deliberately simple so the hotspots read at phone size; every group carries
// data-muscle and a <title> so the same element works for touch and for a screen reader.

const M = (id, label) => `data-muscle="${id}" role="button" tabindex="0" aria-label="${label}"`;

/** Front figure: head, torso, arms, legs, with chest/shoulders/biceps/abs/obliques/quads/forearms. */
export const FRONT_FIGURE = `
<svg viewBox="0 0 200 420" class="figure" aria-label="Front of the body: tap a muscle">
  <g class="anatomy">
    <ellipse cx="100" cy="30" rx="19" ry="23" class="body-face"/>
    <rect x="91" y="52" width="18" height="14" class="body-face"/>
    <path d="M100 64c-24 0-38 10-42 26l-4 52c-1 8 5 12 12 12h68c7 0 13-4 12-12l-4-52c-4-16-18-26-42-26z" class="body-torso"/>
    <path d="M58 92c-10 4-14 14-15 28l-6 62c-1 8 4 12 10 12s10-4 10-12l4-46 2-30z" class="body-limb"/>
    <path d="M142 92c10 4 14 14 15 28l6 62c1 8-4 12-10 12s-10-4-10-12l-4-46-2-30z" class="body-limb"/>
    <path d="M66 152h68l6 78c0 6-4 10-10 10H70c-6 0-10-4-10-10z" class="body-torso"/>
    <path d="M78 240h18l-2 130c0 8-3 12-8 12s-8-4-8-12z" class="body-limb"/>
    <path d="M104 240h18l0 130c0 8-3 12-8 12s-8-4-8-12z" class="body-limb"/>
  </g>
  <g class="hotspots">
    <ellipse cx="80" cy="102" rx="15" ry="12" class="hotspot" ${M('chest', 'Chest')}><title>Chest</title></ellipse>
    <ellipse cx="120" cy="102" rx="15" ry="12" class="hotspot" ${M('chest', 'Chest')}><title>Chest</title></ellipse>
    <circle cx="58" cy="92" r="14" class="hotspot" ${M('shoulders', 'Shoulders')}><title>Shoulders</title></circle>
    <circle cx="142" cy="92" r="14" class="hotspot" ${M('shoulders', 'Shoulders')}><title>Shoulders</title></circle>
    <ellipse cx="52" cy="150" rx="9" ry="22" class="hotspot" ${M('biceps', 'Biceps')}><title>Biceps</title></ellipse>
    <ellipse cx="148" cy="150" rx="9" ry="22" class="hotspot" ${M('biceps', 'Biceps')}><title>Biceps</title></ellipse>
    <ellipse cx="48" cy="200" rx="8" ry="20" class="hotspot" ${M('forearms', 'Forearms')}><title>Forearms</title></ellipse>
    <ellipse cx="152" cy="200" rx="8" ry="20" class="hotspot" ${M('forearms', 'Forearms')}><title>Forearms</title></ellipse>
    <ellipse cx="100" cy="140" rx="16" ry="20" class="hotspot" ${M('abs', 'Abs')}><title>Abs</title></ellipse>
    <ellipse cx="74" cy="160" rx="9" ry="18" class="hotspot" ${M('obliques', 'Obliques')}><title>Obliques</title></ellipse>
    <ellipse cx="126" cy="160" rx="9" ry="18" class="hotspot" ${M('obliques', 'Obliques')}><title>Obliques</title></ellipse>
    <ellipse cx="100" cy="176" rx="15" ry="10" class="hotspot" ${M('lower-abs', 'Lower abs')}><title>Lower abs</title></ellipse>
    <ellipse cx="86" cy="290" rx="14" ry="42" class="hotspot" ${M('quads', 'Quads')}><title>Quads</title></ellipse>
    <ellipse cx="114" cy="290" rx="14" ry="42" class="hotspot" ${M('quads', 'Quads')}><title>Quads</title></ellipse>
  </g>
</svg>`;

/** Back figure: upper back, lats, lower back, triceps, glutes, hamstrings, calves, neck. */
export const BACK_FIGURE = `
<svg viewBox="0 0 200 420" class="figure" aria-label="Back of the body: tap a muscle">
  <g class="anatomy">
    <ellipse cx="100" cy="30" rx="19" ry="23" class="body-face"/>
    <rect x="91" y="52" width="18" height="14" class="body-face"/>
    <path d="M100 64c-24 0-38 10-42 26l-4 52c-1 8 5 12 12 12h68c7 0 13-4 12-12l-4-52c-4-16-18-26-42-26z" class="body-torso"/>
    <path d="M58 92c-10 4-14 14-15 28l-6 62c-1 8 4 12 10 12s10-4 10-12l4-46 2-30z" class="body-limb"/>
    <path d="M142 92c10 4 14 14 15 28l6 62c1 8-4 12-10 12s-10-4-10-12l-4-46-2-30z" class="body-limb"/>
    <path d="M66 152h68l6 78c0 6-4 10-10 10H70c-6 0-10-4-10-10z" class="body-torso"/>
    <path d="M70 236h60l6 26c0 8-6 14-14 14H78c-8 0-14-6-14-14z" class="body-limb"/>
    <path d="M78 274h18l-2 96c0 8-3 12-8 12s-8-4-8-12z" class="body-limb"/>
    <path d="M104 274h18l0 96c0 8-3 12-8 12s-8-4-8-12z" class="body-limb"/>
    <path d="M78 384h18l-1 24c0 5-3 8-8 8s-8-3-8-8z" class="body-limb"/>
    <path d="M104 384h18l-1 24c0 5-3 8-8 8s-8-3-8-8z" class="body-limb"/>
  </g>
  <g class="hotspots">
    <ellipse cx="100" cy="72" rx="14" ry="8" class="hotspot" ${M('neck', 'Neck')}><title>Neck</title></ellipse>
    <ellipse cx="82" cy="96" rx="16" ry="12" class="hotspot" ${M('upper-back', 'Upper back')}><title>Upper back</title></ellipse>
    <ellipse cx="118" cy="96" rx="16" ry="12" class="hotspot" ${M('upper-back', 'Upper back')}><title>Upper back</title></ellipse>
    <ellipse cx="76" cy="126" rx="12" ry="20" class="hotspot" ${M('lats', 'Lats')}><title>Lats</title></ellipse>
    <ellipse cx="124" cy="126" rx="12" ry="20" class="hotspot" ${M('lats', 'Lats')}><title>Lats</title></ellipse>
    <ellipse cx="100" cy="170" rx="14" ry="20" class="hotspot" ${M('lower-back', 'Lower back')}><title>Lower back</title></ellipse>
    <ellipse cx="53" cy="150" rx="9" ry="22" class="hotspot" ${M('triceps', 'Triceps')}><title>Triceps</title></ellipse>
    <ellipse cx="147" cy="150" rx="9" ry="22" class="hotspot" ${M('triceps', 'Triceps')}><title>Triceps</title></ellipse>
    <ellipse cx="84" cy="222" rx="15" ry="13" class="hotspot" ${M('glutes', 'Glutes')}><title>Glutes</title></ellipse>
    <ellipse cx="116" cy="222" rx="15" ry="13" class="hotspot" ${M('glutes', 'Glutes')}><title>Glutes</title></ellipse>
    <ellipse cx="84" cy="310" rx="13" ry="38" class="hotspot" ${M('hamstrings', 'Hamstrings')}><title>Hamstrings</title></ellipse>
    <ellipse cx="116" cy="310" rx="13" ry="38" class="hotspot" ${M('hamstrings', 'Hamstrings')}><title>Hamstrings</title></ellipse>
    <ellipse cx="84" cy="392" rx="11" ry="16" class="hotspot" ${M('calves', 'Calves')}><title>Calves</title></ellipse>
    <ellipse cx="118" cy="392" rx="11" ry="16" class="hotspot" ${M('calves', 'Calves')}><title>Calves</title></ellipse>
  </g>
</svg>`;

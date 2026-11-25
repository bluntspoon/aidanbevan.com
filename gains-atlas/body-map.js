// The body map: two hand-drawn SVG figures whose muscle groups are buttons.
//
// Proportioned like an athlete: shoulders about two head-widths, a ribcage that tapers to the
// waist, a real pelvis, deltoid caps, a bicep peak, a calf belly. Deliberately not a medical
// plate — every hotspot has to stay a finger-sized target at 360 px — but it should read as a
// person, not a toy. Every group carries data-muscle, role="button" and a <title>.

const H = (id, label, d) =>
  `<path class="hotspot" data-muscle="${id}" role="button" tabindex="0" aria-label="${label}" d="${d}"><title>${label}</title></path>`;

/* ------------------------------------------------------------------ front */

const FRONT_BASE = `
  <!-- head, neck, and the trapezius slope that joins them to the shoulders -->
  <ellipse cx="100" cy="30" rx="15" ry="18.5" fill="#312a2a"/>
  <path d="M93 44 C 96 49, 104 49, 107 44 L 108 58 C 104 62, 96 62, 92 58 Z" fill="#2a2424"/>
  <path d="M100 50 C 92 52, 84 56, 76 62 L60 70 L74 70 C 84 66, 92 64, 100 63
           C 108 64, 116 66, 126 70 L140 70 L124 62 C 116 56, 108 52, 100 50 Z" fill="#241f1f"/>
  <!-- ribcage: clavicles, then the lat taper into the waist -->
  <path d="M100 62
           C 88 62, 75 66, 68 72
           C 62 78, 59 90, 59 102
           C 55 114, 58 128, 61 138
           C 62 150, 65 160, 68 168
           C 70 174, 74 179, 80 182
           C 87 185, 93 186, 100 186
           C 107 186, 113 185, 120 182
           C 126 179, 130 174, 132 168
           C 135 160, 138 150, 140 140
           C 143 128, 145 114, 145 102
           C 145 90, 142 78, 136 72
           C 128 66, 114 62, 100 62 Z"
        fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <!-- clavicle line, so the chest sits under something -->
  <path d="M84 72 C 90 70, 96 69, 100 70 C 104 69, 110 70, 116 72" fill="none" stroke="#3b3232" stroke-width="1"/>
  <!-- arms: deltoid to elbow to wrist, hanging with a small gap at the ribcage -->
  <path d="M64 72
           C 55 75, 49 83, 47 94
           C 45 104, 44 114, 45 122
           C 45 128, 47 132, 51 132
           C 55 132, 57 128, 58 122
           L 62 100 L 64 84 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M136 72
           C 145 75, 151 83, 153 94
           C 155 104, 156 114, 155 122
           C 155 128, 153 132, 149 132
           C 145 132, 143 128, 142 122
           L 138 100 L 136 84 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M45 133 C 42 152, 42 178, 45 202 L 53 202 C 55 178, 54 152, 52 133 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M155 133 C 158 152, 158 178, 155 202 L 147 202 C 145 178, 146 152, 148 133 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M45 203 C 42 213, 44 224, 50 227 C 55 229, 58 224, 56 216 L 53 203 Z" fill="#2e2828"/>
  <path d="M155 203 C 158 213, 156 224, 150 227 C 145 229, 142 224, 144 216 L 147 203 Z" fill="#2e2828"/>
  <!-- pelvis, then thighs that taper to the knee, calves, ankles -->
  <path d="M80 183 C 74 188, 71 196, 72 206 C 73 213, 78 217, 86 217 C 94 217, 99 213, 100 206
           C 101 213, 106 217, 114 217 C 122 217, 127 213, 128 206 C 129 196, 126 188, 120 183 Z"
        fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M73 216 C 70 230, 70 248, 72 262 C 73 270, 76 276, 79 280 L 84 296 C 87 304, 87 310, 85 316
           L 78 356 C 77 364, 80 369, 84 369 C 88 369, 91 365, 91 358 L 92 322 L 93 296 L 93 262
           C 96 246, 94 227, 92 216 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M77 356 C 73 360, 71 366, 72 370 L 92 370 C 93 364, 89 358, 84 356 Z" fill="#2e2828"/>
  <path d="M127 216 C 130 230, 130 248, 128 262 C 127 270, 124 276, 121 280 L 116 296 C 113 304, 113 310, 115 316
           L 122 356 C 123 364, 120 369, 116 369 C 112 369, 109 365, 109 358 L 108 322 L 107 296 L 107 262
           C 104 246, 106 227, 108 216 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M123 356 C 127 360, 129 366, 128 370 L 108 370 C 107 364, 111 358, 116 356 Z" fill="#2e2828"/>
`;

const FRONT_HOTSPOTS = [
  // pectorals: two fans from the sternum out to the armpit
  H('chest', 'Chest', 'M98 75 C 90 73, 81 75, 76 80 C 72 85, 71 93, 74 99 C 79 105, 88 105, 95 101 C 97 96, 97 86, 98 78 Z'),
  H('chest', 'Chest', 'M102 75 C 110 73, 119 75, 124 80 C 128 85, 129 93, 126 99 C 121 105, 112 105, 105 101 C 103 96, 103 86, 102 78 Z'),
  // deltoids: caps over the shoulder joint
  H('shoulders', 'Shoulders', 'M72 68 C 64 71, 59 78, 58 88 C 57 94, 62 97, 67 95 C 72 92, 75 85, 75 76 Z'),
  H('shoulders', 'Shoulders', 'M128 68 C 136 71, 141 78, 142 88 C 143 94, 138 97, 133 95 C 128 92, 125 85, 125 76 Z'),
  // biceps: the peak on the front of the upper arm
  H('biceps', 'Biceps', 'M56 98 C 52 108, 51 120, 53 130 C 55 137, 62 137, 64 130 C 66 120, 64 108, 62 98 Z'),
  H('biceps', 'Biceps', 'M144 98 C 148 108, 149 120, 147 130 C 145 137, 138 137, 136 130 C 134 120, 136 108, 138 98 Z'),
  // forearms
  H('forearms', 'Forearms', 'M50 137 C 48 158, 48 186, 50 198 C 54 203, 60 202, 61 194 C 62 176, 61 152, 60 137 Z'),
  H('forearms', 'Forearms', 'M150 137 C 152 158, 152 186, 150 198 C 146 203, 140 202, 139 194 C 138 176, 139 152, 140 137 Z'),
  // abs: upper block and lower block, split at the navel
  H('abs', 'Abs', 'M88 92 C 94 89, 106 89, 112 92 L 111 134 C 106 137, 94 137, 89 134 Z'),
  H('lower-abs', 'Lower abs', 'M89 141 C 94 143, 106 143, 111 141 L 110 172 C 105 176, 95 176, 90 172 Z'),
  // obliques: the waist sides, narrow and angled
  H('obliques', 'Obliques', 'M78 104 C 74 118, 74 136, 78 152 C 82 158, 87 152, 87 140 L 87 108 C 84 104, 81 103, 78 104 Z'),
  H('obliques', 'Obliques', 'M122 104 C 126 118, 126 136, 122 152 C 118 158, 113 152, 113 140 L 113 108 C 116 104, 119 103, 122 104 Z'),
  // quads: the rectus femoris down the front of the thigh
  H('quads', 'Quads', 'M75 224 C 72 240, 72 258, 75 272 C 78 280, 85 280, 87 271 C 89 256, 88 238, 85 222 Z'),
  H('quads', 'Quads', 'M125 224 C 128 240, 128 258, 125 272 C 122 280, 115 280, 113 271 C 111 256, 112 238, 115 222 Z'),
].join('');

export const FRONT_FIGURE = `
<svg viewBox="0 0 200 380" class="figure" aria-label="Front of the body: tap a muscle">
  <g class="anatomy">${FRONT_BASE}</g>
  <g class="hotspots">${FRONT_HOTSPOTS}</g>
</svg>`;

/* ------------------------------------------------------------------- back */

const BACK_BASE = `
  <ellipse cx="100" cy="30" rx="15" ry="18.5" fill="#312a2a"/>
  <path d="M94 46h12v8h-12z" fill="#2a2424"/>
  <path d="M100 50 C 92 52, 84 56, 76 62 L60 70 L74 70 C 84 66, 92 64, 100 63
           C 108 64, 116 66, 126 70 L140 70 L124 62 C 116 56, 108 52, 100 50 Z" fill="#241f1f"/>
  <path d="M100 62
           C 88 62, 75 66, 68 72
           C 62 78, 59 90, 59 102
           C 55 114, 58 128, 61 138
           C 62 150, 65 160, 68 168
           C 70 174, 74 179, 80 182
           C 87 185, 93 186, 100 186
           C 107 186, 113 185, 120 182
           C 126 179, 130 174, 132 168
           C 135 160, 138 150, 140 140
           C 143 128, 145 114, 145 102
           C 145 90, 142 78, 136 72
           C 128 66, 114 62, 100 62 Z"
        fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M64 72
           C 55 75, 49 83, 47 94
           C 45 104, 44 114, 45 122
           C 45 128, 47 132, 51 132
           C 55 132, 57 128, 58 122
           L 62 100 L 64 84 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M136 72
           C 145 75, 151 83, 153 94
           C 155 104, 156 114, 155 122
           C 155 128, 153 132, 149 132
           C 145 132, 143 128, 142 122
           L 138 100 L 136 84 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M45 133 C 42 152, 42 178, 45 202 L 53 202 C 55 178, 54 152, 52 133 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M155 133 C 158 152, 158 178, 155 202 L 147 202 C 145 178, 146 152, 148 133 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M45 203 C 42 213, 44 224, 50 227 C 55 229, 58 224, 56 216 L 53 203 Z" fill="#2e2828"/>
  <path d="M155 203 C 158 213, 156 224, 150 227 C 145 229, 142 224, 144 216 L 147 203 Z" fill="#2e2828"/>
  <!-- glutes: heart-shaped pair sitting on the hips -->
  <path d="M100 184 C 88 184, 76 188, 72 196 C 68 205, 72 216, 82 220 C 90 223, 97 220, 100 214
           C 103 220, 110 223, 118 220 C 128 216, 132 205, 128 196 C 124 188, 112 184, 100 184 Z"
        fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M74 219 C 71 232, 72 248, 76 262 C 79 270, 82 276, 84 282 L 88 298 C 90 306, 88 312, 85 318
           L 78 360 C 77 367, 80 371, 84 371 C 88 371, 91 367, 91 360 L 93 324 L 96 292 L 96 258
           C 96 244, 94 228, 92 219 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
  <path d="M126 219 C 129 232, 128 248, 124 262 C 121 270, 118 276, 116 282 L 112 298 C 110 306, 112 312, 115 318
           L 122 360 C 123 367, 120 371, 116 371 C 112 371, 109 367, 109 360 L 107 324 L 104 292 L 104 258
           C 104 244, 106 228, 108 219 Z" fill="#241f1f" stroke="#3b3232" stroke-width="1.1"/>
`;

const BACK_HOTSPOTS = [
  // neck: the trapezius rising to the skull
  H('neck', 'Neck', 'M92 46 C 96 53, 104 53, 108 46 L 110 64 C 105 71, 95 71, 90 64 Z'),
  // upper back: traps fanning from the neck to each shoulder
  H('upper-back', 'Upper back', 'M90 64 C 78 66, 68 73, 64 83 C 71 95, 83 102, 99 103 L 99 74 Z'),
  H('upper-back', 'Upper back', 'M110 64 C 122 66, 132 73, 136 83 C 129 95, 117 102, 101 103 L 101 74 Z'),
  // lats: from the armpit, wrapping down and in toward the spine
  H('lats', 'Lats', 'M64 96 C 60 112, 62 134, 69 150 C 77 157, 84 149, 84 134 L 84 104 C 77 99, 70 96, 64 96 Z'),
  H('lats', 'Lats', 'M136 96 C 140 112, 138 134, 131 150 C 123 157, 116 149, 116 134 L 116 104 C 123 99, 130 96, 136 96 Z'),
  // lower back: the erectors either side of the spine
  H('lower-back', 'Lower back', 'M88 136 C 86 152, 87 168, 91 180 L 98 180 L 98 136 Z'),
  H('lower-back', 'Lower back', 'M112 136 C 114 152, 113 168, 109 180 L 102 180 L 102 136 Z'),
  // triceps on the back of the upper arm
  H('triceps', 'Triceps', 'M57 98 C 52 108, 51 120, 53 130 C 55 137, 62 136, 64 129 C 66 119, 64 107, 62 98 Z'),
  H('triceps', 'Triceps', 'M143 98 C 148 108, 149 120, 147 130 C 145 137, 138 136, 136 129 C 134 119, 136 107, 138 98 Z'),
  // glutes
  H('glutes', 'Glutes', 'M86 186 C 76 188, 72 198, 75 209 C 79 217, 90 218, 96 212 C 98 201, 95 189, 86 186 Z'),
  H('glutes', 'Glutes', 'M114 186 C 124 188, 128 198, 125 209 C 121 217, 110 218, 104 212 C 102 201, 105 189, 114 186 Z'),
  // hamstrings down the back of the thigh
  H('hamstrings', 'Hamstrings', 'M77 228 C 74 246, 76 264, 81 278 C 86 284, 92 278, 93 266 C 94 250, 92 236, 88 226 Z'),
  H('hamstrings', 'Hamstrings', 'M123 228 C 126 246, 124 264, 119 278 C 114 284, 108 278, 107 266 C 106 250, 108 236, 112 226 Z'),
  // calves: the belly high on the back of the shin
  H('calves', 'Calves', 'M76 288 C 72 302, 74 322, 80 336 C 86 342, 90 335, 89 322 C 88 306, 86 294, 84 286 Z'),
  H('calves', 'Calves', 'M124 288 C 128 302, 126 322, 120 336 C 114 342, 110 335, 111 322 C 112 306, 114 294, 116 286 Z'),
].join('');

export const BACK_FIGURE = `
<svg viewBox="0 0 200 380" class="figure" aria-label="Back of the body: tap a muscle">
  <g class="anatomy">${BACK_BASE}</g>
  <g class="hotspots">${BACK_HOTSPOTS}</g>
</svg>`;

// The exercise list. Every entry has enough to actually train from: sets and reps, rest, a cue
// to get the movement right, and the mistake that wastes the set.




// Columns: id, name, primary, secondary, equipment, place, level, sets, reps, rest, cue, avoid

const ROWS = [
  // ---- chest
  ['push-up', 'Push-up', 'chest', ['triceps', 'shoulders'], 'bodyweight', 'home', 'beginner', '3-4', '8-15', '60-90s', 'Body in one line from head to heel, hands under the chest.', 'Hips sagging or head craning forward.'],
  ['incline-push-up', 'Feet-elevated push-up', 'chest', ['shoulders', 'triceps'], 'bodyweight', 'home', 'intermediate', '3-4', '8-12', '90s', 'Feet on a chair to load the upper chest.', 'Letting the elbows flare out to 90 degrees.'],
  ['bench-press', 'Barbell bench press', 'chest', ['triceps', 'shoulders'], 'barbell', 'gym', 'intermediate', '4', '5-8', '2-3 min', 'Shoulder blades pinched, bar to the lower chest.', 'Bouncing the bar off the chest.'],
  ['incline-press-dumbbell', 'Incline dumbbell press', 'chest', ['shoulders', 'triceps'], 'dumbbell', 'gym', 'beginner', '3-4', '8-12', '90s', 'Bench at 30 degrees, elbows under the hands, press up and slightly in.', 'Bench too steep: it becomes a shoulder press.'],
  ['cable-fly', 'Cable fly', 'chest', ['shoulders'], 'cable', 'gym', 'intermediate', '3', '12-15', '60s', 'Slight elbow bend, bring the hands together.', 'Using the arms as the movement instead of the chest.'],
  ['dumbbell-press-home', 'Dumbbell floor press', 'chest', ['triceps'], 'dumbbell', 'home', 'beginner', '3', '8-12', '75s', 'Lower until the upper arms touch the floor.', 'Spreading the elbows wide on the floor.'],
  ['chest-press-machine', 'Chest press machine', 'chest', ['triceps'], 'machine', 'gym', 'beginner', '3', '10-12', '60-75s', 'Handles level with the middle of the chest.', 'Setting the seat so the shoulders roll forward.'],

  // ---- shoulders
  ['pike-push-up', 'Pike push-up', 'shoulders', ['triceps'], 'bodyweight', 'home', 'intermediate', '3-4', '6-10', '90s', 'Hips high, crown of the head to the floor.', 'Doing a normal push-up from a half-raised position.'],
  ['lateral-raise', 'Dumbbell lateral raise', 'shoulders', [], 'dumbbell', 'home', 'beginner', '3-4', '12-15', '45-60s', 'Lead with the elbows to shoulder height.', 'Swinging with the hips to lift a heavier weight.'],
  ['shoulder-press', 'Overhead press', 'shoulders', ['triceps'], 'barbell', 'gym', 'intermediate', '4', '5-8', '2 min', 'Squeeze the glutes, press the bar overhead.', 'Leaning back so it becomes an incline press.'],
  ['rear-delt-fly', 'Rear-delt fly', 'shoulders', ['upper-back'], 'dumbbell', 'home', 'beginner', '3', '12-15', '45-60s', 'Hinge at the hips, pull wide with the thumbs down, squeeze the shoulder blades.', 'Standing too upright, which turns it into a row.'],
  ['upright-row-cable', 'Cable upright row', 'shoulders', ['upper-back'], 'cable', 'gym', 'intermediate', '3', '10-12', '60s', 'Pull to the collarbones, elbows leading.', 'Pulling above chest height and gripping too narrow.'],
  ['band-face-pull', 'Band face pull', 'shoulders', ['upper-back'], 'band', 'home', 'beginner', '3', '12-20', '45s', 'Pull to the forehead, hands apart.', 'Shrugging the shoulders up as you pull.'],

  // ---- biceps
  ['db-curl', 'Dumbbell curl', 'biceps', ['forearms'], 'dumbbell', 'home', 'beginner', '3-4', '8-12', '60s', 'Elbows pinned to the ribs, curl and squeeze.', 'Rocking the torso to help the weight up.'],
  ['hammer-curl', 'Hammer curl', 'biceps', ['forearms'], 'dumbbell', 'home', 'beginner', '3', '10-12', '60s', 'Thumbs up the whole way, elbows tight to the ribs: builds the brachialis.', 'Short half reps at the top half only.'],
  ['barbell-curl', 'Barbell curl', 'biceps', ['forearms'], 'barbell', 'gym', 'intermediate', '3-4', '6-10', '90s', 'Shoulder-width grip, no body swing.', 'Bending the wrists back at the top.'],
  ['incline-curl', 'Incline bench curl', 'biceps', [], 'dumbbell', 'gym', 'intermediate', '3', '8-12', '60s', 'Arms behind the body to stretch the long head.', 'Letting the shoulders roll forward off the bench.'],
  ['preacher-curl', 'Preacher curl', 'biceps', ['forearms'], 'machine', 'gym', 'beginner', '3', '10-12', '60s', 'Lower slowly until the arm is almost straight.', 'Bouncing out of the bottom position.'],
  ['band-curl', 'Band curl', 'biceps', ['forearms'], 'band', 'home', 'beginner', '3', '12-20', '45s', 'Stand on the band, curl with the elbows still.', 'Band too short: you cannot get a full range.'],
  ['chin-up', 'Chin-up', 'biceps', ['upper-back'], 'bodyweight', 'home', 'advanced', '4', '3-8', '2 min', 'Palms toward you, chest to the bar.', 'Dropping in the bottom half instead of controlled reps.'],

  // ---- triceps
  ['diamond-push-up', 'Diamond push-up', 'triceps', ['chest'], 'bodyweight', 'home', 'intermediate', '3', '8-12', '75s', 'Hands together under the chest, elbows tucked.', 'Elbows flaring past the ribs.'],
  ['bench-dip', 'Bench dip', 'triceps', ['shoulders'], 'bodyweight', 'home', 'beginner', '3', '10-15', '60s', 'Hips close to the bench, elbows back.', 'Going so deep the shoulders complain.'],
  ['skull-crusher', 'Skull crusher', 'triceps', [], 'barbell', 'gym', 'intermediate', '3', '8-12', '75s', 'Upper arms vertical, lower to the forehead.', 'Elbows drifting wide apart.'],
  ['rope-pushdown', 'Rope pushdown', 'triceps', [], 'cable', 'gym', 'beginner', '3-4', '10-15', '45-60s', 'Split the rope at the bottom and squeeze.', 'Leaning on the cable and using bodyweight.'],
  ['overhead-extension', 'Overhead dumbbell extension', 'triceps', [], 'dumbbell', 'home', 'beginner', '3', '10-12', '60s', 'Elbows close to the head, stretch the long head.', 'Flaring the elbows out to the sides.'],
  ['close-grip-press', 'Close-grip bench press', 'triceps', ['chest'], 'barbell', 'gym', 'intermediate', '4', '5-8', '2 min', 'Hands just inside shoulder width.', 'Grip so narrow the wrists bend sideways.'],

  // ---- forearms
  ['wrist-curl', 'Wrist curl', 'forearms', [], 'dumbbell', 'home', 'beginner', '3', '12-20', '45s', 'Forearms on the thighs, curl the wrists up.', 'Letting the elbows lift off the legs.'],
  ['wrist-extension', 'Wrist extension', 'forearms', [], 'dumbbell', 'home', 'beginner', '3', '12-20', '45s', 'Palm down over the knee, lift with the back of the hand.', 'Using a weight you cannot control on the way down.'],
  ['farmer-carry', "Farmer's carry", 'forearms', ['abs', 'upper-back'], 'dumbbell', 'home', 'beginner', '3', '30-40 m', '90s', 'Stand tall, ribcage down, grip hard.', 'Shrugging forward and leaning to one side.'],
  ['dead-hang', 'Dead hang', 'forearms', ['lats'], 'bodyweight', 'home', 'beginner', '3', '20-45s', '60s', 'Hang from a bar, shoulders active.', 'Total passive hang with the shoulders up at the ears.'],
  ['reverse-curl', 'Reverse curl', 'forearms', ['biceps'], 'barbell', 'gym', 'beginner', '3', '10-12', '45s', 'Overhand grip, wrists straight.', 'Wrist collapsing under the bar.'],

  // ---- abs
  ['plank', 'Plank', 'abs', ['obliques'], 'bodyweight', 'home', 'beginner', '3', '30-60s', '45s', 'Elbows under the shoulders, glutes on.', 'Hips drifting up or sagging down.'],
  ['dead-bug', 'Dead bug', 'abs', [], 'bodyweight', 'home', 'beginner', '3', '8-10 each side', '45s', 'Lower back flat to the floor the whole time.', 'Lower back arching as the leg drops.'],
  ['cable-crunch', 'Cable crunch', 'abs', [], 'cable', 'gym', 'intermediate', '3-4', '12-15', '60s', 'Hinge from the mid-back, not the hips.', 'Pulling with the arms instead of curling the trunk.'],
  ['hanging-leg-raise', 'Hanging leg raise', 'abs', ['forearms'], 'bodyweight', 'home', 'advanced', '3', '6-12', '90s', 'Curl the pelvis up at the top.', 'Swinging to get the legs up.'],
  ['ab-wheel', 'Ab wheel rollout', 'abs', ['lats'], 'bodyweight', 'home', 'advanced', '3', '6-10', '90s', 'Go only as far as you can hold the ribcage down.', 'Letting the lower back arch at the bottom.'],
  ['sit-up', 'Sit-up', 'abs', [], 'bodyweight', 'home', 'beginner', '3', '12-20', '45s', 'Feet anchored, curl the spine up vertebra by vertebra, chin tucked.', 'Yanking on the neck with the hands.'],

  // ---- lower abs
  ['reverse-crunch', 'Reverse crunch', 'lower-abs', ['abs'], 'bodyweight', 'home', 'beginner', '3', '12-15', '45s', 'Knees to chest: lift the hips off the floor, not just the legs.', 'Swinging the legs for momentum.'],
  ['lying-leg-raise', 'Lying leg raise', 'lower-abs', ['abs'], 'bodyweight', 'home', 'beginner', '3', '10-15', '60s', 'Press the lower back into the floor, lower the legs slowly.', 'Letting the lower back arch as the legs drop.'],
  ['hollow-hold', 'Hollow hold', 'lower-abs', ['abs'], 'bodyweight', 'home', 'intermediate', '3', '20-40s', '45s', 'Ribs down, lower back flat, shoulders and legs just off the floor.', 'Arching the back to keep the legs up.'],
  ['v-up', 'V-up', 'lower-abs', ['abs'], 'bodyweight', 'home', 'intermediate', '3', '8-12', '60s', 'Legs straight, reach the hands to the toes.', 'Bouncing up with momentum.'],
  ['mountain-climber', 'Mountain climber', 'lower-abs', ['abs', 'quads'], 'bodyweight', 'home', 'beginner', '3', '30-45s', '45s', 'Hips low and still, drive one knee at a time.', 'Bouncing the hips up and down.'],
  ['hanging-knee-raise', 'Hanging knee raise', 'lower-abs', ['abs', 'forearms'], 'bodyweight', 'gym', 'intermediate', '3', '10-15', '60s', 'Curl the pelvis at the top, no swing.', 'Swinging the body to get the knees up.'],
  ['cable-reverse-crunch', 'Cable reverse crunch', 'lower-abs', ['abs'], 'cable', 'gym', 'intermediate', '3', '12-15', '60s', 'Curl the pelvis under, arms stay still.', 'Pulling the weight with the arms.'],
  // ---- obliques
  ['side-plank', 'Side plank', 'obliques', ['abs'], 'bodyweight', 'home', 'beginner', '3', '20-40s each side', '45s', 'Stack the shoulders and hips, lift the underside body.', 'Letting the hips drop toward the floor.'],
  ['russian-twist', 'Russian twist', 'obliques', ['abs'], 'dumbbell', 'home', 'beginner', '3', '12-15 each side', '45s', 'Twist from the ribcage and follow with the eyes.', 'Just waving the hands side to side.'],
  ['wood-chop', 'Cable wood chop', 'obliques', ['abs'], 'cable', 'gym', 'intermediate', '3', '10-12 each side', '60s', 'Rotate through the mid-back, hips stay square.', 'Pulling with the arms only.'],
  ['suitcase-carry', 'Suitcase carry', 'obliques', ['forearms'], 'dumbbell', 'home', 'beginner', '3', '30-40 m each side', '60s', 'Walk with the weight in one hand, shoulders level, ribcage down.', 'Leaning away from the weight.'],
  ['pallof-press', 'Pallof press', 'obliques', ['abs'], 'band', 'home', 'beginner', '3', '10-12 each side', '45s', 'Push the band straight out and resist the twist.', 'Letting the arms swing with the band.'],

  // ---- upper back
  ['seated-row', 'Seated cable row', 'upper-back', ['lats', 'biceps'], 'cable', 'gym', 'beginner', '3-4', '8-12', '75s', 'Pull the handle to the navel, chest tall.', 'Leaning way back to drag the weight.'],
  ['barbell-row', 'Bent-over barbell row', 'upper-back', ['lats', 'lower-back'], 'barbell', 'gym', 'intermediate', '4', '6-10', '2 min', 'Hinge to 45 degrees, pull to the lower ribs.', 'Standing up as you pull.'],
  ['db-row', 'One-arm dumbbell row', 'upper-back', ['lats', 'biceps'], 'dumbbell', 'home', 'beginner', '3-4', '8-12 each side', '60-75s', 'Flat back, pull the elbow past the ribs.', 'Twisting the torso to lift the weight.'],
  ['face-pull-cable', 'Cable face pull', 'upper-back', ['shoulders'], 'cable', 'gym', 'beginner', '3', '12-15', '45-60s', 'Pull to the forehead, elbows high.', 'Using too much weight and turning it into a row.'],
  ['inverted-row', 'Inverted row', 'upper-back', ['biceps'], 'bodyweight', 'home', 'beginner', '3', '8-15', '75s', 'Body straight, pull the chest to the bar.', 'Hips sinking on the way up.'],
  ['shrug', 'Barbell shrug', 'upper-back', ['neck'], 'barbell', 'gym', 'beginner', '3', '10-15', '60s', 'Shrug the shoulders straight up toward the ears, pause, lower slowly.', 'Rolling the shoulders in circles.'],

  // ---- lats
  ['pull-up', 'Pull-up', 'lats', ['upper-back', 'biceps'], 'bodyweight', 'home', 'advanced', '4', '4-10', '2 min', 'Overhand, pull the elbows to the ribs.', 'Kipping the legs to get over the bar.'],
  ['lat-pulldown', 'Lat pulldown', 'lats', ['biceps'], 'machine', 'gym', 'beginner', '3-4', '8-12', '75s', 'Bar to the collarbones, chest up.', 'Leaning back and using torso momentum.'],
  ['band-pulldown', 'Band lat pulldown', 'lats', ['biceps'], 'band', 'home', 'beginner', '3', '12-15', '60s', 'Anchor high, pull the elbows down to the ribs.', 'Letting the band snap back up.'],
  ['straight-arm-pulldown', 'Straight-arm pulldown', 'lats', [], 'cable', 'gym', 'intermediate', '3', '12-15', '45-60s', 'Arms almost straight, pull to the thighs.', 'Bending the elbows and turning it into a row.'],
  ['db-pullover', 'Dumbbell pullover', 'lats', ['chest'], 'dumbbell', 'home', 'intermediate', '3', '10-12', '60s', 'Big stretch overhead, pull back over the chest.', 'Bending the elbows too much.'],

  // ---- lower back
  ['back-extension', 'Back extension', 'lower-back', ['glutes'], 'machine', 'gym', 'beginner', '3', '12-15', '60s', 'Hinge at the hips, rise to a straight line.', 'Over-arching past neutral at the top.'],
  ['superman', 'Superman hold', 'lower-back', ['glutes'], 'bodyweight', 'home', 'beginner', '3', '20-30s', '45s', 'Lift arms and legs, squeeze the glutes.', 'Cranking the head up and straining the neck.'],
  ['good-morning', 'Good morning', 'lower-back', ['hamstrings', 'glutes'], 'barbell', 'gym', 'advanced', '3', '8-10', '90s', 'Push the hips back, keep the bar over the feet.', 'Rounding the back under the bar.'],
  ['bird-dog', 'Bird dog', 'lower-back', ['abs'], 'bodyweight', 'home', 'beginner', '3', '8-10 each side', '45s', 'Opposite arm and leg, hips level.', 'Hips rocking side to side.'],

  // ---- glutes
  ['hip-thrust', 'Hip thrust', 'glutes', ['hamstrings'], 'barbell', 'gym', 'intermediate', '4', '8-12', '90s', 'Ribs down, drive the hips up and squeeze.', 'Over-extending the lower back at the top.'],
  ['glute-bridge', 'Glute bridge', 'glutes', ['hamstrings'], 'bodyweight', 'home', 'beginner', '3', '12-15', '45s', 'Heels close, push through the heels.', 'Pushing from the toes and feeling it in the quads.'],
  ['bulgarian-split-squat', 'Bulgarian split squat', 'glutes', ['quads'], 'dumbbell', 'home', 'intermediate', '3', '8-12 each side', '90s', 'Back foot on a chair, front shin near vertical.', 'Standing too close to the bench.'],
  ['cable-kickback', 'Cable kickback', 'glutes', [], 'cable', 'gym', 'beginner', '3', '12-15 each side', '45s', 'Hinge slightly, kick straight back.', 'Swinging the leg with the lower back.'],
  ['band-walk', 'Banded lateral walk', 'glutes', [], 'band', 'home', 'beginner', '3', '10-15 steps each way', '45s', 'Band above the knees, stay low.', 'Standing tall and stepping with the whole foot.'],

  // ---- quads
  ['squat', 'Barbell back squat', 'quads', ['glutes', 'lower-back'], 'barbell', 'gym', 'intermediate', '4', '5-8', '2-3 min', 'Brace the trunk, knees track over the toes.', 'Knees caving in on the way up.'],
  ['goblet-squat', 'Goblet squat', 'quads', ['glutes'], 'kettlebell', 'home', 'beginner', '3', '10-15', '75s', 'Weight at the chest, sit down between the knees.', 'Heels lifting off the floor.'],
  ['leg-press', 'Leg press', 'quads', ['glutes'], 'machine', 'gym', 'beginner', '3-4', '8-12', '90s', 'Feet flat on the platform, lower until the thighs reach 90 degrees.', 'Letting the lower back round off the pad.'],
  ['lunge', 'Walking lunge', 'quads', ['glutes', 'hamstrings'], 'bodyweight', 'home', 'beginner', '3', '10-12 each leg', '75s', 'Long step, back knee toward the floor.', 'Tiny steps that turn it into a standing wobble.'],
  ['leg-extension', 'Leg extension', 'quads', [], 'machine', 'gym', 'beginner', '3', '12-15', '60s', 'Straighten the knees fully, pause at the top, lower slowly.', 'Kicking the weight up.'],
  ['step-up', 'Dumbbell step-up', 'quads', ['glutes'], 'dumbbell', 'home', 'intermediate', '3', '8-10 each leg', '75s', 'Drive through the top foot, no push from the floor.', 'Bouncing off the back foot.'],

  // ---- hamstrings
  ['deadlift', 'Romanian deadlift', 'hamstrings', ['glutes', 'lower-back'], 'barbell', 'gym', 'intermediate', '4', '6-10', '2 min', 'Hinge the hips back, bar close to the legs.', 'Rounding the lower back to reach the floor.'],
  ['db-rdl', 'Dumbbell Romanian deadlift', 'hamstrings', ['glutes'], 'dumbbell', 'home', 'beginner', '3', '10-12', '75s', 'Soft knees, push the hips back, feel the stretch.', 'Squatting the weight instead of hinging.'],
  ['leg-curl', 'Leg curl', 'hamstrings', [], 'machine', 'gym', 'beginner', '3', '10-15', '60s', 'Curl the heels to the glutes, squeeze, control the return.', 'Letting the weight drop fast.'],
  ['nordic-curl', 'Nordic curl', 'hamstrings', ['glutes'], 'bodyweight', 'home', 'advanced', '3', '4-8', '90s', 'Lower as slowly as you can, hands ready.', 'Breaking at the hips instead of the knees.'],
  ['glute-ham-raise', 'Glute-ham raise', 'hamstrings', ['glutes'], 'machine', 'gym', 'advanced', '3', '6-10', '90s', 'Hips locked, curl the body up.', 'Hinging at the hips to get up.'],

  // ---- calves
  ['standing-calf-raise', 'Standing calf raise', 'calves', [], 'machine', 'gym', 'beginner', '4', '10-15', '45-60s', 'Heels below the toes for a full stretch, pause at the top.', 'Bouncing through the reps.'],
  ['seated-calf-raise', 'Seated calf raise', 'calves', [], 'machine', 'gym', 'beginner', '4', '12-20', '45s', 'Knees bent at 90 degrees targets the soleus; heels drop for a full stretch.', 'Half range at the top only.'],
  ['single-leg-calf-raise', 'Single-leg calf raise', 'calves', [], 'bodyweight', 'home', 'beginner', '3', '12-20 each side', '45s', 'Stand on a step for a full stretch.', 'Rushing: calves need slow reps.'],
  ['jump-rope', 'Jump rope', 'calves', ['quads'], 'bodyweight', 'home', 'intermediate', '4', '60s on', '45s', 'Land soft on the balls of the feet, knees soft, wrists turning the rope.', 'Heavy landings on the heels.'],

  // ---- neck
  ['neck-flexion', 'Neck flexion with light plate', 'neck', [], 'bodyweight', 'home', 'beginner', '3', '10-15', '45s', 'Chin to the chest slowly, light weight only.', 'Loading it heavy: this is a small muscle.'],
  ['neck-extension', 'Neck extension', 'neck', [], 'band', 'home', 'beginner', '3', '10-15', '45s', 'Band on the back of the head, extend slowly.', 'Throwing the head back.'],
  ['neck-side', 'Neck side bend', 'neck', ['upper-back'], 'dumbbell', 'home', 'beginner', '3', '10-12 each side', '45s', 'Ear toward the shoulder, no rotation.', 'Shrugging instead of bending.'],
  ['neck-harness', 'Neck harness flexion', 'neck', [], 'machine', 'gym', 'beginner', '3', '12-15', '45s', 'Light load, chin to chest, slow on the way back.', 'Using a normal weight plate: the neck is small.'],
  ['neck-plate-extension', 'Lying neck extension', 'neck', ['upper-back'], 'machine', 'gym', 'intermediate', '3', '10-12', '45s', 'Face down on a bench, extend against light resistance.', 'Jerking the head up.'],
];

export const EXERCISES = ROWS.map((row) => ({
  id: row[0],
  name: row[1],
  primary: row[2],
  secondary: row[3],
  equipment: row[4],
  place: row[5],
  level: row[6],
  sets: row[7],
  reps: row[8],
  rest: row[9],
  cue: row[10],
  avoid: row[11],
}));

export const EQUIPMENT_LABEL = {
  bodyweight: 'Bodyweight',
  dumbbell: 'Dumbbell',
  barbell: 'Barbell',
  machine: 'Machine',
  cable: 'Cable',
  band: 'Band',
  kettlebell: 'Kettlebell',
};

/** Everything for one muscle, optionally filtered by where you are and how you train. */
export function exercisesFor(muscle, filters = {}) {
  const place = filters.place ?? 'all';
  const level = filters.level ?? 'all';
  const equipment = filters.equipment ?? 'all';
  return EXERCISES.filter(
    (exercise) =>
      exercise.primary === muscle &&
      (place === 'all' || exercise.place === place) &&
      (level === 'all' || exercise.level === level) &&
      (equipment === 'all' || exercise.equipment === equipment),
  );
}

export function exerciseById(id) {
  return EXERCISES.find((exercise) => exercise.id === id);
}

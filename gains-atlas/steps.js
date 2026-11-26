// How to actually do each movement, step by step. One short sentence per step, written the way a
// coach would say it: step 1 gets you into position, the middle describes the movement and the
// breathing, and the last step finishes the rep so nobody stops halfway. Every movement here exists
// in exercises.js, and the tests check that each one has 4 to 6 steps and that none are missing.

export const STEPS = {
  // ---- chest
  'push-up': [
    'Kneel down and put your hands on the floor under your shoulders, slightly wider than your chest.',
    'Step your feet back so your body makes one straight line from head to heels.',
    'Bend your elbows to about 45 degrees and lower your chest to just above the floor.',
    'Push the floor away and straighten your arms to come back to the top.',
  ],
  'incline-push-up': [
    'Put your hands on the floor under your shoulders, then rest both feet on a chair or low step.',
    'Hold your body in one straight line from head to heels, hips level.',
    'Bend your elbows and lower your chest toward the floor, about one hand tall above it.',
    'Press back up until your arms are straight, keeping the line from head to heels.',
  ],
  'bench-press': [
    'Lie on the bench with your eyes under the bar and your feet flat on the floor.',
    'Grip the bar a little wider than your shoulders, then pull your shoulder blades down and back.',
    'Lift the bar off the rack and hold it over your chest with straight arms.',
    'Breathe in and lower the bar to the middle of your chest, elbows tucked to about 45 degrees.',
    'Breathe out and push the bar straight up until your arms are straight, then re-rack it.',
  ],
  'incline-press-dumbbell': [
    'Set the bench to about 30 degrees and sit with a dumbbell resting on each thigh.',
    'Kick the dumbbells up and lie back, holding them at chest height with your feet flat.',
    'Press the dumbbells straight up until your arms are straight and the weights almost touch.',
    'Breathe in and lower them slowly until your elbows are level with your chest.',
    'Press up again, and when the set is done sit up and set each dumbbell down on your knees.',
  ],
  'cable-fly': [
    'Set both pulleys high and grab a handle in each hand, then step forward into a split stance.',
    'Hold your arms out wide with your elbows softly bent and your chest up.',
    'Breathe out and sweep both hands together in front of your chest in a wide hug.',
    'Squeeze your chest for a beat, then let your arms open slowly back to the stretch.',
  ],
  'dumbbell-press-home': [
    'Lie on your back on the floor with a dumbbell in each hand, feet flat on the floor.',
    'Hold the dumbbells over your chest with straight arms and your palms facing your feet.',
    'Breathe in and lower the dumbbells until your upper arms touch the floor.',
    'Breathe out and press them back up over your chest, then lower them to the floor to finish.',
  ],
  'chest-press-machine': [
    'Set the seat so the handles sit level with the middle of your chest, then sit back.',
    'Grip the handles with your feet flat and your shoulder blades pressed into the pad.',
    'Breathe out and push the handles forward until your arms are straight but not locked.',
    'Breathe in and let the handles come back slowly until your hands are level with your chest.',
  ],

  // ---- shoulders
  'pike-push-up': [
    'Start in a push-up position, then walk your feet in until your hips point up in an upside-down V.',
    'Put your hands a little wider than your shoulders and keep your legs straight.',
    'Bend your elbows and lower the crown of your head toward the floor between your hands.',
    'Push the floor away to straighten your arms, then walk your feet back in to finish.',
  ],
  'lateral-raise': [
    'Stand tall with a dumbbell in each hand at your sides, palms facing your thighs.',
    'Keep a small bend in your elbows and your shoulders down away from your ears.',
    'Breathe out and lift both arms out to the sides until they reach shoulder height.',
    'Pause for a beat, then lower the dumbbells slowly back to your sides under control.',
  ],
  'shoulder-press': [
    'Set the bar on a rack at chest height, grip it shoulder-width, and step under it.',
    'Unrack the bar and hold it just above your collarbones with your elbows slightly in front.',
    'Squeeze your glutes and breathe in, then press the bar straight up past your forehead.',
    'Lock your arms overhead with the bar over the middle of your feet.',
    'Lower the bar back to your shoulders under control, then step forward to re-rack it.',
  ],
  'rear-delt-fly': [
    'Hold a dumbbell in each hand and hinge forward at the hips until your chest faces the floor.',
    'Let your arms hang down with the thumbs turned in and a small bend in the elbows.',
    'Keep your back flat, breathe out, and pull your arms out wide to the sides.',
    'Squeeze your shoulder blades at the top, then lower the weights slowly and stand up.',
  ],
  'upright-row-cable': [
    'Stand facing a low cable pulley and grip the straight bar with your hands shoulder-width.',
    'Stand tall with the bar resting against your thighs and your arms straight.',
    'Breathe out and pull the bar up your body, leading with your elbows to your collarbones.',
    'Lower the bar slowly back to your thighs until your arms are straight.',
  ],
  'band-face-pull': [
    'Anchor a band at head height and hold one end in each hand with your arms straight out.',
    'Stand back until the band is tight, with your feet shoulder-width and your knees soft.',
    'Breathe out and pull the band to your forehead, letting your hands travel wide apart.',
    'Squeeze your shoulder blades for a beat, then let the band pull your arms slowly back out.',
  ],

  // ---- biceps
  'db-curl': [
    'Stand tall with a dumbbell in each hand at your sides, palms facing forward.',
    'Pin your elbows against your ribs and keep your back still.',
    'Breathe out and curl both weights up toward your shoulders without swinging.',
    'Squeeze your biceps at the top, then lower the dumbbells slowly until your arms are straight.',
  ],
  'hammer-curl': [
    'Stand tall with a dumbbell in each hand, palms facing in like you are holding two hammers.',
    'Pin your elbows to your ribs and stand up straight with your shoulders back.',
    'Breathe out and curl the weights up to your shoulders, keeping the palms facing in.',
    'Squeeze at the top, then lower the weights slowly until your arms are straight.',
  ],
  'barbell-curl': [
    'Stand with your feet shoulder-width and grip a barbell with your palms facing up, hands shoulder-width.',
    'Let the bar hang at your thighs with your arms straight and your back tall.',
    'Breathe out and curl the bar up toward your chest, keeping your elbows at your sides.',
    'Squeeze, then lower the bar slowly until your arms are straight again.',
  ],
  'incline-curl': [
    'Set a bench to a low incline and sit back with a dumbbell in each hand, palms facing forward.',
    'Let your arms hang straight down behind your body with the backs of your arms on the bench.',
    'Breathe out and curl the weights up, keeping your upper arms in place on the bench.',
    'Lower the dumbbells slowly all the way down until your arms are straight, then sit up.',
  ],
  'preacher-curl': [
    'Sit at the preacher bench with your chest against the pad and your armpits at the top edge.',
    'Grip the handle with your palms up and rest the backs of your upper arms on the pad.',
    'Breathe out and curl the handle up toward your shoulders.',
    'Lower it slowly until your arms are almost straight, then finish the set and sit back.',
  ],
  'band-curl': [
    'Stand on the middle of a band with your feet shoulder-width, holding one end in each hand.',
    'Hold the ends with your palms facing up and your elbows pinned to your ribs.',
    'Breathe out and curl your hands up toward your shoulders, keeping the elbows still.',
    'Lower your hands slowly against the band until your arms are straight.',
  ],
  'chin-up': [
    'Stand under a bar you can reach, grip it with your palms facing you, hands shoulder-width.',
    'Hang with your arms straight and your feet off the floor.',
    'Breathe out and pull your chest up toward the bar by driving your elbows down.',
    'Lower yourself slowly until your arms are straight again, then step down or drop off.',
  ],

  // ---- triceps
  'diamond-push-up': [
    'Come into a push-up position and slide your hands together so your thumbs and index fingers touch.',
    'Hold your body in one straight line from head to heels with your elbows tucked.',
    'Bend your elbows and lower your chest to your hands, keeping elbows close to your ribs.',
    'Push the floor away to straighten your arms and finish on the floor or step your feet in.',
  ],
  'bench-dip': [
    'Sit on the edge of a bench with your hands beside your hips, fingers over the edge.',
    'Slide your hips off the bench with your legs out front and your elbows pointing back.',
    'Bend your elbows to lower your hips toward the floor, keeping them close to the bench.',
    'Press through your palms to straighten your arms, then put your feet down to finish.',
  ],
  'skull-crusher': [
    'Lie on a bench holding a barbell over your chest with a narrow grip, arms straight.',
    'Lean your upper arms slightly back so the bar sits over your forehead.',
    'Bend your elbows to lower the bar toward your forehead, keeping your upper arms still.',
    'Straighten your elbows to push the bar back up, then sit up and re-rack it when done.',
  ],
  'rope-pushdown': [
    'Stand facing a high cable pulley and grab the rope ends with your palms facing in.',
    'Tuck your elbows to your sides and lean forward very slightly with your feet planted.',
    'Breathe out and push the rope down until your arms are straight, splitting the ends apart.',
    'Let your arms come back up slowly until your elbows are bent, keeping them at your sides.',
  ],
  'overhead-extension': [
    'Sit or stand tall holding one dumbbell with both hands overhead, arms straight.',
    'Keep your elbows pointing forward and close to your head.',
    'Breathe in and lower the dumbbell behind your head by bending your elbows.',
    'Breathe out and straighten your arms to push the weight back up overhead.',
  ],
  'close-grip-press': [
    'Lie on the bench and grip the bar with your hands just inside shoulder-width.',
    'Pull your shoulder blades back and hold the bar over your chest.',
    'Breathe in and lower the bar to your lower chest with your elbows tucked close to your sides.',
    'Breathe out and press the bar straight up, then rack it and sit up when the set is done.',
  ],

  // ---- hand-grip
  'dead-hang-hold': [
    'Set a pull-up bar high enough that your feet clear the floor, then stand under it.',
    'Grip the bar with both hands about shoulder-width and wrap your thumbs around it.',
    'Lift your feet and hang with your shoulders pulled down, arms straight.',
    'Hold for the set time, then let go and land softly on the balls of your feet.',
  ],
  'plate-pinch': [
    'Stand tall with a weight plate (or a heavy book) ready at hip height.',
    'Pinch the plate between your thumb and fingers with your arm hanging straight down.',
    'Squeeze hard and hold it still at your side for the set time.',
    'Set the plate down carefully, rest, then repeat with the other hand.',
  ],
  'towel-hang': [
    'Drape a towel over a pull-up bar so both ends hang down evenly.',
    'Grab one end of the towel in each hand and hang with your arms straight.',
    'Lift your feet and hold your body still with your shoulders pulled down.',
    'Hold for the set time, then lower your feet gently to the floor and let go.',
  ],
  'hand-gripper': [
    'Sit or stand tall and hold a hand gripper in one hand with your arm relaxed.',
    'Squeeze your fingers and thumb together to close the gripper fully shut.',
    'Hold the closed position for a second, then open your fingers all the way under control.',
    'Repeat for the set, then swap the gripper to the other hand.',
  ],
  'fat-grip-hold': [
    'Slide thick grips onto a loaded barbell sitting at hip height, or on the floor.',
    'Stand tall with your feet shoulder-width and grip the bar with both hands shoulder-width.',
    'Lift the bar and hold it at hip height with your arms straight and your shoulders back.',
    'Hold for the set time, then lower the bar back down and release.',
  ],
  'finger-curl-bar': [
    'Stand facing a wrist roller with a light weight on the rope and both hands on the handle.',
    'Hold the handle out at chest height with your arms straight and your feet planted.',
    'Roll the handle with your wrists to wind the rope up until the weight reaches the top.',
    'Roll it the other way to lower the weight slowly all the way back down to finish.',
  ],
  'wrist-roller-home': [
    'Roll up a towel and hold one end in each hand in front of your chest.',
    'Stand or sit tall with your elbows slightly bent.',
    'Wring the towel like you are squeezing water out of it, turning both hands hard.',
    'Hold the squeeze, then wring it the other way for the set time.',
  ],

  // ---- forearms
  'wrist-curl': [
    'Sit on a chair and rest your forearms on your thighs with a dumbbell in each hand, palms up.',
    'Let the dumbbells roll toward your fingers while your wrists hang over your knees.',
    'Curl your wrists up toward your forearms and squeeze at the top.',
    'Lower the dumbbells slowly until your wrists are straight again.',
  ],
  'wrist-extension': [
    'Sit on a chair and rest your forearms on your thighs with a dumbbell in each hand, palms down.',
    'Let the weights hang off your knees while your wrists relax down.',
    'Lift the back of your hands up toward your forearms and hold for a beat.',
    'Lower the weights slowly until your wrists are straight again.',
  ],
  'farmer-carry': [
    'Stand with a heavy dumbbell beside each foot and grip both with your arms straight.',
    'Stand tall by pushing through your legs, with the weights at your sides.',
    'Walk forward with short, steady steps while keeping your ribcage down and your grip tight.',
    'Walk the set distance, then set both weights down by bending your knees and hips.',
  ],
  'dead-hang': [
    'Stand under a pull-up bar and grip it with both hands about shoulder-width.',
    'Lift your feet off the floor and hang with your arms straight and shoulders pulled down.',
    'Hold the position for the set time with your body still and your grip tight.',
    'Let go and land softly on the balls of your feet with your knees slightly bent.',
  ],
  'reverse-curl': [
    'Stand with your feet shoulder-width and grip a barbell with your palms facing down.',
    'Let the bar hang at your thighs with your arms straight and your wrists firm.',
    'Breathe out and curl the bar up toward your chest, keeping your elbows at your sides.',
    'Lower the bar slowly until your arms are straight, keeping your wrists locked.',
  ],

  // ---- abs
  'plank': [
    'Kneel on the floor and put your elbows under your shoulders, forearms flat on the floor.',
    'Step your feet back so your body makes one straight line from head to heels.',
    'Squeeze your glutes and brace your belly so your hips do not sag or lift.',
    'Hold for the set time while breathing steadily, then lower your knees to the floor.',
  ],
  'dead-bug': [
    'Lie on your back and hold your arms straight up, knees bent at 90 degrees over your hips.',
    'Press your lower back into the floor so there is no gap.',
    'Slowly lower one arm overhead and the opposite leg out straight, without arching your back.',
    'Bring both back to the start, then swap sides, and finish with your feet on the floor.',
  ],
  'cable-crunch': [
    'Kneel in front of a high cable pulley holding the rope on each side of your head.',
    'Hold the rope by your temples with your hips still and your elbows in.',
    'Breathe out and curl your chest down toward your knees, rounding from the mid-back.',
    'Let the weight pull you back up slowly until your torso is upright again.',
  ],
  'hanging-leg-raise': [
    'Hang from a pull-up bar with your arms straight and your body still.',
    'Brace your belly so your body stops swinging.',
    'Breathe out and lift both legs in front of you toward the bar, keeping them fairly straight.',
    'Curl your pelvis up at the top, then lower your legs slowly back down to a dead hang.',
  ],
  'ab-wheel': [
    'Kneel on the floor with an ab wheel in front of you and grip the handles on each side.',
    'Start with the wheel under your shoulders and your hips over your knees.',
    'Breathe out and roll the wheel forward slowly, keeping your ribs pulled down.',
    'Stop before your back arches, then pull the wheel back toward your knees to finish.',
  ],
  'sit-up': [
    'Lie on your back with your knees bent and your feet flat on the floor, hands across your chest.',
    'Tuck your chin slightly and brace your belly.',
    'Curl your spine up off the floor one section at a time until you sit upright.',
    'Lower yourself back down slowly, curling your spine onto the floor, until you are flat.',
  ],

  // ---- lower abs
  'reverse-crunch': [
    'Lie on your back with your arms at your sides and your knees bent over your hips.',
    'Press your lower back into the floor.',
    'Breathe out and lift your hips off the floor to curl your knees toward your chest.',
    'Lower your hips slowly back to the floor until you are flat again.',
  ],
  'lying-leg-raise': [
    'Lie on your back with your legs straight and your hands flat under your hips.',
    'Press your lower back into the floor.',
    'Breathe out and lift both legs together until they point straight up.',
    'Lower your legs slowly toward the floor, stopping before your back arches, then lie flat.',
  ],
  'hollow-hold': [
    'Lie on your back with your arms overhead and your legs straight.',
    'Press your lower back flat and lift your shoulders and legs a few inches off the floor.',
    'Hold that shape with your arms by your ears for the set time, breathing steadily.',
    'Lower your arms, legs and head slowly back to the floor to finish.',
  ],
  'v-up': [
    'Lie on your back with your legs straight and your arms reaching overhead.',
    'Brace your belly and press your lower back into the floor.',
    'Breathe out and lift your legs and torso at once, reaching your hands toward your toes.',
    'Lower your hands and feet slowly back to the floor, staying in control all the way.',
  ],
  'mountain-climber': [
    'Start in a push-up position with your hands under your shoulders and arms straight.',
    'Keep your hips low and level and your belly braced.',
    'Drive one knee up toward your chest, then swap legs, like running on the spot.',
    'Keep going for the set time, then bring both feet back and stand up.',
  ],
  'hanging-knee-raise': [
    'Hang from a pull-up bar with your arms straight and your body still.',
    'Brace your belly so you do not swing.',
    'Breathe out and lift both knees up toward your chest, curling your pelvis at the top.',
    'Lower your knees slowly back down to a dead hang.',
  ],
  'cable-reverse-crunch': [
    'Sit in front of a low cable pulley with your arms behind you holding the handle.',
    'Lie back with your knees bent and the weight taut, holding the handle by your sides.',
    'Breathe out and curl your hips up toward your chest, keeping your arms still.',
    'Lower your hips slowly back to the floor until you are lying flat again.',
  ],

  // ---- obliques
  'side-plank': [
    'Lie on one side with your elbow under your shoulder and your forearm flat on the floor.',
    'Stack your feet on top of each other and bend your knees slightly or keep them straight.',
    'Lift your hips so your body makes one straight line from head to feet.',
    'Hold for the set time, then lower your hips gently and swap sides.',
  ],
  'russian-twist': [
    'Sit on the floor with your knees bent and lean back a little, holding a dumbbell at your chest.',
    'Lift your feet slightly or keep your heels on the floor for support.',
    'Breathe out and twist your ribcage to one side, following with your eyes.',
    'Twist back to the other side to count each rep, then set the weight down.',
  ],
  'wood-chop': [
    'Stand side-on to a high cable pulley and grip the handle with both hands.',
    'Pull the handle up and across one shoulder with your arms fairly straight.',
    'Breathe out and pull the handle down and across your body to the opposite hip.',
    'Let the cable pull your arms slowly back up, then swap sides after the set.',
  ],
  'suitcase-carry': [
    'Stand next to a heavy dumbbell and lift it with one hand, like a suitcase.',
    'Stand tall with your shoulders level and your ribcage down.',
    'Walk forward with short, steady steps, staying upright instead of leaning.',
    'Walk the set distance, then set the weight down by bending your knees, and swap hands.',
  ],
  'pallof-press': [
    'Anchor a band at chest height beside you and stand side-on, holding it with both hands.',
    'Hold your hands at the middle of your chest with the band tight.',
    'Breathe out and press your hands straight out in front of you, resisting the pull.',
    'Hold for a beat, then bring your hands back to your chest, and swap sides.',
  ],

  // ---- upper back
  'seated-row': [
    'Sit at the rowing machine with your feet on the platform and knees slightly bent.',
    'Grip the handle with both hands and sit tall with your chest up.',
    'Breathe out and pull the handle to your bellybutton, squeezing your shoulder blades.',
    'Let the handle go back out slowly until your arms are straight, then stand up when done.',
  ],
  'barbell-row': [
    'Stand with your feet hip-width and grip a barbell with your palms facing down.',
    'Hinge forward at your hips until your torso is at about 45 degrees, back flat.',
    'Breathe out and pull the bar up to your lower ribs, leading with your elbows.',
    'Lower the bar slowly until your arms are straight, then stand tall to finish.',
  ],
  'db-row': [
    'Put one knee and one hand on a bench with your back flat and your other foot on the floor.',
    'Hold a dumbbell in your free hand and let it hang straight down.',
    'Breathe out and pull the dumbbell up to your hip, driving your elbow past your ribs.',
    'Lower the dumbbell slowly to the floor, then swap sides.',
  ],
  'face-pull-cable': [
    'Set a cable pulley to face height and hold the rope with your palms facing in.',
    'Step back so your arms are straight out and stand tall.',
    'Breathe out and pull the rope to your forehead, keeping your elbows high.',
    'Squeeze your shoulder blades, then let your arms go slowly back out to the start.',
  ],
  'inverted-row': [
    'Set a bar in a rack at waist height and lie under it, gripping it shoulder-width.',
    'Hang under the bar with your body straight and your heels on the floor.',
    'Breathe out and pull your chest up to the bar, keeping your hips in line.',
    'Lower yourself slowly until your arms are straight, then step your feet under you.',
  ],
  'shrug': [
    'Stand tall holding a barbell in front of your thighs with your arms straight.',
    'Keep your arms straight and your shoulders relaxed down.',
    'Breathe out and shrug your shoulders straight up toward your ears.',
    'Pause at the top, then lower your shoulders slowly back down.',
  ],

  // ---- rotator cuff
  'band-external-rotation': [
    'Anchor a band at elbow height and stand side-on, holding the end in the hand furthest away.',
    'Tuck your elbow to your ribs at 90 degrees with your forearm across your belly.',
    'Breathe out and rotate your forearm outward, keeping your elbow pinned to your side.',
    'Bring your forearm slowly back across your belly, then swap sides.',
  ],
  'band-internal-rotation': [
    'Anchor a band at elbow height and stand side-on, holding the end in the hand nearest it.',
    'Tuck your elbow to your ribs at 90 degrees with your forearm pointing out to the side.',
    'Breathe out and pull your forearm in across your belly, keeping your elbow pinned.',
    'Let your forearm go slowly back out to the side, then swap sides.',
  ],
  'side-lying-external-rotation': [
    'Lie on your side with your bottom arm tucked to your ribs and a light dumbbell in that hand.',
    'Bend that elbow to 90 degrees so your forearm points forward across your belly.',
    'Keep your body still and rotate your forearm up toward the ceiling.',
    'Lower the dumbbell slowly back down, then roll over and swap sides.',
  ],
  'face-pull-rotator': [
    'Set a cable pulley to face height and hold the rope with your palms facing in.',
    'Step back until your arms are straight and stand tall.',
    'Breathe out and pull the rope to your forehead with your elbows high.',
    'Without moving your elbows, rotate your hands up and back, then lower and reset.',
  ],
  'prone-y-raise': [
    'Lie face down on the floor with your arms stretched out overhead in a Y shape.',
    'Turn your thumbs up to the ceiling and rest your forehead lightly on the floor.',
    'Breathe out and lift both hands off the floor toward your ears, arms straight.',
    'Lower your hands slowly back to the floor and turn your head to one side to rest.',
  ],
  'scarecrow': [
    'Stand or sit tall holding a light dumbbell in each hand.',
    'Raise your upper arms out to the sides until they are level with your shoulders, elbows bent 90 degrees.',
    'Breathe out and rotate your forearms up toward the ceiling, keeping the upper arms still.',
    'Lower your forearms slowly back down, then relax your arms to your sides.',
  ],
  'cable-external-rotation': [
    'Set a cable pulley to elbow height and stand side-on holding the handle across your body.',
    'Tuck your elbow to your ribs at 90 degrees with your forearm across your belly.',
    'Breathe out and rotate your forearm outward, keeping your elbow pinned to your side.',
    'Let your forearm slowly come back across your belly, then swap sides.',
  ],

  // ---- lats
  'pull-up': [
    'Stand under a pull-up bar and grip it with your palms facing away, hands wider than your shoulders.',
    'Hang with your arms straight and your feet off the floor.',
    'Breathe out and pull your elbows down to your ribs until your chin clears the bar.',
    'Lower yourself slowly until your arms are straight again, then drop off.',
  ],
  'lat-pulldown': [
    'Sit at the machine and set the knee pad snug over your thighs.',
    'Grip the bar a little wider than your shoulders with your chest up.',
    'Breathe out and pull the bar down to your collarbones, leading with your elbows.',
    'Let the bar rise slowly until your arms are straight overhead, then stand up when done.',
  ],
  'band-pulldown': [
    'Anchor a band high above you, like over a door or a pull-up bar.',
    'Kneel or stand facing it and hold one end in each hand with your arms overhead.',
    'Breathe out and pull your elbows down to your ribs, squeezing your shoulder blades.',
    'Let your arms go slowly back overhead, then step out of the band.',
  ],
  'straight-arm-pulldown': [
    'Stand facing a high cable pulley and grip the bar with your arms straight out.',
    'Step back until the cable is tight and lean forward slightly at your hips.',
    'Breathe out and sweep your straight arms down until the bar reaches your thighs.',
    'Let the bar rise slowly back up until your arms are level with your shoulders.',
  ],
  'db-pullover': [
    'Lie on a bench or the floor holding one dumbbell over your chest with both hands.',
    'Hold it with your elbows softly bent and your arms pointing up.',
    'Breathe in and lower the dumbbell back over your head until you feel a stretch in your lats.',
    'Breathe out and pull it back up over your chest, then set the weight down to finish.',
  ],

  // ---- lower back
  'back-extension': [
    'Set the back-extension bench so the pad sits at your hips and your feet are secured.',
    'Fold your arms across your chest and start with your body in a straight line.',
    'Breathe in and hinge forward at your hips until your torso points toward the floor.',
    'Breathe out and lift your torso back up until your body makes a straight line, not past it.',
  ],
  'superman': [
    'Lie face down on the floor with your arms stretched out in front of you.',
    'Keep your neck relaxed and your eyes toward the floor.',
    'Breathe out and lift your arms, chest and legs off the floor, squeezing your glutes.',
    'Hold for the set time, then lower everything slowly back to the floor.',
  ],
  'good-morning': [
    'Set a barbell across your shoulders like a squat, holding it with both hands.',
    'Stand with your feet hip-width and a small bend in your knees.',
    'Breathe in and push your hips back, hinging forward until your torso is near parallel to the floor.',
    'Keep the bar over your feet, then drive your hips forward to stand tall and re-rack.',
  ],
  'bird-dog': [
    'Kneel on all fours with your hands under your shoulders and knees under your hips.',
    'Keep your back flat and your neck in line with your spine.',
    'Breathe out and reach one arm forward and the opposite leg back until both are level.',
    'Hold for a beat, then lower both slowly and swap sides, finishing on all fours.',
  ],

  // ---- abductors
  'clamshell': [
    'Lie on your side with a band just above your knees and your knees bent at 90 degrees.',
    'Stack your hips and shoulders and rest your head on your lower arm.',
    'Keep your feet together and breathe out as you lift your top knee open.',
    'Hold for a beat, then lower your knee slowly back down, then swap sides.',
  ],
  'lateral-band-walk': [
    'Put a band around your legs just above the knees and stand with your feet hip-width.',
    'Bend your knees into a quarter squat and keep your toes pointing forward.',
    'Breathe out and step sideways with one foot, keeping tension on the band.',
    'Bring the other foot to follow, keep stepping one way, then walk back the other way.',
  ],
  'side-lying-raise': [
    'Lie on your side with your legs straight and stacked, resting your head on your arm.',
    'Keep your top toe pointing down toward the floor and your body in line.',
    'Breathe out and lift your top leg up to about hip height.',
    'Lower the leg slowly back down, then roll over and swap sides.',
  ],
  'abductor-machine': [
    'Sit on the machine with your back against the pad and your knees on the outside of the pads.',
    'Hold the handles and set the weight you can control.',
    'Breathe out and push your knees apart as far as you can comfortably go.',
    'Hold for a beat, then let the pads come slowly back together.',
  ],
  'cable-hip-abduction': [
    'Fasten an ankle cuff to a low pulley and strap it around the leg furthest from the machine.',
    'Stand tall holding the frame for balance with your working leg straight.',
    'Breathe out and lift your working leg out to the side, keeping your torso still.',
    'Lower the leg slowly back to the start, then turn around and swap sides.',
  ],
  'single-leg-hip-hinge': [
    'Hold a kettlebell in both hands in front of your chest and stand on one leg.',
    'Lift your other leg slightly off the floor behind you.',
    'Breathe in and hinge forward at the hip, letting the free leg reach back as a counterweight.',
    'Keep your hips square, then squeeze your glutes to stand tall and swap legs.',
  ],
  'lateral-step-up': [
    'Stand beside a step or bench with a dumbbell in each hand, near foot on the step.',
    'Plant your whole near foot on the step with your chest up.',
    'Breathe out and push through your near leg to stand up onto the step.',
    'Step down slowly to the floor and repeat on the same side, then swap legs.',
  ],

  // ---- glutes
  'hip-thrust': [
    'Sit on the floor with your upper back against a bench and a padded barbell across your hips.',
    'Plant your feet flat, shoulder-width, with your knees bent and shins vertical.',
    'Breathe out and drive through your heels to lift your hips until your body is level.',
    'Squeeze your glutes at the top, then lower your hips slowly and re-rack the bar when done.',
  ],
  'glute-bridge': [
    'Lie on your back with your knees bent and your heels close to your hips, flat on the floor.',
    'Rest your arms at your sides and press your lower back into the floor.',
    'Breathe out and push through your heels to lift your hips into a straight line.',
    'Squeeze your glutes, then lower your hips slowly back to the floor.',
  ],
  'bulgarian-split-squat': [
    'Stand about two feet in front of a bench and put the top of one foot on it behind you.',
    'Hold a dumbbell in each hand and stand tall with your front foot planted.',
    'Breathe in and lower your back knee toward the floor, keeping your front shin near vertical.',
    'Breathe out and push through your front foot to stand tall, then swap legs.',
  ],
  'cable-kickback': [
    'Fasten an ankle cuff to a low pulley and strap it around one leg.',
    'Stand facing the machine and hold the frame, leaning slightly forward with a flat back.',
    'Breathe out and kick your working leg straight back behind you.',
    'Squeeze your glute, then bring the leg slowly forward to the start and swap sides.',
  ],
  'band-walk': [
    'Put a band around your legs above the knees and stand with your feet hip-width.',
    'Bend your knees into a half squat and keep your chest up.',
    'Breathe out and step sideways, keeping your stance wide so the band stays tight.',
    'Step the set distance one way, then walk back the other way, staying low.',
  ],

  // ---- adductors
  'copenhagen-plank': [
    'Lie on your side and put the inside of your top foot or ankle on a bench.',
    'Rest on your bottom forearm and stack your hips and shoulders.',
    'Breathe out and lift your hips so your body is in a straight line, bottom leg hovering.',
    'Hold for the set time, then lower your hips, and swap sides.',
  ],
  'adductor-machine': [
    'Sit on the machine with the pads between your knees and your back against the pad.',
    'Set the weight light and let your knees spread out wide.',
    'Breathe out and squeeze the pads together slowly with your inner thighs.',
    'Let your knees spread slowly back apart, keeping control the whole way.',
  ],
  'cable-adduction': [
    'Fasten an ankle cuff to a low pulley and strap it around the leg nearest the machine.',
    'Stand tall holding the frame and step the working leg out to the side.',
    'Breathe out and pull the working leg in across the front of your standing leg.',
    'Let the leg move slowly back out to the side, then swap sides.',
  ],
  'sumo-squat': [
    'Stand with your feet wider than your shoulders and your toes turned out.',
    'Hold one dumbbell with both hands in front of your chest.',
    'Breathe in and sit down between your knees, keeping your chest up and knees over toes.',
    'Breathe out and push through your feet to stand tall, then lower the weight to finish.',
  ],
  'side-lunge': [
    'Stand tall with your feet together and your arms in front of your chest.',
    'Take a wide step out to one side with that foot flat.',
    'Breathe out and sit back into that hip, bending the near knee while the other leg stays straight.',
    'Push through the bent leg to return to standing, then repeat on the other side.',
  ],
  'cossack-squat': [
    'Stand with your feet much wider than your shoulders and toes pointed slightly out.',
    'Shift your weight onto one foot and let the other leg straighten with the toes up.',
    'Breathe in and sit down over the bent leg, keeping its knee pointing over the toes.',
    'Breathe out and push through the bent leg to stand, then shift to the other side.',
  ],
  'band-adduction': [
    'Put a band around one ankle and anchor it low to the side of you.',
    'Stand tall on the other leg with your arms in front for balance.',
    'Breathe out and pull the working leg in across the front of your standing leg.',
    'Let the band pull your leg slowly back out to the side, then swap legs.',
  ],

  // ---- quads
  'squat': [
    'Set a barbell on your upper back, grip it with both hands, and stand with feet shoulder-width.',
    'Keep your chest up and your feet turned slightly out.',
    'Breathe in and sit down between your hips, bending your knees over your toes.',
    'Breathe out and push through your feet to stand tall, then re-rack the bar.',
  ],
  'goblet-squat': [
    'Hold a kettlebell or dumbbell at your chest with both hands and stand feet shoulder-width.',
    'Point your toes slightly out and keep your chest tall.',
    'Breathe in and sit down between your knees, keeping your heels on the floor.',
    'Breathe out and push through your feet to stand tall with the weight still at your chest.',
  ],
  'leg-press': [
    'Sit on the leg press with your back and hips flat against the pad and feet on the platform.',
    'Set your feet shoulder-width on the platform and release the safeties.',
    'Breathe in and bend your knees to lower the platform until your thighs reach 90 degrees.',
    'Breathe out and push the platform back up without locking your knees, then re-set the safeties.',
  ],
  'lunge': [
    'Stand tall with your feet hip-width and your hands on your hips.',
    'Take a long step forward and plant your front foot flat.',
    'Breathe in and lower your back knee toward the floor until it nearly touches.',
    'Breathe out and push through your front foot to stand, bringing your back foot forward to repeat.',
  ],
  'leg-extension': [
    'Sit on the leg-extension machine with your back against the pad and your shins behind the roller.',
    'Hold the handles and set the roller just above your feet.',
    'Breathe out and straighten your knees until your legs are level, pausing at the top.',
    'Lower the weight slowly until your knees are bent, then release the roller when done.',
  ],
  'step-up': [
    'Stand in front of a step or bench holding a dumbbell in each hand.',
    'Plant your whole working foot on the step.',
    'Breathe out and push through that foot to stand up onto the step, keeping your chest up.',
    'Step back down slowly with the same foot leading, then repeat or swap legs.',
  ],

  // ---- hamstrings
  'deadlift': [
    'Stand with your feet hip-width and grip a barbell from the floor with your palms facing you.',
    'Stand tall with the bar at your thighs and a small bend in your knees.',
    'Breathe in and push your hips back, sliding the bar down your legs with a flat back.',
    'Stop at a stretch in the back of your thighs, then drive your hips forward to stand tall.',
  ],
  'db-rdl': [
    'Stand with a dumbbell in each hand in front of your thighs and your feet hip-width.',
    'Keep a soft bend in your knees and your shoulders back.',
    'Breathe in and push your hips back, lowering the weights down the front of your legs.',
    'Feel the stretch in your hamstrings, then squeeze your glutes to stand tall.',
  ],
  'leg-curl': [
    'Lie face down on the leg-curl machine with your knees just past the pad and heels under the roller.',
    'Hold the handles and keep your hips pressed into the pad.',
    'Breathe out and curl your heels up toward your glutes as far as they go.',
    'Squeeze, then lower the weight slowly until your legs are almost straight.',
  ],
  'nordic-curl': [
    'Kneel on a pad with your ankles held down, like under a heavy bar or by a partner.',
    'Stand tall from your knees with your hips straight.',
    'Breathe in and lower your body forward slowly, keeping your hips and knees in line.',
    'Catch yourself with your hands if needed, then push back up to the start.',
  ],
  'glute-ham-raise': [
    'Set the machine so your knees sit behind the pad and your feet are locked in.',
    'Start with your torso upright and your hips pushed into the pad.',
    'Breathe in and lower your torso forward slowly, keeping your hips locked.',
    'Breathe out and pull yourself back up with your hamstrings until upright.',
  ],

  // ---- tibialis
  'tibialis-raise': [
    'Stand with your back against a wall and your feet a step in front of you.',
    'Keep your legs straight and your heels on the floor.',
    'Breathe out and pull your toes up toward your shins as high as they go.',
    'Hold for a beat, then lower your toes slowly back to the floor.',
  ],
  'wall-toe-raise': [
    'Sit on a chair with your heels on a raised step and your toes hanging off.',
    'Rest a light plate or weight across the front of your feet.',
    'Breathe out and lift your toes up toward your shins.',
    'Lower your toes slowly back down to the floor, then remove the weight.',
  ],
  'toe-walk': [
    'Stand tall and lift your toes off the floor so you are on your heels.',
    'Keep your toes pulled up and your knees straight.',
    'Walk forward on your heels with short, steady steps.',
    'Walk the set time, then stop and lower your toes to the floor.',
  ],
  'band-dorsiflexion': [
    'Sit on the floor with one leg out straight and a band hooked around your forefoot.',
    'Anchor the other end of the band in front of you, like around a table leg.',
    'Breathe out and pull your toes up toward your shin against the band.',
    'Let the band pull your toes slowly back down, then swap legs.',
  ],
  'tib-bar-raise': [
    'Stand with the tib bar resting on the tops of your feet, weight plates on each end.',
    'Stand tall with your heels on the floor.',
    'Breathe out and lift the front of your feet up toward your shins.',
    'Lower your toes slowly all the way down to a full stretch, then set the bar down.',
  ],
  'single-leg-balance-toe': [
    'Stand on one foot with your heel on a step and your toes hanging off the edge.',
    'Hold a wall or rail for balance.',
    'Breathe out and lift your toes up toward your shin on that foot.',
    'Lower your toes slowly, then repeat on the same foot or swap legs.',
  ],
  'sled-drag-heel': [
    'Attach a light sled to a harness or straps and hook it behind you.',
    'Walk forward on your heels with your toes lifted and your torso tall.',
    'Take steady steps so your shins stay loaded with every stride.',
    'Walk the set distance or time, then turn around and drag it back.',
  ],

  // ---- calves
  'standing-calf-raise': [
    'Stand on the calf-raise platform with the balls of your feet on the edge and your shoulders under the pads.',
    'Stand tall with your knees straight and your heels hanging low.',
    'Breathe out and push through the balls of your feet to rise as high as you can.',
    'Pause at the top, then lower your heels slowly for a full stretch, then step off.',
  ],
  'seated-calf-raise': [
    'Sit on the seated calf machine with the pads on your thighs and the balls of your feet on the platform.',
    'Set your knees bent at 90 degrees and your heels hanging off.',
    'Breathe out and push through the balls of your feet to raise your heels as high as possible.',
    'Pause, then lower your heels slowly for a full stretch, then release the pads.',
  ],
  'single-leg-calf-raise': [
    'Stand with the ball of one foot on a step and your heel hanging off the edge.',
    'Hold a wall or rail for balance and lift your other foot behind you.',
    'Breathe out and push through the ball of your foot to rise as high as you can.',
    'Pause at the top, then lower your heel slowly for a stretch, then swap legs.',
  ],
  'jump-rope': [
    'Hold a jump rope with the handles at your hips and step on the middle of the rope to check the length.',
    'Stand tall with your elbows near your ribs and your knees soft.',
    'Turn the rope with your wrists and jump just high enough to clear it.',
    'Land soft on the balls of your feet each time, and keep going for the set time.',
  ],

  // ---- knees
  'wall-sit': [
    'Stand with your back flat against a wall and your feet about two feet out.',
    'Slide down the wall until your thighs are level with the floor and your shins are vertical.',
    'Hold the position with your weight in your heels for the set time.',
    'Slide back up the wall to stand tall when the time is up.',
  ],
  'terminal-knee-extension': [
    'Put a band around a low anchor and loop it behind one knee, then step back so it is tight.',
    'Stand tall with that knee slightly bent and your foot flat.',
    'Breathe out and straighten the knee against the band by squeezing your quad.',
    'Bend the knee slowly back to start, then swap legs after the set.',
  ],
  'spanish-squat': [
    'Anchor a strong band low in front of you and loop it behind your knees.',
    'Stand with your feet shoulder-width and hold the band ends to keep tension.',
    'Breathe in and sit back into a squat while leaning back against the band.',
    'Breathe out and drive up to standing, keeping the band tight the whole way.',
  ],
  'step-down': [
    'Stand on a step or bench with your whole foot on the edge.',
    'Lift one heel off the step and hold your hands in front for balance.',
    'Breathe in and bend the standing knee to lower the free heel toward the floor.',
    'Lightly tap the floor, then push back up through the standing leg, and swap legs.',
  ],
  'leg-extension-partial': [
    'Sit on the leg-extension machine with your shins behind the roller, set to a light weight.',
    'Start with your knees bent only a little.',
    'Breathe out and straighten your knees, squeezing your quads at the top.',
    'Lower to the half-bent start slowly, then release the roller when done.',
  ],
  'sissy-squat': [
    'Face a wall or squat rack and hold on lightly for support.',
    'Rise onto the balls of your feet with your hips under your shoulders.',
    'Breathe in and lean back slowly, bending your knees while your hips stay forward.',
    'Push through the balls of your feet to rise back up, then lower your heels to finish.',
  ],
  'copenhagen-knee': [
    'Stand on one leg on a low step with your hands on your hips.',
    'Keep the standing knee soft and pointing over your toes.',
    'Breathe out and tap the free foot lightly on the floor in front of you.',
    'Push back up to standing on the step, then repeat or swap legs.',
  ],

  // ---- ankles
  'pogo-hop': [
    'Stand tall with your feet hip-width and your arms relaxed.',
    'Keep your knees almost straight and brace your ankles.',
    'Bounce up off the balls of your feet with quick, small hops.',
    'Land softly on the balls of your feet each time for the set reps.',
  ],
  'ankle-hop-in': [
    'Stand tall with your feet hip-width and your arms relaxed.',
    'Make small hops off the balls of your feet, pointing your toes in the air.',
    'Land softly and come to a still balance on your toes for a beat.',
    'Rock back onto your heels to feel the ankle load, then repeat for the set.',
  ],
  'ankle-circle-load': [
    'Sit on the floor with one leg out and a band hooked around your forefoot.',
    'Hold the band tight with one end in each hand, keeping your heel still.',
    'Draw slow circles with your toes, from the ankle only, for the set reps one way.',
    'Reverse the circles the other way, then swap feet.',
  ],
  'calf-stretch-strength': [
    'Stand tall and walk a few slow steps on your heels with your toes lifted.',
    'Then stand with the balls of your feet on the floor and your feet hip-width.',
    'Breathe out and rise slowly onto your toes into a calf raise.',
    'Lower your heels slowly back down, then repeat the set, alternating heel walks and raises.',
  ],
  'single-leg-balance-pad': [
    'Stand on one leg on a soft pad or folded towel.',
    'Keep your ankle still by pressing your toes down and gripping with them.',
    'Hold your balance for the set time, keeping the ankle upright.',
    'Step off the pad, then swap legs.',
  ],
  'depth-drop-land': [
    'Stand on a low box with your toes near the edge.',
    'Step off the box so you drop straight down.',
    'Land on the balls of both feet with soft knees, letting your ankles absorb the landing.',
    'Stick the landing and stand still for a beat before the next rep.',
  ],
  'sled-ankle-push': [
    'Set up a light sled in front of you with a harness or straps.',
    'Stand tall on the balls of your feet, leaning forward slightly.',
    'Drive the sled forward with short, steady pushes from your ankles and calves.',
    'Push for the set time, then stop and lower your heels to finish.',
  ],

  // ---- neck
  'neck-flexion': [
    'Lie on your back on a bench or bed with your head over the end.',
    'Place a very light plate on your forehead or hold it gently with both hands.',
    'Breathe out and slowly nod your chin toward your chest.',
    'Lift your head slowly back to level, then remove the weight when done.',
  ],
  'neck-extension': [
    'Sit on a chair with a band looped around the back of your head.',
    'Anchor the other end of the band in front of you so it pulls your head forward.',
    'Breathe out and push your head slowly back against the band.',
    'Let the band bring your head forward again slowly, then step out of it.',
  ],
  'neck-side': [
    'Sit or stand tall with a light dumbbell, or just your hand, against one side of your head.',
    'Keep your shoulders down and your face pointing forward.',
    'Breathe out and tilt your ear slowly toward your shoulder against the resistance.',
    'Raise your head slowly back to upright, then swap sides.',
  ],
  'neck-harness': [
    'Put on the neck harness with a light weight hanging from the chain.',
    'Stand tall and lean forward slightly with your hands on your thighs.',
    'Breathe out and curl your chin slowly toward your chest.',
    'Lower your head slowly back to a neutral position, then take the harness off.',
  ],
  'neck-plate-extension': [
    'Lie face down on a bench with your head over the end and a light plate held to the back of your head.',
    'Keep your shoulders relaxed and your neck in line with your body.',
    'Breathe out and lift your head slowly upward against the weight.',
    'Lower your head slowly back down to level, then remove the plate.',
  ],
};

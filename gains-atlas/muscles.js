// The muscles a lifter actually trains, grouped the way people talk about them.
// Tap a group on the body map and you get its exercises.



export const MUSCLES = [
  { id: 'chest', name: 'Chest', latin: 'Pectoralis major', view: 'front', blurb: 'Pushes the arm forward and across the body.' },
  { id: 'shoulders', name: 'Shoulders', latin: 'Deltoid', view: 'front', blurb: 'Raises the arm: front, side and rear heads.' },
  { id: 'biceps', name: 'Biceps', latin: 'Biceps brachii', view: 'front', blurb: 'Bends the elbow and turns the palm up.' },
  { id: 'forearms', name: 'Forearms', latin: 'Flexors & extensors', view: 'front', blurb: 'Grip strength and the wrist.' },
  { id: 'abs', name: 'Abs', latin: 'Rectus abdominis', view: 'front', blurb: 'Curls the spine and braces the trunk.' },
  { id: 'obliques', name: 'Obliques', latin: 'External obliques', view: 'front', blurb: 'Twists and side-bends the trunk.' },
  { id: 'lower-abs', name: 'Lower abs', latin: 'Rectus abdominis (lower)', view: 'front', blurb: 'Lifts the pelvis: the bottom of the six-pack.' },
  { id: 'quads', name: 'Quads', latin: 'Quadriceps femoris', view: 'front', blurb: 'Front of the thigh: straightens the knee.' },
  { id: 'calves', name: 'Calves', latin: 'Gastrocnemius & soleus', view: 'back', blurb: 'Pushes the heel down to point the foot.' },
  { id: 'upper-back', name: 'Upper back', latin: 'Trapezius & rhomboids', view: 'back', blurb: 'Pulls the shoulder blades back and down.' },
  { id: 'lats', name: 'Lats', latin: 'Latissimus dorsi', view: 'back', blurb: 'Pulls the arms down and in: the V shape.' },
  { id: 'lower-back', name: 'Lower back', latin: 'Erector spinae', view: 'back', blurb: 'Holds the spine upright against a load.' },
  { id: 'triceps', name: 'Triceps', latin: 'Triceps brachii', view: 'back', blurb: 'Straightens the elbow: two thirds of the arm.' },
  { id: 'glutes', name: 'Glutes', latin: 'Gluteus maximus', view: 'back', blurb: 'Extends the hip: the biggest muscle you have.' },
  { id: 'hamstrings', name: 'Hamstrings', latin: 'Biceps femoris & co.', view: 'back', blurb: 'Back of the thigh: bends the knee and drives the hip.' },
  { id: 'neck', name: 'Neck', latin: 'Sternocleidomastoid', view: 'back', blurb: 'Turns and tilts the head.' },
];

export const BY_MUSCLE = Object.fromEntries(MUSCLES.map((muscle) => [muscle.id, muscle]));

export function isMuscleId(value) {
  return Boolean(BY_MUSCLE[value]);
}

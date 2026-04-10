import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qfkqtwifozsaegpijyaq.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const USER_ID = process.env.USER_ID

if (!SUPABASE_KEY || !USER_ID) {
  console.error('Required: SUPABASE_SERVICE_KEY and USER_ID env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const workoutSchedule = {
  schedule: {
    monday: 'lift_lower',
    tuesday: 'skillmill_hill_climber',
    wednesday: 'lift_upper',
    thursday: 'skillmill_mixed',
    friday: 'lift_complex',
    saturday: 'flex',
    sunday: 'flex',
  },
  workouts: {
    lift_lower: {
      label: 'MONDAY — Lower Body + Hinge + Rotation + Chest + Abs',
      duration_min: 57,
      day_type: 'lift',
      warmup: 'Single-leg calf raises on step 3x15 each side → Hip circles → Leg swings forward and lateral → World\'s greatest stretch x5 each side → Glute bridges x10',
      exercises: [
        { name: 'KB Deadlift → Clean → Press', sets: 4, reps: '6 each side', rest: '90 sec', weight: '20kg' },
        { name: 'KB Swing (two-hand)', sets: 4, reps: 15, rest: '60 sec', weight: '32kg' },
        { name: 'KB Around the World (kneeling)', sets: 3, reps: '10 each direction', rest: '60 sec', weight: '18kg' },
        { name: 'KB Bulgarian Split Squat', sets: 4, reps: '8 each side', rest: '75 sec', weight: '8kg building' },
        { name: 'Double Push-up → KB Deadlift', sets: 3, reps: 10, rest: '60 sec', weight: '36kg' },
        { name: 'Farmers Carry', sets: 3, reps: '40m', rest: '45 sec', weight: 'As heavy as possible' },
        { name: 'Weighted Cable Crunch', sets: 3, reps: 15, rest: '45 sec', weight: 'Light — progressive' },
      ],
    },
    lift_upper: {
      label: 'WEDNESDAY — Upper Body + Pulling + Shoulders + Arms + Abs',
      duration_min: 58,
      day_type: 'lift',
      warmup: 'Thoracic rotations x10 → Arm circles forward and back → Band pull-aparts x15 → Cat-cow x10 → Shoulder CARs x5 each side',
      exercises: [
        { name: 'KB Turkish Get-Up', sets: 3, reps: '3 each side', rest: '90 sec', weight: '18kg' },
        { name: 'Pull-ups', sets: 4, reps: 'Max reps', rest: '75 sec', weight: 'Bodyweight' },
        { name: 'Cable Chest Fly', sets: 3, reps: 12, rest: '60 sec', weight: 'Light — feel the stretch' },
        { name: 'Landmine Rotational Press', sets: 4, reps: '10 each side', rest: '60 sec', weight: '35 lbs added to bar' },
        { name: 'KB Gorilla Row', sets: 3, reps: '10 each side', rest: '60 sec', weight: 'TBD' },
        { name: 'KB Curl to Press', sets: 3, reps: '10 each side', rest: '45 sec', weight: 'TBD' },
        { name: 'Single-arm KB Waiter\'s Carry', sets: 2, reps: '40m each', rest: '45 sec', weight: 'TBD' },
        { name: 'Ab Wheel Rollout', sets: 3, reps: 10, rest: '45 sec', weight: 'Bodyweight from knees' },
      ],
    },
    lift_complex: {
      label: 'FRIDAY — KB Complex + Deep Core',
      duration_min: 57,
      day_type: 'lift',
      warmup: 'Jump rope or Skillmill 3 min easy → Hip flexor stretch 60 sec each side → Shoulder rolls',
      complex_note: 'One KB at 20kg. No rest between movements within a round. 90 sec rest between rounds. Round benchmark: 2:17–2:20.',
      complex_rounds: 6,
      exercises: [
        { name: 'KB Swing', reps: 10, notes: 'Hip hinge power' },
        { name: 'KB Snatch', reps: '5 each side', notes: 'Punch overhead, loose grip at top' },
        { name: 'Goblet Squat', reps: 10, notes: 'Full depth' },
        { name: 'Alternating Reverse Lunge', reps: 10, notes: '5 each leg' },
        { name: 'Two Hand Row', reps: 10, notes: 'Hinge forward, row to hip' },
        { name: 'KB Close Grip Push-up', reps: 10, notes: 'Hands on KB handle' },
      ],
      finisher: {
        name: 'Deep Core Finisher — 3 Rounds (45 sec rest between)',
        exercises: [
          { name: 'Hollow Body Hold', reps: '30–45 sec', notes: 'Lower back flat, arms overhead, legs low' },
          { name: 'Dead Bug', reps: '8 each side', notes: '3 sec lowering, back never arches' },
          { name: 'Hanging Leg Raises', reps: '8–10', notes: 'Full hang, no swinging' },
        ],
      },
    },
    skillmill_hill_climber: {
      label: 'TUESDAY — Skillmill Hill Climber 55',
      duration_min: 60,
      day_type: 'skillmill',
      protocol: 'Level 2 steady base throughout. Ramp to Level 8 for 2 minutes at every 5-minute mark: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55. 11 total climbs, 22 minutes at Level 8.',
      benchmarks: { avg_hr_bpm: 152, max_hr_bpm: 185, calories: 825, distance_km: 6.60, date: 'April 7' },
    },
    skillmill_mixed: {
      label: 'THURSDAY — Skillmill Mixed Protocol',
      duration_min: 37,
      day_type: 'skillmill',
      protocol: 'Warm-up 3 min Level 1 → Steady Grind 4 min Level 4–5 → Hill Climb 1 min Level 8 → Recover 2 min Level 1–2. Repeat x3. Final Push 3 min Level 5–6 → Cool down 3 min Level 1.',
    },
  },
  macro_targets: {
    lift:       { calories: 2100, protein: 195, fat: 62, carbs: 192, label: 'Lift day' },
    skillmill:  { calories: 2200, protein: 192, fat: 67, carbs: 220, label: 'Skillmill day' },
    flex_active:{ calories: 2275, protein: 192, fat: 67, carbs: 250, label: 'Active flex day' },
    rest:       { calories: 1950, protein: 192, fat: 70, carbs: 135, label: 'Rest day' },
  },
  rules: [
    '185g protein minimum every day — non-negotiable',
    'Pre-workout carbs on all lift days — banana or rice cakes 30–45 min before',
    'Post-workout protein — 40–50g within 60 min after each lift',
  ],
  supplements: [
    'Creatine: 10g daily with water',
    'Ascent Protein: post-workout or evening',
    'Magnesium Glycinate: before bed',
    'Collagen Peptides: 10–15g morning with vitamin C',
  ],
}

async function run() {
  const { error } = await supabase
    .from('profiles')
    .update({ workout_schedule: workoutSchedule })
    .eq('id', USER_ID)

  if (error) {
    console.error('❌ Failed:', error.message)
  } else {
    console.log('✅ Workout program saved to profile')
  }
}

run()

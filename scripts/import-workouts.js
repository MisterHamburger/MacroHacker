import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://cgbfwcunemglpmnfrkkq.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY // use service key for import

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Your user ID — fill this in after checking Supabase auth.users
const USER_ID = process.env.USER_ID

const workouts = [
  {
    "date": "2026-03-14",
    "type": "lifting",
    "session_name": "InBody Scan Day — Lifting",
    "notes": "Baseline InBody scan: 172.9 lbs, 11.4% BF, 88.0 lbs skeletal muscle",
    "exercises": []
  },
  {
    "date": "2026-03-15",
    "type": "skillmill",
    "session_name": "Skillmill Session",
    "skillmill": { "duration_min": 30, "distance_km": 4.81, "avg_hr_bpm": 152, "resistance_base": 2, "notes": "First recorded Skillmill session" },
    "exercises": []
  },
  {
    "date": "2026-03-19",
    "type": "skillmill",
    "session_name": "Skillmill Session",
    "skillmill": { "duration_min": 30, "distance_km": 4.06, "avg_hr_bpm": 158, "active_calories": 421, "resistance_base": 2, "notes": "First full session with complete recording" },
    "exercises": []
  },
  {
    "date": "2026-03-22",
    "type": "tennis",
    "session_name": "Tennis",
    "cardio": { "duration_min": 127, "avg_hr_bpm": 134, "max_hr_bpm": 178, "active_calories": 968, "total_calories": 1149 },
    "exercises": []
  },
  {
    "date": "2026-03-24",
    "type": "skillmill",
    "session_name": "Skillmill Session",
    "skillmill": { "duration_min": 33, "avg_hr_bpm": 115, "active_calories": 240, "resistance_base": 2, "notes": "Modified intervals — 20 sec sprint every 5 min." },
    "exercises": []
  },
  {
    "date": "2026-03-26",
    "type": "skillmill",
    "session_name": "Skillmill Mixed Protocol",
    "skillmill": { "duration_min": 41, "distance_km": 3.25, "avg_hr_bpm": 152, "max_hr_bpm": 173, "resistance_base": 1, "notes": "Mixed protocol. Garmin programmed workout used." },
    "exercises": []
  },
  {
    "date": "2026-03-28",
    "type": "running",
    "session_name": "Neighborhood Run",
    "cardio": { "duration_min": 45, "avg_hr_bpm": 148, "max_hr_bpm": 164, "best_pace_per_mi": "8:13", "elevation_gain_ft": 266 },
    "exercises": []
  },
  {
    "date": "2026-03-29",
    "type": "lifting",
    "session_name": "Wednesday — Upper Body + Rotation",
    "exercises": [
      { "name": "KB Turkish Get-Up", "sets": 3, "reps": 3, "notes": "Each side" },
      { "name": "Push-up to Renegade Row", "sets": 4, "reps": 8, "notes": "Each side" },
      { "name": "KB Halo Seated with Quad Touch", "sets": 3, "reps": 10, "notes": "Each direction" },
      { "name": "Landmine Rotational Press", "sets": 4, "reps": 10, "notes": "Each side" },
      { "name": "Side to Side Push-up", "sets": 3, "reps": 8, "notes": "Each side" },
      { "name": "KB Curl to Press", "sets": 3, "reps": 10, "notes": "Each side" },
      { "name": "Single-arm KB Waiter's Carry", "sets": 2, "distance_m": 40, "notes": "Each side" }
    ]
  },
  {
    "date": "2026-03-31",
    "type": "skillmill",
    "session_name": "Skillmill — Norwegian 4x4",
    "skillmill": { "duration_min": 54, "distance_km": 5.93, "avg_hr_bpm": 153, "max_hr_bpm": 183, "active_calories": 625, "total_calories": 700, "protocol": "Norwegian 4x4 — 4 min hard effort, 3 min recovery x4", "notes": "Best full session. First complete Norwegian 4x4." },
    "exercises": []
  },
  {
    "date": "2026-04-02",
    "type": "lifting",
    "session_name": "Friday — KB Complex + Core Finisher",
    "exercises": [
      { "name": "KB Swing", "sets": 5, "reps": 10, "weight_kg": 20 },
      { "name": "KB Swing Clean", "sets": 5, "reps": 10, "weight_kg": 20 },
      { "name": "Goblet Squat", "sets": 5, "reps": 10, "weight_kg": 20 },
      { "name": "Alternating Reverse Lunge", "sets": 5, "reps": 10, "weight_kg": 20, "notes": "5 each leg" },
      { "name": "Two Hand Row", "sets": 5, "reps": 10, "weight_kg": 20 },
      { "name": "KB Close Grip Push-up", "sets": 5, "reps": 10, "weight_kg": 20, "notes": "Round time ~2:17-2:20" },
      { "name": "Hollow Body Hold", "sets": 3, "duration_sec": 45 },
      { "name": "Dead Bug", "sets": 3, "reps": 8, "notes": "Each side" },
      { "name": "Hanging Leg Raises", "sets": 3, "reps": 10 }
    ]
  },
  {
    "date": "2026-04-05",
    "type": "skillmill",
    "session_name": "Skillmill — Flex Day",
    "skillmill": { "duration_min": 60, "distance_km": 6.93, "avg_hr_bpm": 150, "max_hr_bpm": 181, "active_calories": 698, "total_calories": 782, "notes": "Sunday flex day. Longest distance session to date." },
    "exercises": []
  },
  {
    "date": "2026-04-06",
    "type": "lifting",
    "session_name": "Monday — Lower Body + Hinge + Rotation + Chest",
    "exercises": [
      { "name": "KB Deadlift → Clean → Press", "sets": 4, "reps": 6, "weight_kg": 20, "notes": "Each side" },
      { "name": "KB Swing (two-hand)", "sets": 4, "reps": 15, "weight_kg": 32 },
      { "name": "KB Around the World (kneeling)", "sets": 3, "reps": 10, "weight_kg": 18, "notes": "Each direction" },
      { "name": "KB Bulgarian Split Squat", "sets": 4, "reps": 8, "weight_kg": 8, "notes": "Each side. Rear foot on bench." },
      { "name": "Double Push-up → KB Deadlift", "sets": 3, "reps": 10, "weight_kg": 36 },
      { "name": "Farmers Carry", "sets": 3, "distance_m": 40 }
    ]
  },
  {
    "date": "2026-04-07",
    "type": "skillmill",
    "session_name": "Skillmill — Hill Climber 55",
    "skillmill": {
      "duration_min": 60, "distance_km": 6.60, "avg_hr_bpm": 152, "max_hr_bpm": 185,
      "active_calories": 737, "total_calories": 825, "best_pace_per_mi": "5:33",
      "protocol": "Hill Climber 55 — Level 2 base, Level 8 for 2 min at every 5-min mark. 11 climbs.",
      "resistance_base": 2, "resistance_climbs": 8, "total_climbs": 11
    },
    "exercises": []
  },
  {
    "date": "2026-04-08",
    "type": "lifting",
    "session_name": "Wednesday — Upper Body + Pulling + Shoulders + Arms",
    "notes": "InBody scan: 168.8 lbs, 8.6% BF, 88.2 lbs muscle, InBody Score 93",
    "exercises": [
      { "name": "KB Turkish Get-Up", "sets": 3, "reps": 3, "weight_kg": 18, "notes": "Each side" },
      { "name": "Pull-ups", "sets": 4, "notes": "Max reps bodyweight" },
      { "name": "Cable Chest Fly", "sets": 3, "reps": 12 },
      { "name": "Landmine Rotational Press", "sets": 4, "reps": 10, "notes": "35 lbs added. Each side." },
      { "name": "KB Gorilla Row", "sets": 3, "reps": 10, "notes": "Each side" },
      { "name": "KB Curl to Press", "sets": 3, "reps": 10, "notes": "Each side" },
      { "name": "Single-arm KB Waiter's Carry", "sets": 2, "distance_m": 40, "notes": "Each side" },
      { "name": "Ab Wheel Rollout", "sets": 3, "reps": 10, "notes": "From knees" }
    ]
  },
  {
    "date": "2026-04-09",
    "type": "skillmill",
    "session_name": "Skillmill — Hill Climber 55",
    "skillmill": {
      "duration_min": 60, "distance_km": 7.13, "distance_mi": 4.43,
      "avg_hr_bpm": 151, "max_hr_bpm": 199, "active_calories": 714, "total_calories": 798,
      "best_pace_per_mi": "5:10",
      "protocol": "Hill Climber 55 — Level 2 base, Level 8 for 2 min every 5 min. 11 climbs.",
      "resistance_base": 2, "resistance_climbs": 8, "total_climbs": 11,
      "notes": "New distance record 7.13 km. New max HR 199 bpm. New best pace 5:10/mi."
    },
    "exercises": []
  }
]

async function run() {
  if (!USER_ID) {
    console.error('Set USER_ID env var — find it in Supabase → Authentication → Users')
    process.exit(1)
  }

  console.log(`Importing ${workouts.length} workouts for user ${USER_ID}...`)

  for (const w of workouts) {
    const { error } = await supabase.from('workout_logs').upsert({
      user_id: USER_ID,
      date: w.date,
      raw_input: w.session_name,
      exercises: {
        type: w.type,
        session_name: w.session_name,
        notes: w.notes || null,
        skillmill: w.skillmill || null,
        cardio: w.cardio || null,
        exercises: w.exercises
      }
    }, { onConflict: 'user_id,date' })

    if (error) {
      console.error(`❌ ${w.date} — ${error.message}`)
    } else {
      console.log(`✅ ${w.date} — ${w.session_name}`)
    }
  }

  console.log('Done.')
}

run()

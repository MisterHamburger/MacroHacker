const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5'

function todayStr() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
}

function getTodayDayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
}

function formatWorkoutSection(schedule) {
  if (!schedule) return null

  const dayName = getTodayDayName()
  const workoutKey = schedule.schedule?.[dayName]
  const todayWorkoutPlan = workoutKey ? schedule.workouts?.[workoutKey] : null
  const mt = schedule.macro_targets || {}

  // Format today's scheduled workout in full
  let todaySection = ''
  if (todayWorkoutPlan) {
    const w = todayWorkoutPlan
    const target = mt[w.day_type] || mt.lift
    todaySection = `SCHEDULED TODAY (${dayName.toUpperCase()}): ${w.label}
Duration: ~${w.duration_min} min | Macro target: ${target.calories} cal / ${target.protein}g P / ${target.fat}g F / ${target.carbs}g C
Warm-up: ${w.warmup || 'N/A'}
`
    if (w.exercises?.length) {
      if (w.complex_note) {
        todaySection += `\nKB COMPLEX — ${w.complex_rounds} rounds at 20kg. ${w.complex_note}\n`
        todaySection += w.exercises.map(e => `  ${e.name}: ${e.reps} — ${e.notes || ''}`).join('\n')
        if (w.finisher) {
          todaySection += `\n\nFINISHER — ${w.finisher.name}:\n`
          todaySection += w.finisher.exercises.map(e => `  ${e.name}: ${e.reps} — ${e.notes || ''}`).join('\n')
        }
      } else {
        todaySection += '\nExercise | Sets | Reps | Rest | Weight\n'
        todaySection += w.exercises.map(e =>
          `  ${e.name} | ${e.sets || '-'} | ${e.reps} | ${e.rest || '-'} | ${e.weight || '-'}`
        ).join('\n')
      }
    } else if (w.protocol) {
      todaySection += `\nProtocol: ${w.protocol}`
      if (w.benchmarks) {
        const b = w.benchmarks
        todaySection += `\nBenchmarks: ${b.avg_hr_bpm} bpm avg, ${b.max_hr_bpm} bpm max, ${b.calories} cal, ${b.distance_km} km (${b.date})`
      }
    }
  } else {
    todaySection = `SCHEDULED TODAY (${dayName.toUpperCase()}): Flex day — tennis, run, or rest`
  }

  // Weekly overview (brief)
  const weekOverview = Object.entries(schedule.schedule || {}).map(([day, key]) => {
    const w = schedule.workouts?.[key]
    const t = w ? mt[w.day_type] : mt.rest
    const name = w ? w.label.split('—')[1]?.trim() || w.label : 'Flex'
    return `${day.toUpperCase()}: ${name} → ${t?.calories || 1950} cal`
  }).join('\n')

  // Per-day macro targets
  const macroSummary = Object.values(mt).map(t => `- ${t.label}: ${t.calories} cal / ${t.protein}g P / ${t.fat}g F / ${t.carbs}g C`).join('\n')

  return `${todaySection}

WEEKLY PROGRAM OVERVIEW:
${weekOverview}

MACRO TARGETS BY DAY TYPE:
${macroSummary}
Non-negotiable: 185g protein minimum daily
Pre-workout carbs on lift days (banana or rice cakes 30–45 min before)
Post-workout protein: 40–50g within 60 min after each lift

SUPPLEMENTS: ${(schedule.supplements || []).join(' | ')}

FULL PROGRAM — when asked for any day's workout, show the full table:
${Object.values(schedule.workouts || {}).map(w => {
  if (w.exercises?.length && !w.complex_note) {
    return `\n${w.label}:\n` + w.exercises.map(e =>
      `  ${e.name} | ${e.sets || '-'}x${e.reps} | rest ${e.rest || '-'} | ${e.weight || '-'}`
    ).join('\n')
  } else if (w.exercises?.length && w.complex_note) {
    return `\n${w.label} — ${w.complex_rounds} rounds at 20kg:\n` +
      w.exercises.map(e => `  ${e.name}: ${e.reps}`).join('\n') +
      (w.finisher ? `\n  Finisher: ${w.finisher.exercises.map(e => `${e.name} ${e.reps}`).join(', ')}` : '')
  } else {
    return `\n${w.label}:\n  ${w.protocol}`
  }
}).join('\n')}`
}

function buildSystemPrompt({ profile, totals, entries, recentWorkouts, todayWorkout }) {
  const heightFt = profile.height_inches ? `${Math.floor(profile.height_inches / 12)}'${profile.height_inches % 12}"` : 'unknown'
  const recentWorkoutList = recentWorkouts?.slice(0, 5).map(w => {
    const d = w.exercises
    return `- ${w.date}: ${d?.session_name || 'workout'} (${d?.type || 'unknown'})`
  }).join('\n') || 'No recent workouts logged'

  const foodList = entries?.slice(-5).map(e =>
    `- ${e.raw_input || 'food entry'}: ${e.total_calories} cal, ${e.total_protein}g pro, ${e.total_fat}g fat, ${e.total_carbs}g carbs`
  ).join('\n') || 'Nothing logged yet'

  // Get today's scheduled macro target if program exists
  const sched = profile.workout_schedule
  const dayName = getTodayDayName()
  const workoutKey = sched?.schedule?.[dayName]
  const todayPlan = workoutKey ? sched?.workouts?.[workoutKey] : null
  const dayType = todayPlan?.day_type || 'lift'
  const scheduledTargets = sched?.macro_targets?.[dayType] || null
  const calTarget = scheduledTargets?.calories || profile.daily_calories
  const proTarget = scheduledTargets?.protein || profile.daily_protein
  const fatTarget = scheduledTargets?.fat || profile.daily_fat
  const carbTarget = scheduledTargets?.carbs || profile.daily_carbs

  const workoutSection = sched ? formatWorkoutSection(sched) : null

  return `You are the Macro Hacker coach — a precise, no-bullshit fitness and nutrition AI. You know this user's complete context. Be direct, data-forward, and conversational. No fluff.

TODAY: ${todayStr()}

USER PROFILE:
- Name: ${profile.name || 'User'}
- Stats: ${profile.age}yo ${profile.sex}, ${heightFt}, ${profile.weight_lbs} lbs
- Goal: ${profile.goal || 'recomp'}

TODAY'S TARGETS (${dayType} day): ${calTarget} cal / ${proTarget}g protein / ${fatTarget}g fat / ${carbTarget}g carbs

TODAY'S NUTRITION:
- Calories: ${totals.calories} / ${calTarget} (${calTarget - totals.calories} remaining)
- Protein: ${totals.protein}g / ${proTarget}g
- Fat: ${totals.fat}g / ${fatTarget}g
- Carbs: ${totals.carbs}g / ${carbTarget}g
Foods logged today:
${foodList}

TODAY'S WORKOUT: ${todayWorkout ? `${todayWorkout.raw_input} (${todayWorkout.exercises?.type || 'workout'})` : 'None logged yet'}

RECENT WORKOUTS:
${recentWorkoutList}
${workoutSection ? `\n${workoutSection}` : ''}
HOW TO RESPOND:
- When asked for today's workout or any day's workout — show the full exercise table exactly as programmed.
- When the user describes food they ate, parse it, log it, reply with what you logged + updated totals. Keep it tight.
- When the user sends a FOOD PHOTO: identify every visible food item, estimate portions, return macros, log it.
- When the user sends a NUTRITION LABEL PHOTO: read serving size + macros per serving, calculate how many servings fit remaining calories/protein. Tell them exactly: "X servings = Y cal, Zg protein."
- When the user logs a workout, record it.
- When asked what to eat, suggest 3-4 real foods that fit remaining macros.
- Lead with numbers. Be precise. No filler.

ACTIONS — when logging food or workouts, append an action block at the end of your response:

For food: <action>{"type":"log_food","raw":"user's original text","items":[{"name":"...","quantity":1,"unit":"...","calories":0,"protein":0,"fat":0,"carbs":0}],"totals":{"calories":0,"protein":0,"fat":0,"carbs":0}}</action>

For workout: <action>{"type":"log_workout","session_name":"...","workout_type":"lifting|skillmill|running|tennis|other","exercises":[{"name":"...","sets":0,"reps":0,"weight_kg":null}],"calorie_adjustment":0}</action>

For target update: <action>{"type":"update_targets","daily_calories":0,"daily_protein":0,"daily_fat":0,"daily_carbs":0}</action>

Only include action blocks when actually logging something. Never include them in conversational replies.`
}

function buildWelcomeSystemPrompt({ profile }) {
  const heightFt = profile.height_inches
    ? `${Math.floor(profile.height_inches / 12)}'${profile.height_inches % 12}"`
    : 'unknown'
  const weightKg = profile.weight_lbs * 0.453592
  const heightCm = profile.height_inches * 2.54
  const bmr = profile.sex === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161
  const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }
  const tdee = Math.round(bmr * (multipliers[profile.activity_level] || 1.55))
  const protein = Math.round(profile.weight_lbs)

  const cutCal = tdee - 500
  const recompCal = tdee
  const bulkCal = tdee + 300

  return `You are the Macro Hacker coach. ${profile.name} just finished setup. This is your first message to them.

USER STATS:
- Name: ${profile.name}
- ${profile.age}yo ${profile.sex}, ${heightFt}, ${profile.weight_lbs} lbs
- Activity: ${profile.activity_level}
- Maintenance calories (TDEE): ~${tdee} cal/day

YOUR JOB:
1. One-line welcome (use their name, be direct)
2. Ask what their goal is — use plain language: lose fat, build muscle, stay lean/recomp

When they tell you their goal, respond with their exact daily targets and fire the action.

TARGET FORMULAS:
- Fat loss: ${cutCal} cal / ${protein}g protein / ${Math.round((cutCal * 0.25) / 9)}g fat / ${Math.round((cutCal - protein * 4 - Math.round((cutCal * 0.25) / 9) * 9) / 4)}g carbs → goal: "cut"
- Maintain/recomp: ${recompCal} cal / ${protein}g protein / ${Math.round((recompCal * 0.30) / 9)}g fat / ${Math.round((recompCal - protein * 4 - Math.round((recompCal * 0.30) / 9) * 9) / 4)}g carbs → goal: "recomp"
- Muscle gain: ${bulkCal} cal / ${protein}g protein / ${Math.round((bulkCal * 0.25) / 9)}g fat / ${Math.round((bulkCal - protein * 4 - Math.round((bulkCal * 0.25) / 9) * 9) / 4)}g carbs → goal: "bulk"

After they describe their goal, confirm the numbers in one line then end with:
<action>{"type":"update_targets","goal":"cut|recomp|bulk","daily_calories":0,"daily_protein":0,"daily_fat":0,"daily_carbs":0}</action>

Keep everything short. No filler. Max 3-4 sentences per reply.`
}

export async function sendWelcomeMessage({ messages, profile }) {
  const system = buildWelcomeSystemPrompt({ profile })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Welcome error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

export async function generateDailyOpening({ profile, totals, entries, recentWorkouts, todayWorkout }) {
  const system = buildSystemPrompt({ profile, totals, entries, recentWorkouts, todayWorkout })
  const trigger = `Good morning. Give me my daily briefing — today's date, what workout you'd expect based on my recent pattern, today's calorie target, and a one-line prompt to get started. Keep it under 4 lines. No fluff.`

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 256,
      system,
      messages: [{ role: 'user', content: trigger }],
    }),
  })
  if (!res.ok) throw new Error(`Opening error: ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

export function parseActions(text) {
  const actions = []
  const actionRegex = /<action>([\s\S]*?)<\/action>/g
  let match
  while ((match = actionRegex.exec(text)) !== null) {
    try {
      actions.push(JSON.parse(match[1]))
    } catch (e) {
      console.warn('Failed to parse action:', match[1])
    }
  }
  // Strip complete action tags, then strip any incomplete/truncated <action>... at the end
  const cleanText = text
    .replace(/<action>[\s\S]*?<\/action>/g, '')
    .replace(/<action>[\s\S]*$/g, '')
    .trim()
  return { cleanText, actions }
}

export async function sendMessage({ messages, profile, totals, entries, recentWorkouts, todayWorkout }) {
  const system = buildSystemPrompt({ profile, totals, entries, recentWorkouts, todayWorkout })

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: (() => {
        // Map to Anthropic format
        const mapped = messages.map(m => {
          if (m.imageData) {
            return {
              role: m.role,
              content: [
                { type: 'image', source: { type: 'base64', media_type: m.imageData.mimeType, data: m.imageData.base64 } },
                { type: 'text', text: m.content || '' }
              ]
            }
          }
          return { role: m.role, content: m.content || '' }
        })
        // Drop leading assistant messages (daily opening)
        let start = 0
        while (start < mapped.length && mapped[start].role === 'assistant') start++
        const trimmed = mapped.slice(start)
        // Merge consecutive same-role messages (happens when API errors left user msgs without replies)
        const merged = []
        for (const msg of trimmed) {
          const prev = merged[merged.length - 1]
          if (prev && prev.role === msg.role && typeof prev.content === 'string' && typeof msg.content === 'string') {
            prev.content = prev.content + '\n' + msg.content
          } else {
            merged.push({ ...msg })
          }
        }
        return merged
      })(),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Coach error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

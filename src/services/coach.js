const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-5'

function todayStr() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
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

  return `You are the Macro Hacker coach — a precise, no-bullshit fitness and nutrition AI. You know this user's complete context. Be direct, data-forward, and conversational. No fluff.

TODAY: ${todayStr()}

USER PROFILE:
- Name: ${profile.name || 'User'}
- Stats: ${profile.age}yo ${profile.sex}, ${heightFt}, ${profile.weight_lbs} lbs
- Goal: ${profile.goal}
- Base daily targets: ${profile.daily_calories} cal / ${profile.daily_protein}g protein / ${profile.daily_fat}g fat / ${profile.daily_carbs}g carbs

TODAY'S NUTRITION:
- Calories: ${totals.calories} / ${profile.daily_calories} (${profile.daily_calories - totals.calories} remaining)
- Protein: ${totals.protein}g / ${profile.daily_protein}g
- Fat: ${totals.fat}g / ${profile.daily_fat}g
- Carbs: ${totals.carbs}g / ${profile.daily_carbs}g
Foods logged today:
${foodList}

TODAY'S WORKOUT: ${todayWorkout ? `${todayWorkout.raw_input} (${todayWorkout.exercises?.type || 'workout'})` : 'None logged yet'}

RECENT WORKOUTS:
${recentWorkoutList}

HOW TO RESPOND:
- When the user describes food they ate, parse it, log it, and reply with what you logged + updated totals. Keep it tight.
- When the user sends a FOOD PHOTO: identify every visible food item, estimate portions, return macros, log it.
- When the user sends a NUTRITION LABEL PHOTO: read serving size + macros per serving, then calculate how many servings fit their remaining calories/protein. Tell them exactly: "X servings = Y cal, Zg protein."
- When the user logs a workout, record it. If it's cardio-heavy (Skillmill, running, tennis), bump today's calorie target by the appropriate amount.
- When asked what to eat, suggest 3-4 real foods that fit remaining macros.
- For training questions — workout design, exercise swaps, program changes — engage fully. You know their history and goals.
- Lead with numbers. Be precise. No filler.

ACTIONS — when logging food or workouts, append an action block at the end of your response:

For food: <action>{"type":"log_food","raw":"user's original text","items":[{"name":"...","quantity":1,"unit":"...","calories":0,"protein":0,"fat":0,"carbs":0}],"totals":{"calories":0,"protein":0,"fat":0,"carbs":0}}</action>

For workout: <action>{"type":"log_workout","session_name":"...","workout_type":"lifting|skillmill|running|tennis|other","exercises":[{"name":"...","sets":0,"reps":0,"weight_kg":null}],"calorie_adjustment":0}</action>

For target update: <action>{"type":"update_targets","daily_calories":0,"daily_protein":0,"daily_fat":0,"daily_carbs":0}</action>

Only include action blocks when actually logging something. Never include them in conversational replies.`
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
  const cleanText = text.replace(/<action>[\s\S]*?<\/action>/g, '').trim()
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
      max_tokens: 1024,
      system,
      messages: messages.map(m => {
        if (m.imageData) {
          return {
            role: m.role,
            content: [
              { type: 'image', source: { type: 'base64', media_type: m.imageData.mimeType, data: m.imageData.base64 } },
              { type: 'text', text: m.content }
            ]
          }
        }
        return { role: m.role, content: m.content }
      }),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Coach error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

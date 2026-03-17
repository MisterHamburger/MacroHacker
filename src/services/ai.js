const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(messages, system) {
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
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

function parseJSON(text) {
  // Strip markdown fences if present
  const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

export async function parseFoodText(userInput) {
  const system = 'You are a nutrition expert. Parse food descriptions and return accurate macro estimates. Return ONLY valid JSON — no explanation, no markdown, no backticks.'
  const prompt = `Parse this food and return a JSON array: "${userInput}"

Format: [{"name":"scrambled eggs","quantity":3,"unit":"large","calories":210,"protein":18,"fat":14,"carbs":2}]`

  const text = await callClaude([{ role: 'user', content: prompt }], system)
  return parseJSON(text)
}

export async function parseFoodPhoto(base64Image, mimeType = 'image/jpeg') {
  const system = 'You are a nutrition expert. Identify food from images and estimate macros. Return ONLY valid JSON — no explanation, no markdown, no backticks.'
  const prompt = `Look at this image and identify all visible food items. Estimate portions as accurately as you can. Return ONLY a JSON array with this format — no explanation, no markdown:
[{"name":"...","quantity":1,"unit":"...","calories":0,"protein":0,"fat":0,"carbs":0}]`

  const text = await callClaude(
    [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image,
            },
          },
          { type: 'text', text: prompt },
        ],
      },
    ],
    system
  )
  return parseJSON(text)
}

export async function getEatSuggestions(remaining) {
  const system = 'You are a nutrition expert. Suggest practical foods that fit macro targets. Return ONLY valid JSON — no explanation, no markdown, no backticks.'
  const prompt = `A person tracking macros has these remaining for today:
Calories: ${remaining.calories}
Protein: ${remaining.protein}g
Fat: ${remaining.fat}g
Carbs: ${remaining.carbs}g

Suggest 3-4 practical food options (real foods, simple combos — not full recipes) that fit within these remaining macros.

Return ONLY valid JSON:
[{"food":"cottage cheese + apple","calories":220,"protein":28,"fat":2,"carbs":22}]`

  const text = await callClaude([{ role: 'user', content: prompt }], system)
  return parseJSON(text)
}

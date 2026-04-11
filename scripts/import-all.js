import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qfkqtwifozsaegpijyaq.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY
const USER_ID = process.env.USER_ID

if (!SUPABASE_KEY || !USER_ID) {
  console.error('Required: SUPABASE_SERVICE_KEY and USER_ID env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── NUTRITION DATA ──────────────────────────────────────────────────────────

const nutritionDays = [
  { date: "2026-03-02", notes: "Taco salad with 80/20 beef, avocado, queso", totals: { calories: 2195, protein: 181, fat: 98, carbs: 145 }, items: [{ name: "taco salad with 80/20 beef, avocado, queso", calories: 2195, protein: 181, fat: 98, carbs: 145 }] },
  { date: "2026-03-03", notes: "Rice + fruit salad", totals: { calories: 1950, protein: 208, fat: 37, carbs: 199 }, items: [{ name: "daily total — rice + fruit salad", calories: 1950, protein: 208, fat: 37, carbs: 199 }] },
  { date: "2026-03-04", notes: "Joyland biscuit + meatballs + gyro", totals: { calories: 2255, protein: 190, fat: 73, carbs: 187 }, items: [
    { name: "egg whites + egg", calories: 165, protein: 26, fat: 5, carbs: 0 },
    { name: "Joyland egg & cheese biscuit (bacon, no sour cream)", calories: 520, protein: 25, fat: 26, carbs: 40 },
    { name: "meatballs + gyro (estimated)", calories: 1570, protein: 139, fat: 42, carbs: 147 },
  ]},
  { date: "2026-03-05", notes: "First clean sweep. 2 Del Rio beers still hit targets", totals: { calories: 2035, protein: 182, fat: 44, carbs: 172 }, items: [{ name: "clean sweep day with 2 Del Rio beers", calories: 2035, protein: 182, fat: 44, carbs: 172 }] },
  { date: "2026-03-07", notes: "Pizza night, Frico wine. Cals literally perfect", totals: { calories: 2050, protein: 194, fat: 56, carbs: 151 }, items: [{ name: "pizza + wine night", calories: 2050, protein: 194, fat: 56, carbs: 151 }] },
  { date: "2026-03-08", notes: "Pancakes for breakfast, still hit all macros", totals: { calories: 2090, protein: 224, fat: 50, carbs: 171 }, items: [{ name: "pancakes breakfast, hit all macros", calories: 2090, protein: 224, fat: 50, carbs: 171 }] },
  { date: "2026-03-09", notes: "Garlic butter chicken, smashed potatoes", totals: { calories: 2135, protein: 240, fat: 64, carbs: 145 }, items: [{ name: "garlic butter chicken + smashed potatoes", calories: 2135, protein: 240, fat: 64, carbs: 145 }] },
  { date: "2026-03-10", notes: "Ribeye hosting dinner. Steaks came out rare", totals: { calories: 2300, protein: 224, fat: 79, carbs: 138 }, items: [{ name: "ribeye dinner for 5", calories: 2300, protein: 224, fat: 79, carbs: 138 }] },
  { date: "2026-03-11", notes: "Leftover ribeye + potstickers", totals: { calories: 1972, protein: 176, fat: 71, carbs: 151 }, items: [{ name: "leftover ribeye + potstickers", calories: 1972, protein: 176, fat: 71, carbs: 151 }] },
  { date: "2026-03-12", notes: "75 min basketball. Ice cream and still under budget", totals: { calories: 2050, protein: 213, fat: 50, carbs: 175 }, items: [{ name: "basketball day with ice cream, still under budget", calories: 2050, protein: 213, fat: 50, carbs: 175 }] },
  { date: "2026-03-13", notes: "Carne asada bowl. No shake", totals: { calories: 1910, protein: 170, fat: 57, carbs: 180 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "carne asada bowl with rice", calories: 1220, protein: 115, fat: 38, carbs: 115 },
    { name: "365 vanilla ice cream 2/3 cup", calories: 230, protein: 4, fat: 11, carbs: 28 },
  ]},
  { date: "2026-03-14", notes: "InBody scan day. Overnight oats front-loaded carbs", totals: { calories: 2210, protein: 185, fat: 55, carbs: 230 }, items: [{ name: "overnight oats caused carb overage on InBody scan/lift day", calories: 2210, protein: 185, fat: 55, carbs: 230 }] },
  { date: "2026-03-15", notes: "Strip steak fajitas. Ice cream", totals: { calories: 1875, protein: 180, fat: 71, carbs: 129 }, items: [{ name: "strip steak fajitas + ice cream", calories: 1875, protein: 180, fat: 71, carbs: 129 }] },
  { date: "2026-03-16", notes: "Lasagna dinner. Banana stacked carbs", totals: { calories: 2210, protein: 185, fat: 53, carbs: 230 }, items: [{ name: "lasagna from mother-in-law + banana", calories: 2210, protein: 185, fat: 53, carbs: 230 }] },
  { date: "2026-03-17", notes: "Chili night. Clean sweep", totals: { calories: 2235, protein: 195, fat: 57, carbs: 225 }, items: [{ name: "chili night — clean sweep", calories: 2235, protein: 195, fat: 57, carbs: 225 }] },
  { date: "2026-03-18", notes: "Smoked salmon toast lunch — no rice, went under", totals: { calories: 1840, protein: 190, fat: 48, carbs: 147 }, items: [{ name: "salmon toast lunch, under on calories", calories: 1840, protein: 190, fat: 48, carbs: 147 }] },
  { date: "2026-03-19", notes: "Pork chop dinner. Clean sweep", totals: { calories: 2115, protein: 207, fat: 50, carbs: 204 }, items: [{ name: "pork chops — clean sweep", calories: 2115, protein: 207, fat: 50, carbs: 204 }] },
  { date: "2026-03-20", notes: "Brick & Tin dinner. No shake — protein low", totals: { calories: 1960, protein: 164, fat: 63, carbs: 152 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + chia + blueberries", calories: 155, protein: 15, fat: 3, carbs: 18 },
    { name: "cheese stick", calories: 80, protein: 7, fat: 5, carbs: 1 },
    { name: "PB filled pretzels (10)", calories: 180, protein: 4, fat: 8, carbs: 22 },
    { name: "Little Donkey burrito bowl (smoked chicken, rice, beans, lettuce, guac)", calories: 620, protein: 42, fat: 18, carbs: 65 },
    { name: "half prosciutto turkey sandwich", calories: 280, protein: 22, fat: 12, carbs: 20 },
    { name: "Brick & Tin salad + chicken", calories: 350, protein: 40, fat: 10, carbs: 15 },
  ]},
  { date: "2026-03-21", notes: "Brownies + ice cream + chips. CLEAN SWEEP", totals: { calories: 2045, protein: 197, fat: 60, carbs: 161 }, items: [{ name: "brownies, ice cream, chips — still clean sweep", calories: 2045, protein: 197, fat: 60, carbs: 161 }] },
  { date: "2026-03-22", notes: "2hr 7min tennis, 1,149 cal burned. 178 bpm max HR", totals: { calories: 2385, protein: 202, fat: 59, carbs: 247 }, items: [{ name: "tennis day — 1149 cal burned, 178 bpm max HR", calories: 2385, protein: 202, fat: 59, carbs: 247 }] },
  { date: "2026-03-23", notes: "Salmon + egg whites dinner. Clean sweep", totals: { calories: 2035, protein: 188, fat: 63, carbs: 166 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "leftover steak (5oz) + rice (1 cup) + broccoli", calories: 480, protein: 28, fat: 12, carbs: 62 },
    { name: "salmon (6oz) + egg whites", calories: 500, protein: 60, fat: 24, carbs: 0 },
    { name: "Ascent PB + 14oz 1% milk", calories: 295, protein: 37, fat: 6, carbs: 19 },
  ]},
  { date: "2026-03-24", notes: "Pork chops + fries. Clean sweep", totals: { calories: 2270, protein: 199, fat: 60, carbs: 226 }, items: [{ name: "pork chops + fries — clean sweep", calories: 2270, protein: 199, fat: 60, carbs: 226 }] },
  { date: "2026-03-25", notes: "Funeral dinner + Taco Mama margarita/chips/queso", totals: { calories: 2890, protein: 157, fat: 100, carbs: 270 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "cappuccino (whole milk)", calories: 80, protein: 4, fat: 4, carbs: 6 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "salmon wrap + butternut squash soup + focaccia (2 pieces)", calories: 800, protein: 35, fat: 30, carbs: 80 },
    { name: "funeral dinner + Taco Mama chips/queso + frozen margarita", calories: 1360, protein: 55, fat: 51, carbs: 123 },
  ]},
  { date: "2026-03-26", notes: "500 cal Skillmill burn. Clean bounce back", totals: { calories: 2135, protein: 187, fat: 46, carbs: 235 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "DKB Cinnamon Raisin bagel + butter", calories: 330, protein: 11, fat: 8, carbs: 57 },
    { name: "ground turkey 97/3 + peppers/onions + sweet potato", calories: 350, protein: 43, fat: 4, carbs: 34 },
    { name: "Yerba Mate Lemon Elation", calories: 100, protein: 1, fat: 0, carbs: 25 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "PB filled pretzels (10)", calories: 150, protein: 4, fat: 5, carbs: 20 },
    { name: "pork loin chop (6oz)", calories: 220, protein: 36, fat: 6, carbs: 0 },
    { name: "white rice (1 cup)", calories: 225, protein: 4, fat: 0, carbs: 53 },
    { name: "Ascent PB + 14oz 1% milk", calories: 295, protein: 37, fat: 6, carbs: 19 },
    { name: "cheese stick", calories: 80, protein: 7, fat: 5, carbs: 1 },
  ]},
  { date: "2026-03-27", notes: "Grilled cheese night. Protein short — no shake", totals: { calories: 2350, protein: 161, fat: 75, carbs: 251 }, items: [
    { name: "3 whole eggs", calories: 210, protein: 18, fat: 15, carbs: 0 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "ground turkey 97/3 fajita bowl + rice (1/2 cup)", calories: 350, protein: 43, fat: 4, carbs: 34 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "2 grilled cheese (milk bread + Havarti + butter)", calories: 1040, protein: 32, fat: 40, carbs: 136 },
    { name: "Ascent PB + 14oz 1% milk", calories: 295, protein: 37, fat: 6, carbs: 19 },
  ]},
  { date: "2026-03-28", notes: "Date night Food Bar. Flounder + cheese board. 4 mile run", totals: { calories: 2850, protein: 199, fat: 75, carbs: 291 }, items: [{ name: "date night at Food Bar — flounder + cheese board", calories: 2850, protein: 199, fat: 75, carbs: 291 }] },
  { date: "2026-03-29", notes: "Chicken salad + cottage cheese. Clean sweep", totals: { calories: 2155, protein: 207, fat: 54, carbs: 175 }, items: [{ name: "chicken salad + cottage cheese — clean sweep", calories: 2155, protein: 207, fat: 54, carbs: 175 }] },
  { date: "2026-03-30", notes: "AMC movie night. Half small popcorn + candy", totals: { calories: 2265, protein: 202, fat: 68, carbs: 330 }, items: [{ name: "AMC movie night — half small popcorn + candy", calories: 2265, protein: 202, fat: 68, carbs: 330 }] },
  { date: "2026-03-31", notes: "500 cal Skillmill burn. Ladybird taco + tikka masala", totals: { calories: 2400, protein: 210, fat: 54, carbs: 236 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "DKB Cinnamon Raisin bagel", calories: 290, protein: 11, fat: 3, carbs: 57 },
    { name: "cappuccino (whole milk)", calories: 120, protein: 6, fat: 6, carbs: 10 },
    { name: "Ladybird taco #5 (egg, refried beans, avocado, potato)", calories: 380, protein: 12, fat: 20, carbs: 38 },
    { name: "chicken (7oz) + white rice (1 cup)", calories: 550, protein: 55, fat: 7, carbs: 53 },
    { name: "Fage yogurt + blueberries + honey + chia", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "pork loin chop (6oz)", calories: 220, protein: 36, fat: 6, carbs: 0 },
    { name: "sweet potato", calories: 110, protein: 2, fat: 0, carbs: 26 },
    { name: "mixed greens", calories: 20, protein: 1, fat: 0, carbs: 3 },
    { name: "Ascent PB + half 1% milk half water", calories: 250, protein: 36, fat: 4, carbs: 12 },
  ]},
  { date: "2026-04-01", notes: "Urban Cookhouse + pork chop. Solid", totals: { calories: 2000, protein: 213, fat: 39, carbs: 168 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + blueberries + honey + chia", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "Urban Cookhouse Berry Good Salad + chicken", calories: 350, protein: 42, fat: 5, carbs: 15 },
    { name: "cheese stick", calories: 80, protein: 7, fat: 5, carbs: 1 },
    { name: "Solely Organic fruit gummies", calories: 60, protein: 0, fat: 0, carbs: 14 },
    { name: "pork loin chop (6oz)", calories: 220, protein: 36, fat: 6, carbs: 0 },
    { name: "sweet potato", calories: 110, protein: 2, fat: 0, carbs: 26 },
    { name: "Ascent PB + water + banana", calories: 235, protein: 26, fat: 2, carbs: 32 },
  ]},
  { date: "2026-04-02", notes: "Tikka masala + Little Donkey burrito bowl", totals: { calories: 2225, protein: 195, fat: 58, carbs: 240 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "overnight oats + blueberries (Ascent PB)", calories: 500, protein: 39, fat: 9, carbs: 67 },
    { name: "tikka masala + Little Donkey burrito bowl (estimated remainder)", calories: 1530, protein: 124, fat: 44, carbs: 171 },
  ]},
  { date: "2026-04-04", notes: "Hibachi dinner. Bagel for breakfast", totals: { calories: 2135, protein: 190, fat: 49, carbs: 191 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "DKB Cinnamon Raisin bagel", calories: 290, protein: 11, fat: 3, carbs: 57 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 265, protein: 19, fat: 3, carbs: 35 },
    { name: "ground turkey 93/7 (6oz) + sweet potato", calories: 350, protein: 36, fat: 11, carbs: 26 },
    { name: "hibachi (steak, chicken, rice, egg)", calories: 750, protein: 55, fat: 22, carbs: 53 },
    { name: "Ascent + 14oz 1% milk", calories: 285, protein: 37, fat: 5, carbs: 18 },
  ]},
  { date: "2026-04-05", notes: "Easter. 700 cal Skillmill burn. Pound cake was the fat driver", totals: { calories: 2495, protein: 181, fat: 96, carbs: 211 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + Purely Elizabeth Berry Crisp granola + chia + blueberries + honey", calories: 255, protein: 18, fat: 3, carbs: 34 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "Easter ham (2 slices, ~5oz)", calories: 210, protein: 25, fat: 10, carbs: 4 },
    { name: "homemade mac and cheese (~1/2 cup)", calories: 250, protein: 9, fat: 15, carbs: 18 },
    { name: "roll", calories: 150, protein: 4, fat: 3, carbs: 26 },
    { name: "green salad (lightly dressed)", calories: 80, protein: 2, fat: 5, carbs: 5 },
    { name: "broccoli salad (cranberries, pecans, dressing)", calories: 150, protein: 3, fat: 10, carbs: 12 },
    { name: "pound cake (2 slices)", calories: 600, protein: 8, fat: 28, carbs: 76 },
    { name: "Ascent PB + water", calories: 135, protein: 26, fat: 2, carbs: 5 },
    { name: "ground turkey 97/3 (6oz)", calories: 200, protein: 40, fat: 4, carbs: 0 },
    { name: "side salad (light dressing)", calories: 80, protein: 2, fat: 5, carbs: 5 },
  ]},
  { date: "2026-04-06", notes: "Three whole eggs (out of egg whites). Turkey 97/3 double protein day", totals: { calories: 1915, protein: 183, fat: 45, carbs: 185 }, items: [
    { name: "1 Arrowhead pancake (whole milk)", calories: 110, protein: 3, fat: 3, carbs: 19 },
    { name: "3 whole eggs", calories: 210, protein: 18, fat: 15, carbs: 0 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 255, protein: 18, fat: 3, carbs: 34 },
    { name: "ground turkey 97/3 (6oz) + white rice (1 cup) + bell peppers", calories: 455, protein: 43, fat: 4, carbs: 60 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "cheese stick", calories: 80, protein: 7, fat: 5, carbs: 1 },
    { name: "ground turkey 97/3 (6oz) + sweet potato + zucchini", calories: 330, protein: 43, fat: 4, carbs: 30 },
    { name: "Ascent + 14oz 1% milk", calories: 285, protein: 37, fat: 5, carbs: 18 },
  ]},
  { date: "2026-04-07", notes: "700 cal Skillmill burn. Chicken thighs + mac & cheese pushed fat over", totals: { calories: 2475, protein: 205, fat: 88, carbs: 211 }, items: [
    { name: "overnight oats (oats + Ascent PB + 1% milk + chia)", calories: 460, protein: 38, fat: 9, carbs: 57 },
    { name: "1 Arrowhead pancake (whole milk)", calories: 110, protein: 3, fat: 3, carbs: 19 },
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Whole Foods tikka masala (turmeric rice + chicken)", calories: 450, protein: 28, fat: 18, carbs: 43 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 255, protein: 18, fat: 3, carbs: 34 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "chicken thighs (6oz)", calories: 330, protein: 36, fat: 20, carbs: 0 },
    { name: "homemade mac and cheese (~1/2 cup)", calories: 250, protein: 9, fat: 15, carbs: 18 },
    { name: "salad (light olive oil)", calories: 80, protein: 2, fat: 7, carbs: 5 },
    { name: "zucchini", calories: 20, protein: 1, fat: 0, carbs: 4 },
    { name: "Ascent PB + water", calories: 135, protein: 26, fat: 2, carbs: 5 },
  ]},
  { date: "2026-04-08", notes: "Celebration dinner — new gig at Harmony Venture Labs. Little Donkey + chips/queso + margarita + cookies", totals: { calories: 2770, protein: 163, fat: 82, carbs: 292 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 255, protein: 18, fat: 3, carbs: 34 },
    { name: "Yerba Mate Lemon Elation", calories: 100, protein: 1, fat: 0, carbs: 25 },
    { name: "cheese stick", calories: 80, protein: 7, fat: 5, carbs: 1 },
    { name: "chicken thigh (6oz) + sweet potato + zucchini", calories: 460, protein: 39, fat: 20, carbs: 30 },
    { name: "RXBar PB", calories: 190, protein: 12, fat: 7, carbs: 24 },
    { name: "chips + queso", calories: 400, protein: 8, fat: 22, carbs: 40 },
    { name: "Little Donkey bowl (smoked chicken, rice, beans, lettuce, corn, no guac)", calories: 550, protein: 42, fat: 10, carbs: 65 },
    { name: "frozen margarita", calories: 300, protein: 0, fat: 0, carbs: 35 },
    { name: "Sweet Loren's cookies (2)", calories: 240, protein: 4, fat: 10, carbs: 36 },
  ]},
  { date: "2026-04-09", notes: "737 cal Skillmill burn. Under on calories and fat for Skillmill day", totals: { calories: 1975, protein: 181, fat: 39, carbs: 209 }, items: [
    { name: "egg + 1 cup egg whites", calories: 195, protein: 32, fat: 5, carbs: 2 },
    { name: "Ozery bun", calories: 160, protein: 5, fat: 1, carbs: 32 },
    { name: "1 Arrowhead pancake (whole milk)", calories: 110, protein: 3, fat: 3, carbs: 19 },
    { name: "Fage yogurt + chia + blueberries + honey", calories: 255, protein: 18, fat: 3, carbs: 34 },
    { name: "hibachi stir fry leftovers (steak, chicken thigh, rice, broccoli, onion)", calories: 420, protein: 26, fat: 16, carbs: 45 },
    { name: "ground turkey 98/2 (3oz)", calories: 90, protein: 21, fat: 1, carbs: 0 },
    { name: "Ascent + 14oz 1% milk + banana", calories: 390, protein: 38, fat: 5, carbs: 45 },
    { name: "pork loin chop (6oz) + brown sugar rub", calories: 245, protein: 36, fat: 6, carbs: 6 },
    { name: "sweet potato", calories: 110, protein: 2, fat: 0, carbs: 26 },
  ]},
]

// ─── WORKOUT DATA ────────────────────────────────────────────────────────────

const workouts = [
  { date: "2026-03-14", type: "lifting", session_name: "InBody Scan Day — Lifting", notes: "Baseline InBody scan: 172.9 lbs, 11.4% BF, 88.0 lbs skeletal muscle", exercises: [] },
  { date: "2026-03-15", type: "skillmill", session_name: "Skillmill Session", skillmill: { duration_min: 30, distance_km: 4.81, avg_hr_bpm: 152, resistance_base: 2, notes: "First recorded Skillmill session" }, exercises: [] },
  { date: "2026-03-19", type: "skillmill", session_name: "Skillmill Session", skillmill: { duration_min: 30, distance_km: 4.06, avg_hr_bpm: 158, active_calories: 421, resistance_base: 2 }, exercises: [] },
  { date: "2026-03-22", type: "tennis", session_name: "Tennis", cardio: { duration_min: 127, avg_hr_bpm: 134, max_hr_bpm: 178, active_calories: 968, total_calories: 1149 }, exercises: [] },
  { date: "2026-03-24", type: "skillmill", session_name: "Skillmill Session", skillmill: { duration_min: 33, avg_hr_bpm: 115, active_calories: 240, resistance_base: 2, notes: "Modified intervals — 20 sec sprint every 5 min" }, exercises: [] },
  { date: "2026-03-26", type: "skillmill", session_name: "Skillmill Mixed Protocol", skillmill: { duration_min: 41, distance_km: 3.25, avg_hr_bpm: 152, max_hr_bpm: 173, resistance_base: 1, notes: "Mixed protocol. Garmin programmed workout." }, exercises: [] },
  { date: "2026-03-28", type: "running", session_name: "Neighborhood Run", cardio: { duration_min: 45, avg_hr_bpm: 148, max_hr_bpm: 164, best_pace_per_mi: "8:13", elevation_gain_ft: 266 }, exercises: [] },
  { date: "2026-03-29", type: "lifting", session_name: "Wednesday — Upper Body + Rotation", exercises: [
    { name: "KB Turkish Get-Up", sets: 3, reps: 3, notes: "Each side" },
    { name: "Push-up to Renegade Row", sets: 4, reps: 8, notes: "Each side" },
    { name: "KB Halo Seated with Quad Touch", sets: 3, reps: 10, notes: "Each direction" },
    { name: "Landmine Rotational Press", sets: 4, reps: 10, notes: "Each side" },
    { name: "Side to Side Push-up", sets: 3, reps: 8, notes: "Each side" },
    { name: "KB Curl to Press", sets: 3, reps: 10, notes: "Each side" },
    { name: "Single-arm KB Waiter's Carry", sets: 2, distance_m: 40, notes: "Each side" },
  ]},
  { date: "2026-03-31", type: "skillmill", session_name: "Skillmill — Norwegian 4x4", skillmill: { duration_min: 54, distance_km: 5.93, avg_hr_bpm: 153, max_hr_bpm: 183, active_calories: 625, total_calories: 700, protocol: "Norwegian 4x4 — 4 min hard effort, 3 min recovery x4" }, exercises: [] },
  { date: "2026-04-02", type: "lifting", session_name: "Friday — KB Complex + Core Finisher", exercises: [
    { name: "KB Swing", sets: 5, reps: 10, weight_kg: 20 },
    { name: "KB Swing Clean", sets: 5, reps: 10, weight_kg: 20 },
    { name: "Goblet Squat", sets: 5, reps: 10, weight_kg: 20 },
    { name: "Alternating Reverse Lunge", sets: 5, reps: 10, weight_kg: 20, notes: "5 each leg" },
    { name: "Two Hand Row", sets: 5, reps: 10, weight_kg: 20 },
    { name: "KB Close Grip Push-up", sets: 5, reps: 10, weight_kg: 20 },
    { name: "Hollow Body Hold", sets: 3, duration_sec: 45 },
    { name: "Dead Bug", sets: 3, reps: 8, notes: "Each side" },
    { name: "Hanging Leg Raises", sets: 3, reps: 10 },
  ]},
  { date: "2026-04-05", type: "skillmill", session_name: "Skillmill — Flex Day", skillmill: { duration_min: 60, distance_km: 6.93, avg_hr_bpm: 150, max_hr_bpm: 181, active_calories: 698, total_calories: 782, notes: "Longest distance session to date." }, exercises: [] },
  { date: "2026-04-06", type: "lifting", session_name: "Monday — Lower Body + Hinge + Rotation + Chest", exercises: [
    { name: "KB Deadlift → Clean → Press", sets: 4, reps: 6, weight_kg: 20, notes: "Each side" },
    { name: "KB Swing (two-hand)", sets: 4, reps: 15, weight_kg: 32 },
    { name: "KB Around the World (kneeling)", sets: 3, reps: 10, weight_kg: 18, notes: "Each direction" },
    { name: "KB Bulgarian Split Squat", sets: 4, reps: 8, weight_kg: 8, notes: "Each side. Rear foot on bench." },
    { name: "Double Push-up → KB Deadlift", sets: 3, reps: 10, weight_kg: 36 },
    { name: "Farmers Carry", sets: 3, distance_m: 40 },
  ]},
  { date: "2026-04-07", type: "skillmill", session_name: "Skillmill — Hill Climber 55", skillmill: { duration_min: 60, distance_km: 6.60, avg_hr_bpm: 152, max_hr_bpm: 185, active_calories: 737, total_calories: 825, best_pace_per_mi: "5:33", protocol: "Hill Climber 55 — Level 2 base, Level 8 for 2 min at every 5-min mark. 11 climbs.", resistance_base: 2, resistance_climbs: 8, total_climbs: 11 }, exercises: [] },
  { date: "2026-04-08", type: "lifting", session_name: "Wednesday — Upper Body + Pulling + Shoulders + Arms", notes: "InBody scan: 168.8 lbs, 8.6% BF, 88.2 lbs muscle, InBody Score 93", exercises: [
    { name: "KB Turkish Get-Up", sets: 3, reps: 3, weight_kg: 18, notes: "Each side" },
    { name: "Pull-ups", sets: 4, notes: "Max reps bodyweight" },
    { name: "Cable Chest Fly", sets: 3, reps: 12 },
    { name: "Landmine Rotational Press", sets: 4, reps: 10, notes: "35 lbs added. Each side." },
    { name: "KB Gorilla Row", sets: 3, reps: 10, notes: "Each side" },
    { name: "KB Curl to Press", sets: 3, reps: 10, notes: "Each side" },
    { name: "Single-arm KB Waiter's Carry", sets: 2, distance_m: 40, notes: "Each side" },
    { name: "Ab Wheel Rollout", sets: 3, reps: 10, notes: "From knees" },
  ]},
  { date: "2026-04-09", type: "skillmill", session_name: "Skillmill — Hill Climber 55", skillmill: { duration_min: 60, distance_km: 7.13, distance_mi: 4.43, avg_hr_bpm: 151, max_hr_bpm: 199, active_calories: 714, total_calories: 798, best_pace_per_mi: "5:10", protocol: "Hill Climber 55 — Level 2 base, Level 8 for 2 min every 5 min. 11 climbs.", resistance_base: 2, resistance_climbs: 8, total_climbs: 11, notes: "New distance record 7.13 km. New max HR 199 bpm. New best pace 5:10/mi." }, exercises: [] },
]

// ─── IMPORT ──────────────────────────────────────────────────────────────────

async function importNutrition() {
  console.log(`\nImporting ${nutritionDays.length} nutrition days...`)
  let ok = 0, fail = 0

  for (const day of nutritionDays) {
    // Upsert daily_log
    const { data: log, error: logErr } = await supabase
      .from('daily_logs')
      .upsert({ user_id: USER_ID, date: day.date }, { onConflict: 'user_id,date' })
      .select()
      .single()

    if (logErr) {
      console.error(`❌ ${day.date} log — ${logErr.message}`)
      fail++
      continue
    }

    // Delete any existing food entries for this day (clean import)
    await supabase.from('food_entries').delete().eq('log_id', log.id)

    // Insert single food entry with all items
    const { error: entryErr } = await supabase.from('food_entries').insert({
      log_id: log.id,
      user_id: USER_ID,
      raw_input: day.notes,
      items: day.items,
      total_calories: day.totals.calories,
      total_protein: day.totals.protein,
      total_fat: day.totals.fat,
      total_carbs: day.totals.carbs,
    })

    if (entryErr) {
      console.error(`❌ ${day.date} entry — ${entryErr.message}`)
      fail++
    } else {
      console.log(`✅ ${day.date} — ${day.totals.calories} cal / ${day.totals.protein}g P`)
      ok++
    }
  }

  console.log(`Nutrition: ${ok} imported, ${fail} failed`)
}

async function importWorkouts() {
  console.log(`\nImporting ${workouts.length} workouts...`)
  let ok = 0, fail = 0

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
        exercises: w.exercises,
      }
    }, { onConflict: 'user_id,date' })

    if (error) {
      console.error(`❌ ${w.date} — ${error.message}`)
      fail++
    } else {
      console.log(`✅ ${w.date} — ${w.session_name}`)
      ok++
    }
  }

  console.log(`Workouts: ${ok} imported, ${fail} failed`)
}

async function run() {
  console.log(`Importing for user ${USER_ID}`)
  await importNutrition()
  await importWorkouts()
  console.log('\nDone.')
}

run()

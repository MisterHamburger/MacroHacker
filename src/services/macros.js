const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const FAT_PERCENT = {
  cut: 0.25,
  recomp: 0.30,
  bulk: 0.25,
}

const CALORIE_ADJUSTMENTS = {
  cut: -500,
  recomp: 0,
  bulk: 300,
}

export function calculateTargets({ sex, age, height_inches, weight_lbs, activity_level, goal }) {
  const weightKg = weight_lbs * 0.453592
  const heightCm = height_inches * 2.54

  // Mifflin-St Jeor BMR
  let bmr
  if (sex === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[activity_level]
  const calories = Math.round(tdee + CALORIE_ADJUSTMENTS[goal])

  // Protein: 1g per lb bodyweight
  const protein = Math.round(weight_lbs)

  // Fat: % of total calories / 9
  const fat = Math.round((calories * FAT_PERCENT[goal]) / 9)

  // Carbs: remaining calories / 4
  const proteinCals = protein * 4
  const fatCals = fat * 9
  const carbs = Math.round((calories - proteinCals - fatCals) / 4)

  return {
    daily_calories: calories,
    daily_protein: protein,
    daily_fat: fat,
    daily_carbs: carbs,
  }
}

(function (root) {
  const meals = [
    { name: 'BREAKFAST', minute: 7 * 60 + 30, time: '7:30 AM' },
    { name: 'LUNCH', minute: 12 * 60 + 30, time: '12:30 PM' },
    { name: 'DINNER', minute: 18 * 60 + 30, time: '6:30 PM' }
  ];

  function mealPower(now) {
    // Use local wall-clock minutes, including the overnight dinner-to-breakfast interval.
    const minute = now.getHours() * 60 + now.getMinutes();
    let index = meals.findIndex(meal => meal.minute >= minute);
    let nextDay = false;
    if (index === -1) { index = 0; nextDay = true; }
    const meal = meals[index];
    const target = meal.minute + (nextDay ? 1440 : 0);
    const previous = index === 0 ? meals[2].minute + (nextDay ? 0 : -1440) : meals[index - 1].minute;
    const remaining = target - minute;
    const percent = remaining === 0 ? 0 : Math.max(1, Math.min(100, Math.round(remaining / (target - previous) * 100)));
    return { percent, remaining, name: meal.name, time: meal.time };
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { mealPower };
  else root.mealPower = mealPower;
})(typeof window !== 'undefined' ? window : globalThis);

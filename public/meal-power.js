(function (root) {
  const meals = [
    { name: 'BREAKFAST', minute: 7 * 60 + 30, time: '7:30 AM', refillTime: '8:30 AM' },
    { name: 'LUNCH', minute: 12 * 60 + 30, time: '12:30 PM', refillTime: '1:30 PM' },
    { name: 'DINNER', minute: 18 * 60 + 30, time: '6:30 PM', refillTime: '7:30 PM' }
  ];
  function mealPower(now) {
    const minute = now.getHours() * 60 + now.getMinutes();
    const recovering = meals.find(meal => minute >= meal.minute && minute < meal.minute + 60);
    if (recovering) return { percent: 0, remaining: 0, name: recovering.name, time: recovering.time, recovering: true, refillRemaining: recovering.minute + 60 - minute, refillTime: recovering.refillTime };
    let index = meals.findIndex(meal => meal.minute > minute);
    const nextDay = index === -1;
    if (nextDay) index = 0;
    const meal = meals[index];
    const target = meal.minute + (nextDay ? 1440 : 0);
    const previous = index === 0 ? meals[2].minute + (nextDay ? 0 : -1440) : meals[index - 1].minute;
    const remaining = target - minute;
    const percent = Math.max(1, Math.min(100, Math.round(remaining / (target - previous - 60) * 100)));
    return { percent, remaining, name: meal.name, time: meal.time, recovering: false };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { mealPower };
  else root.mealPower = mealPower;
})(typeof window !== 'undefined' ? window : globalThis);

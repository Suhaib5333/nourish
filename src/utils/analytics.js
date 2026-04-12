export function getTopTrigger(triggers) {
  if (!triggers.length) return null;
  const counts = {};
  triggers.forEach(t => {
    counts[t.triggerType] = (counts[t.triggerType] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return { type: sorted[0][0], count: sorted[0][1] };
}

export function getAverageComfort(moods) {
  if (!moods.length) return 0;
  return moods.reduce((sum, m) => sum + m.comfort, 0) / moods.length;
}

export function getBridgeSuccessRate(bridges) {
  if (!bridges.length) return 0;
  const accepted = bridges.filter(b => b.status === 'accepted').length;
  return Math.round((accepted / bridges.length) * 100);
}

export function getComfortTrend(moods, days = 14) {
  const cutoff = Date.now() - days * 86400000;
  const recent = moods.filter(m => new Date(m.date).getTime() > cutoff);
  const byDay = {};
  recent.forEach(m => {
    const day = new Date(m.date).toISOString().split('T')[0];
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(m.comfort);
  });
  return Object.entries(byDay)
    .map(([date, vals]) => ({
      date,
      avg: vals.reduce((s, v) => s + v, 0) / vals.length,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTriggersByWeek(triggers, weeks = 8) {
  const cutoff = Date.now() - weeks * 7 * 86400000;
  const recent = triggers.filter(t => new Date(t.date).getTime() > cutoff);
  const byWeek = {};
  recent.forEach(t => {
    const d = new Date(t.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];
    byWeek[key] = (byWeek[key] || 0) + 1;
  });
  return Object.entries(byWeek)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));
}

export function getRecentActivity(foodMap, bridges, triggers, wins, moods, limit = 5) {
  const all = [
    ...foodMap.map(f => ({ type: 'food', label: `Added ${f.name} to food map`, date: f.dateAdded })),
    ...bridges.flatMap(b => [
      { type: 'bridge', label: `Started bridge: ${b.newFoodName}`, date: b.createdAt },
      ...(b.attempts || []).map(a => ({ type: 'attempt', label: `Tried ${b.newFoodName} (comfort: ${a.comfort}/5)`, date: a.date })),
    ]),
    ...triggers.map(t => ({ type: 'trigger', label: `Trigger: ${t.food} (${t.triggerType})`, date: t.date, mealTime: t.mealTime })),
    ...wins.map(w => ({ type: 'win', label: `Win: ${w.food}`, date: w.date })),
    ...moods.map(m => ({ type: 'mood', label: `Logged meal: ${m.meal} (comfort: ${m.comfort}/5)`, date: m.date, mealTime: m.mealTime })),
  ];
  return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
}

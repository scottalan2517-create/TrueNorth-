// Consecutive months (walking back from the most recent entry) with at
// least one Money Date logged. A gap of even one month breaks the streak.
export function computeStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  const months = new Set(dates.map((d) => `${d.getFullYear()}-${d.getMonth()}`));
  const latest = dates.reduce((a, b) => (a > b ? a : b));

  let streak = 0;
  let year = latest.getFullYear();
  let month = latest.getMonth();
  while (months.has(`${year}-${month}`)) {
    streak++;
    month -= 1;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
  }
  return streak;
}

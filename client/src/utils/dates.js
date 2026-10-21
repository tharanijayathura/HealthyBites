export const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const SUNDAY_FIRST = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function todayInColombo() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function upcomingDatesForDay(day) {
  const today = new Date(`${todayInColombo()}T00:00:00Z`);
  const todayIndex = today.getUTCDay();
  const target = SUNDAY_FIRST.indexOf(day);
  if (target < 0) return [];
  const offset = (target - todayIndex + 7) % 7;
  return [0,7,14,21].map(n => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() + offset + n);
    return date.toISOString().slice(0,10);
  }).filter(date => {
    const latest = new Date(today);
    latest.setUTCDate(latest.getUTCDate() + 28);
    return date <= latest.toISOString().slice(0,10);
  });
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
  }).format(new Date(`${iso}T00:00:00Z`));
}

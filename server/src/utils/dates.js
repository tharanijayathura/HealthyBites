const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export function colomboTodayISO() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Colombo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const p = Object.fromEntries(parts.filter(x => x.type !== 'literal').map(x => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}

export function validateDeliveryDate(iso, dayName) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0,10) !== iso) return false;
  const today = colomboTodayISO();
  const latest = new Date(`${today}T00:00:00Z`);
  latest.setUTCDate(latest.getUTCDate() + 28);
  return iso >= today && iso <= latest.toISOString().slice(0,10) && DAYS[date.getUTCDay()] === dayName;
}

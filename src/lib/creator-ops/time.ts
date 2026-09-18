/**
 * Time and timezone utilities hardcoded to Pakistan Standard Time (PKT, Asia/Karachi, UTC+5).
 */

export function getPKTDate(): Date {
  // Convert current UTC time to PKT by getting locale string in Asia/Karachi
  const now = new Date();
  const pktString = now.toLocaleString('en-US', { timeZone: 'Asia/Karachi' });
  return new Date(pktString);
}

export function getPKTDateString(): string {
  const pkt = getPKTDate();
  const yyyy = pkt.getFullYear();
  const mm = String(pkt.getMonth() + 1).padStart(2, '0');
  const dd = String(pkt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getPKTDayOfWeek(): number {
  return getPKTDate().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
}

export function getPKTHour(): number {
  return getPKTDate().getHours();
}

export function formatPKTTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }) + ' PKT';
}

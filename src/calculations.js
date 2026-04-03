export function parseDateInput(value) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const s = String(value).trim();
  const iso = s.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, mo, da] = iso.split('-').map((x) => parseInt(x, 10));
    if (!y || !mo || !da) throw new Error('Invalid date');
    return new Date(y, mo - 1, da);
  }
  const br = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (br) {
    const da = parseInt(br[1], 10);
    const mo = parseInt(br[2], 10);
    const y = parseInt(br[3], 10);
    if (mo < 1 || mo > 12 || da < 1 || da > 31) throw new Error('Invalid date');
    const d = new Date(y, mo - 1, da);
    if (d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== da) throw new Error('Invalid date');
    return d;
  }
  throw new Error('Invalid date');
}

export function toIsoDateString(value) {
  const d =
    value instanceof Date
      ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
      : parseDateInput(value);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${da}`;
}

export function formatDateBr(value) {
  if (value == null || value === '') return '';
  try {
    const d =
      value instanceof Date
        ? new Date(value.getFullYear(), value.getMonth(), value.getDate())
        : parseDateInput(value);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return String(value);
  }
}

export function monthsBetween(loanDate, dueDate) {
  const start = parseDateInput(loanDate);
  const end = parseDateInput(dueDate);
  if (end < start) return null;
  let m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) m -= 1;
  return Math.max(0, m);
}

export function principalInBrl(amount, brlRate) {
  return Number(amount) * Number(brlRate);
}

export function maturityValueInBrl(principalBrl, annualRatePercent, months) {
  const vp = Number(principalBrl);
  const r = Number(annualRatePercent) / 100;
  const n = Number(months);
  if (Number.isNaN(vp) || Number.isNaN(r) || Number.isNaN(n)) return NaN;
  if (n <= 0) return vp;
  return vp * (1 + r) ** (n / 12);
}

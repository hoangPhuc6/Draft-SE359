import { format, formatDistanceToNow, parseISO } from "date-fns";

export function fmtDateTime(value) {
  if (!value) return "—";
  try {
    const d = typeof value === "string" ? parseISO(value) : value;
    return format(d, "dd/MM/yyyy HH:mm");
  } catch {
    return String(value);
  }
}

export function fmtDate(value) {
  if (!value) return "—";
  try {
    const d = typeof value === "string" ? parseISO(value) : value;
    return format(d, "dd/MM/yyyy");
  } catch {
    return String(value);
  }
}

export function fmtRelative(value) {
  if (!value) return "—";
  try {
    const d = typeof value === "string" ? parseISO(value) : value;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "";
  }
}

export function toLocalDatetimeInput(value) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalDatetimeInput(str) {
  if (!str) return null;
  return new Date(str).toISOString();
}

export function todayInput() {
  return toLocalDatetimeInput(new Date()).slice(0, 10);
}

export function clsxIf(cond, a, b = "") {
  return cond ? a : b;
}

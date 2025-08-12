import { Tx } from "@state/AppStore";
export function computeDailyReport(date: string, items: Tx[]) {
  const day = new Date(date);
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  const filtered = items.filter((t) => t.ts >= start && t.ts <= end);
  const count = filtered.length;
  const sum = filtered.reduce((a, t) => a + t.amount, 0);
  const fees = filtered.reduce((a, t) => a + t.fee, 0);
  const first = filtered.length
    ? new Date(Math.min(...filtered.map((t) => t.ts.getTime())))
    : undefined;
  const last = filtered.length
    ? new Date(Math.max(...filtered.map((t) => t.ts.getTime())))
    : undefined;
  return { items: filtered, count, sum, fees, first, last };
}

import { Tx } from "@state/AppStore";
export function computeDailyReport(date: string, items: Tx[]) {
  const day = new Date(date);
  const year = day.getFullYear();
  const month = day.getMonth();
  const dateOfMonth = day.getDate();
  const filtered = items.filter((t) => {
    const txDate = t.ts instanceof Date ? t.ts : new Date(t.ts);
    return (
      txDate.getFullYear() === year &&
      txDate.getMonth() === month &&
      txDate.getDate() === dateOfMonth
    );
  });
  const count = filtered.length;
  const sum = filtered.reduce((a, t) => a + t.amount, 0);
  const fees = filtered.reduce((a, t) => a + t.fee, 0);
  const first = filtered.length
    ? new Date(
        Math.min(
          ...filtered.map((t) =>
            t.ts instanceof Date ? t.ts.getTime() : new Date(t.ts).getTime(),
          ),
        ),
      )
    : undefined;
  const last = filtered.length
    ? new Date(
        Math.max(
          ...filtered.map((t) =>
            t.ts instanceof Date ? t.ts.getTime() : new Date(t.ts).getTime(),
          ),
        ),
      )
    : undefined;
  return { items: filtered, count, sum, fees, first, last };
}

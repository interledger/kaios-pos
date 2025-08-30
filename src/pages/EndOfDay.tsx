import { useState, useMemo, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { formatCurrency } from "@lib/currency";
import { computeDailyReport } from "@services/reports";
export default function EndOfDay(_props: { path?: string }) {
  const nav = route;
  const { currency, tx } = useAppStore();
  const [reportDate, setReportDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const report = useMemo(
    () => computeDailyReport(reportDate, tx),
    [reportDate, tx],
  );
  const { count, sum, fees, first, last, items } = report;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "Backspace") {
        nav("/menu");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav("/menu")}
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back
        </button>
        <div className="text-sm text-white/70">End of day report</div>
        <div className="w-10" />
      </div>
      <label className="block">
        <span className="text-sm text-white/80">Report date</span>
        <input
          type="date"
          className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
          value={reportDate}
          onChange={(e) => setReportDate((e.target as HTMLInputElement).value)}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs text-white/70">Number of transactions</div>
          <div className="mt-1 text-lg font-semibold">{String(count)}</div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs text-white/70">Sum of all transactions</div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(sum, currency)}
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs text-white/70">Sum of all fees</div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(fees, currency)}
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs text-white/70">Net total (sum - fees)</div>
          <div className="mt-1 text-lg font-semibold">
            {formatCurrency(sum - fees, currency)}
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs text-white/70">First transaction</div>
          <div className="mt-1 text-lg font-semibold">
            {first ? (first.toLocaleString?.() as any) : "–"}
          </div>
        </div>
        <div className="rounded-2xl bg-white/10 p-4">
          <div className="text-xs text-white/70">Last transaction</div>
          <div className="mt-1 text-lg font-semibold">
            {last ? (last.toLocaleString?.() as any) : "–"}
          </div>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/10">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Time</th>
              <th className="text-left px-3 py-2 font-medium">Amount</th>
              <th className="text-left px-3 py-2 font-medium">Fee</th>
              <th className="text-left px-3 py-2 font-medium">ID</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id} className="odd:bg-white/5">
                <td className="px-3 py-2">
                  {t.ts.toLocaleString?.() || String(t.ts)}
                </td>
                <td className="px-3 py-2">
                  {formatCurrency(t.amount, currency)}
                </td>
                <td className="px-3 py-2">{formatCurrency(t.fee, currency)}</td>
                <td className="px-3 py-2">{t.id}</td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td className="px-3 py-6 text-center text-white/60" colSpan={4}>
                  No transactions for this date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

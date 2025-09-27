import { useState, useMemo, useEffect } from "preact/hooks";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { formatCurrency, currencySymbol, formatValue } from "@lib/currency";
import { computeDailyReport } from "@services/reports";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

export default function EndOfDay(_props: { path?: string }) {
  const nav = route;
  const { currency, tx } = useAppStore();
  const [reportDate, setReportDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [focused, setFocused] = useState(0); // 0 = Select date
  const report = useMemo(
    () => computeDailyReport(reportDate, tx),
    [reportDate, tx],
  );
  const { count, sum, fees, first, last, items } = report;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "SoftLeft" || e.key === "Backspace") {
        nav("/menu");
        e.preventDefault();
      } else if (e.key === "SoftRight") {
        route("/settings");
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        const input = document.getElementById("date-input");
        input?.focus();
        (input as HTMLInputElement)?.showPicker?.();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);
  return (
    <section className="space-y-5">
      <Header />
      <div
        tabIndex={0 === focused ? 0 : -1}
        className=" mt-4 p-4 bg-white focus:ring-2 focus:ring-emerald-400"
      >
        <label className="flex flex-row gap-4 justify-between">
          <div className="flex flex-col" >
            <span data-l10n-id="select-date" className="text-2xl mt-2"></span>
            <input
              id="date-input"
              type="date"
              className="mt-2 mb-2 font-semibold border-none py-3"
              value={reportDate}
              onChange={(e) => setReportDate((e.target as HTMLInputElement).value)}
            />
          </div>
          <div className="mt-4 mb-4 p-6 text-center">
            <img src="/assets/icons/calendar.png" className="mx-auto w-12 h-12" />
          </div>
        </label>
      </div>
      <div tabIndex={1 === focused ? 0 : -1} className=" mt-4 p-4 rounded-xl bg-white focus:ring-2 focus:ring-emerald-400">
        <div data-l10n-id="num-transactions" className="text-xl"></div>
        <div className="mt-1 text-lg font-semibold">{String(count)}</div>
      </div>
      <div tabIndex={1 === focused ? 0 : -1} className=" mt-4 p-4 rounded-xl bg-white focus:ring-2 focus:ring-emerald-400">
        <div data-l10n-id="sum-transactions" className="text-xxl"></div>
        <div className="mt-1 text-lg font-semibold">
          {formatCurrency(sum, currency)}
        </div>
      </div>
      <div data-l10n-id="transactions" className="text-2xl space-y-4"></div>
      <div className="overflow-hidden border border-white-10">
        {items.map((t, i) => (
          <li
            key={t.id}
            className={`flex flex-col mt-4 mb-4 rounded-xl py-3 px-4 ${i % 2 === 0 ? "bg-white-10" : "bg-emerald-400-20"}`}
          >
            <div className="flex flex-col">
              <div className="font-semibold text-xl text-green-500">
                {formatCurrency(t.amount, currency)}
              </div>
              <div className="">
                {t.ts.toLocaleString?.() || String(t.ts)}
              </div>
              <div className="">
                {t.id || String(t.id)}
              </div>
              <div className=" text-green-500">
                <span data-l10n-id="transaction-fee">{formatCurrency(t.fee, currency)}</span>
              </div>
            </div>
          </li>
        ))}
        {!items.length && (
          <div className="px-3 py-6 text-center text-white-60">
            No transactions for this date.
          </div>
        )}
        {items.length > 0 && (
          <div className="rounded-4xl bg-green-500 mt-6 px-6 py-6 text-center text-white">
            <span data-l10n-id="email-report">Email report</span>
          </div>
        )}
      </div>
      <Footer />
    </section>
  );
}

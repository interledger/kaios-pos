import { route } from "preact-router";
import { useAppStore, selectTotalBalance } from "@state/AppStore";
import { formatCurrency } from "@lib/currency";
import { useEffect } from "preact/hooks";
export default function Balance(_props: { path?: string }) {
  const nav = route;
  const { currency, tx } = useAppStore();
  const totalBalance = selectTotalBalance({ tx });

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
          className="text-sm text-white-70 hover:text-white"
        >
          ← Back
        </button>
        <div data-l10n-id="balance" className="text-sm text-white-70"></div>
        <div className="w-10" />
      </div>
      <div className="rounded-2xl bg-emerald-500 p-5">
        <div data-l10n-id="total-balance" className="text-sm text-white-70"></div>
        <div className="text-4xl font-bold mt-1">
          {formatCurrency(totalBalance, currency)}
        </div>
      </div>
      <div>
        <h3 data-l10n-id="recent-transactions" className="text-sm text-white-80 mb-2"></h3>
        <ul className="space-y-2">
          {tx.slice(0, 5).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-xl bg-white-5 px-4 py-3"
            >
              <div>
                <div className="font-semibold">
                  {formatCurrency(t.amount, t.currency)}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Fee {formatCurrency(t.fee, t.currency)} •{" "}
                  {t.ts.toLocaleString?.() || String(t.ts)}
                </div>
              </div>
              <div className="text-white-70 text-xs">#{t.id.slice(0, 6)}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

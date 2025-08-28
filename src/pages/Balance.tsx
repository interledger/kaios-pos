import { route } from "preact-router";
import { useAppStore, selectTotalBalance } from "@state/AppStore";
import { formatCurrency } from "@lib/currency";
import { useEffect } from "preact/hooks";
export default function Balance(_props: { path?: string }) {
  const nav = route;
  const { currency, tx } = useAppStore();
  const totalBalance = selectTotalBalance(useAppStore());

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
        <div className="text-sm text-white/70">Balance</div>
        <div className="w-10" />
      </div>
      <div className="rounded-2xl bg-emerald-500/10 p-5">
        <div className="text-sm text-white/70">Total balance</div>
        <div className="text-3xl font-bold mt-1">
          {formatCurrency(totalBalance, currency)}
        </div>
      </div>
      <div>
        <h3 className="text-sm text-white/80 mb-2">Recent transactions</h3>
        <ul className="space-y-2">
          {tx.slice(0, 5).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3"
            >
              <div>
                <div className="font-medium">
                  {formatCurrency(t.amount, t.currency)}
                </div>
                <div className="text-xs text-white/60">
                  Fee {formatCurrency(t.fee, t.currency)} •{" "}
                  {t.ts.toLocaleString?.() || String(t.ts)}
                </div>
              </div>
              <div className="text-white/70 text-xs">#{t.id.slice(0, 6)}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

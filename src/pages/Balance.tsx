import { route } from "preact-router";
import { useAppStore, selectTotalBalance } from "@state/AppStore";
import { formatCurrency, currencySymbol, formatValue } from "@lib/currency";
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
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <a onClick={() => nav("/menu")} className="text-lg">← <span data-l10n-id="back">Back</span></a>
        <div data-l10n-id="balance" className="text-xl font-semibold"></div>
        <div className="w-15" />
      </div>
      <div className="mt-6 rounded-2xl bg-emerald-500 p-4">
        <div data-l10n-id="total-balance" className="text-3xl font-semibold text-green-50"></div>
        <div className="text-4xl font-bold mt-1 text-green-50">
          {formatCurrency(totalBalance, currency)}
        </div>
      </div>
      <div>
        <h3 data-l10n-id="recent-transactions" className="text-2xl font-normal mb-5"></h3>
        <ul className="space-y-2 p-0">
          {tx.slice(0, 10).map((t) => (
            <li
              key={t.id}
              className="flex flex-col mt-4 mb-4 rounded-xl py-3 bg-white px-4"
            >
              <div className="flex flex-row justify-between">
                <div className="flex flex-col">
                  <div className="font-semibold text-xl text-green-500">
                    {formatValue(t.amount)}
                  </div>
                  <div className="">
                    {t.ts.toLocaleString?.() || String(t.ts)}
                  </div>
                </div>
                <div className="text-2xl">{currencySymbol(t.currency)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import { route } from "preact-router";
import { useEffect, useState } from "preact/hooks";
import { useAppStore, selectTotalBalance } from "@state/AppStore";
import { formatCurrency, currencySymbol, formatValue } from "@lib/currency";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";

export default function Balance(_props: { path?: string }) {
  const nav = route;
  const { currency, tx } = useAppStore();
  const totalBalance = selectTotalBalance({ tx });
  const [loadMoreTx, setLoadMoreTx] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "SoftLeft" || e.key === "Backspace") {
        nav("/menu");
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        setLoadMoreTx(true)
        e.preventDefault();
      } else if (e.key === "SoftRight") {
        route("/settings");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);
  return (
    <section className="space-y-4">
      <Header />
      <div className="mt-6 bg-emerald-500 p-4">
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
              className="flex flex-col mt-1 py-3 bg-white px-4"
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
          {loadMoreTx && tx.length > 10 && tx.slice(10).map((t) => (
            <li
              key={t.id}
              className="flex flex-col mt-1 py-3 bg-white px-4"
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
          {!loadMoreTx && (
            <div
              onClick={() => setLoadMoreTx(true)}
              className="w-45 mx-auto text-center p-4  mt-2 text-3xl text-white bg-green-500 font-semibold rounded-4xl"
            >
              <span data-l10n-id="load-more"></span>
            </div>
          )}
        </ul>
      </div>

      <Footer />
    </section>
  );
}

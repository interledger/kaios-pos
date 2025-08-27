import { useEffect } from "preact/hooks";
import { route } from "preact-router";
import { formatCurrency } from "@lib/currency";
import { useAppStore } from "@state/AppStore";
export default function Sell() {
  const nav = route;
  const { currency, amount, setAmount } = useAppStore();
  const onKey = (key: string) => {
    const { amount, setAmount } = useAppStore.getState();

    let newAmount = amount;

    if (key === "C") {
      newAmount = "0";
    } else if (key === "⌫") {
      newAmount = amount.length <= 1 ? "0" : amount.slice(0, -1);
    } else if (key === ".") {
      newAmount = amount.includes(".") ? amount : amount + ".";
    } else if (/^\d$/.test(key)) {
      if (amount === "0") newAmount = key;
      else if (amount.length < 9) newAmount = amount + key;
      // else leave as is
    }

    setAmount(newAmount);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key >= '0' && e.key <= '9') {
        onKey(e.key);
        e.preventDefault();
      } else if (e.key === '.' || e.key === ',') {
        onKey('.');
        e.preventDefault();
      } else if (e.key === 'Backspace') {
        onKey('⌫');
        e.preventDefault();
      } else if (e.key.toLowerCase() === 'c') {
        onKey('C');
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (parseFloat(amount || '0') > 0) {
          nav('/wait-card');
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [amount, nav]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav("/menu")}
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back
        </button>
        <div className="text-sm text-white/70">Sell</div>
        <div className="w-10" />
      </div>
      <div className="rounded-xl bg-white/10 px-4 py-6 text-center">
        <div className="text-4xl font-bold tabular-nums">
          {formatCurrency(parseFloat(amount || "0"), currency)}
        </div>
      </div>
      <button
        onClick={() => nav("/wait-card")}
        className="w-full rounded-xl bg-emerald-500 py-4 text-lg font-semibold disabled:opacity-50"
        disabled={parseFloat(amount || "0") <= 0}
      >
        Continue
      </button>
    </section>
  );
}

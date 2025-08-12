import React from "react";
import { useNavigate } from "react-router-dom";
import { Keypad } from "@components/Keypad";
import { formatCurrency } from "@lib/currency";
import { useAppStore } from "@state/AppStore";
export default function Sell() {
  const nav = useNavigate();
  const { currency, amount, setAmount } = useAppStore();
  const onKey = (key: string) => {
    setAmount((prev) => {
      if (key === "C") return "0";
      if (key === "⌫") return prev.length <= 1 ? "0" : prev.slice(0, -1);
      if (key === ".") {
        if (prev.includes(".")) return prev;
        return prev + ".";
      }
      if (/^\d$/.test(key)) {
        if (prev === "0") return key;
        if (prev.length >= 9) return prev;
        return prev + key;
      }
      return prev;
    });
  };

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
      <div className="rounded-2xl bg-white/10 px-4 py-6 text-center">
        <div className="text-4xl font-bold tabular-nums">
          {formatCurrency(parseFloat(amount || "0"), currency)}
        </div>
      </div>
      <Keypad onKey={onKey} />
      <button
        onClick={() => nav("/wait-card")}
        className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-semibold disabled:opacity-50"
        disabled={parseFloat(amount || "0") <= 0}
      >
        Continue
      </button>
    </section>
  );
}

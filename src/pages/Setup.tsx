import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@state/AppStore";
import { get } from "@lib/paymentPointer";

export default function Setup() {
  const nav = useNavigate();
  const { paymentPointer, setPaymentPointer, setCurrency } = useAppStore();

  const initialPointer = useRef(paymentPointer);

  useEffect(() => {
    if (initialPointer.current && initialPointer.current.trim().length > 0) {
      nav("/menu", { replace: true });
    }
  }, []);

  const valid = paymentPointer.trim().length > 0;

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Merchant setup</h2>
      <label className="block">
        <span className="text-sm text-white/80">Payment pointer</span>
        <input
          className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/40"
          placeholder="e.g., $example.com/alice"
          value={paymentPointer}
          onChange={(e) => setPaymentPointer(e.target.value)}
        />
      </label>
      <button
        onClick={async () => {
          const data = await get(paymentPointer);
          setCurrency(data.assetCode);
          nav("/menu");
        }}
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-500 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </section>
  );
}

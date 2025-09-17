import { h } from "preact";
import { route } from "preact-router";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAppStore } from "@state/AppStore";
import { handlePaymentPointerEnter } from "@lib/paymentPointer";
export default function Settings(_props: { path?: string }) {
  const nav = route;
  const { error, setError, setCurrency, paymentPointer, setPaymentPointer } =
    useAppStore();
  const [paymentPointerInput, setPaymentPointerInput] =
    useState(paymentPointer);

  // handleEnterPress is now handled by handlePaymentPointerEnter helper

  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // lets remove this for now, check again after testing
      // const active = document.activeElement;
      // const isInput = active && (active.tagName === "INPUT" || active.tagName === "SELECT" || active.tagName === "TEXTAREA");
      // !isInput &&  || e.key === "Backspace"
      if (
        e.key === "ArrowLeft" ||
        e.key === "SoftRight" ||
        e.key === "EndCall"
      ) {
        nav("/menu");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav("/menu")}
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back
        </button>
        <div className="text-sm text-white/70">Settings</div>
        <div className="w-10" />
      </div>
      <label className="block">
        <span className="text-sm text-white/80">Payment pointer</span>
        <input
          ref={inputRef}
          className="mt-2 w-full rounded-xl bg-white/10 px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/40"
          placeholder="e.g., $example.com/alice"
          value={paymentPointerInput}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const value = (e.target as HTMLInputElement).value;
              await handlePaymentPointerEnter(value, {
                setError,
                setPaymentPointer,
                setPaymentPointerInput,
                setCurrency,
                nav,
              });
            }
          }}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </label>
    </section>
  );
}

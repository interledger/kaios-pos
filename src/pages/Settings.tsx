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
  const [focused, setFocused] = useState(0); // 0 = input, 1 = delete button
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  // handleEnterPress is now handled by handlePaymentPointerEnter helper

  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const backKeys = ["SoftRight", "EndCall"];
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setFocused((f) => (f + 1) % 2);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setFocused((f) => (f - 1 + 2) % 2);
        e.preventDefault();
      } else if (backKeys.indexOf(e.key) !== -1) {
        nav("/menu");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);

  useEffect(() => {
    if (focused === 0) inputRef.current?.focus();
    else if (focused === 1) deleteBtnRef.current?.focus();
  }, [focused]);
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
        <div className="mt-2">
          <input
            ref={inputRef}
            tabIndex={focused === 0 ? 0 : -1}
            className="w-full rounded-xl bg-white/10 px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/40"
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
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      </label>
      <label className="block">
        <button
          ref={deleteBtnRef}
          tabIndex={focused === 1 ? 0 : -1}
          type="button"
          className="mt-4 w-full rounded-xl bg-red-600 px-3 py-2 text-white text-xs font-semibold hover:bg-red-700"
          onClick={() => {
            setPaymentPointer("");
            setPaymentPointerInput("");
            setError("");
          }}
        >
          Delete payment pointer
        </button>
      </label>
      <label className="block">

      </label>
    </section>
  );
}

import { h } from "preact";
import { route } from "preact-router";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAppStore } from "@state/AppStore";
import { handlePaymentPointerEnter } from "@lib/paymentPointer";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";

export default function PaymentPointer(_props: { path?: string }) {
  const nav = route;
  const {
    error,
    setError,
    currency,
    setCurrency,
    paymentPointer,
    setPaymentPointer,
  } = useAppStore();
  const [paymentPointerInput, setPaymentPointerInput] =
    useState(paymentPointer);
  const [focused, setFocused] = useState(0); // 0 = input, 1 = delete button
  const inputRef = useRef<HTMLInputElement>(null);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const backKeys = ["SoftLeft", "EndCall"];
      if (e.key === "ArrowDown") {
        setFocused((f) => (f + 1) % 2);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setFocused((f) => (f - 1 + 2) % 2);
        e.preventDefault();
      } else if (backKeys.indexOf(e.key) !== -1) {
        nav("/settings");
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
      <Header />
      <div
        className={`flex flex-col p-4 mt-4 ${0 === focused ? "active-item-bg" : ""}`}
      >
        <span className="">Payment pointer</span>
        <div className="flex flex-row mt-2">
          <input
            ref={inputRef}
            tabIndex={focused === 0 ? 0 : -1}
            className="px-2 py-2 flex webkit-fill text-2xl font-semibold border-none rounded-lg "
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
      </div>
      <div className="flex flex-col p-4 mt-4 bg-field ">
        <span className="">Currency</span>
        <div className="flex flex-row mt-2">
          <span>{currency}</span>
        </div>
      </div>
      <div className={`block text-center ${1 === focused ? "bg-red-200" : ""}`}>
        <label className="mx-auto">
          <button
            ref={deleteBtnRef}
            tabIndex={focused === 1 ? 0 : -1}
            type="button"
            className={`mt-4 mb-4 border-none rounded-xl bg-red-600 px-3 py-2 text-white text-xl font-semibold ${1 === focused ? "bg-red-700 border-white " : "border-red-600"}`}
            onClick={() => {
              setPaymentPointer("");
              setPaymentPointerInput("");
              setError("");
            }}
          >
            Delete payment pointer
          </button>
        </label>
      </div>

      <Footer optionBtn={false} />
    </section>
  );
}

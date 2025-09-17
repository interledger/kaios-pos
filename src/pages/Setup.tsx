import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { handlePaymentPointerEnter } from "@lib/paymentPointer";

export default function Setup(_props: { path?: string }) {
  const nav = route;
  const {
    paymentPointer,
    setPaymentPointer,
    setCurrency,
    error,
    setError,
    _hasHydrated,
  } = useAppStore();

  if (!_hasHydrated) {
    return null; // or a loading spinner
  }
  const initialPointer = useRef(paymentPointer);

  const [paymentPointerInput, setPaymentPointerInput] = useState("https://ilp.link/adi");

  useEffect(() => {
    setError("");
    console.log(
      "Setup mounted with pp: ",
      (initialPointer.current, initialPointer.current.trim().length),
    );
    if (initialPointer.current && initialPointer.current.trim().length > 0) {
      nav("/menu");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (paymentPointer !== "" && paymentPointerInput !== "" && (e.key === "ArrowLeft" || e.key === "Backspace")) {
        console.log("Navigating to menu", paymentPointerInput);
        nav("/menu");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav, paymentPointerInput, paymentPointer]);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  return (
    <section className="space-y-6">
      <h2 data-l10n-id="wallet-setup" className="text-3xl text-center font-extrabold text-black mt-6"></h2>
      <label className="flex flex-col border-green rounded-xl bg-white-10 py-4 px-4 focus:ring-2 focus:ring-emerald-400">
        <span className="text-2xl mt-2" data-l10n-id="payment-pointer"></span>
        <input
          ref={inputRef}
          className="mt-2 border-none  py-3 outline-none "
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

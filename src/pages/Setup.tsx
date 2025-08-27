import { useEffect, useRef } from "preact/hooks";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import {
  get,
  validatePaymentPointer,
  WalletValidationError,
} from "@lib/paymentPointer";
import { tr } from "zod/v4/locales";
import { set } from "zod/v4";

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

  async function handlePaymentPointerChange(
    value: string,
    nav: any,
    setError: (msg: string) => void,
    setCurrency: (code: string) => void,
    setPaymentPointer: (value: string) => void,
  ) {
    setPaymentPointer(value);

    // Validate first
    try {
      validatePaymentPointer(value);
      setError("");
    } catch (error: any) {
      setError(error.message);
      return; // stop if validation fails
    }
  }

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

  async function handleEnterPress(
    paymentPointer: string,
    nav: any,
    setError: (msg: string) => void,
    setCurrency: (code: string) => void,
  ) {
    if (error !== "") return;

    console.log("Handling enter press for payment pointer:", paymentPointer);

    try {
      const data = await get(paymentPointer);
      setCurrency(data.assetCode);
      nav("/menu");
    } catch (error) {
      console.error("Error fetching payment pointer data:", error);
      setError("Invalid payment pointer");
    }
  }

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
          onChange={async (e) => {
            await handlePaymentPointerChange(
              (e.target as HTMLInputElement).value,
              nav,
              setError,
              setCurrency,
              setPaymentPointer,
            );
          }}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // prevent default only for Enter
              await handleEnterPress(
                paymentPointer,
                nav,
                setError,
                setCurrency,
              );
            }
          }}
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </label>
      {/* <button
        onClick={async () => {
          const data = await get(paymentPointer);
          setCurrency(data.assetCode);
          nav("/menu");
        }}
        disabled={!valid}
        className="w-full rounded-2xl bg-emerald-500 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button> */}
    </section>
  );
}

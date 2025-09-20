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
        <a onClick={() => nav("/menu")} className="text-lg">← <span data-l10n-id="back">Back</span></a>
        <div className="text-lg">Settings</div>
        <div className="w-15" />

      </div>
      <div
        tabIndex={0 === focused ? 0 : -1}
        className=" mt-4 p-4 rounded-xl  bg-white focus:ring-2 focus:ring-emerald-400"
        onClick={() => nav("/payment-pointer")}
      >
        <label className="">
          <span className="text-sm text-white/80">Payment pointer</span>
          <div className="mt-2">

          </div>

        </label>
      </div>

    </section>
  );
}

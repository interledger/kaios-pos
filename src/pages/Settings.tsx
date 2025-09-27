import { h } from "preact";
import { route } from "preact-router";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAppStore } from "@state/AppStore";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { PpIcon } from "@components/icons/PpIcon";

export default function Settings(_props: { path?: string }) {
  const nav = route;
  const { error, setError, setCurrency, paymentPointer, setPaymentPointer } =
    useAppStore();
  const [paymentPointerInput, setPaymentPointerInput] =
    useState(paymentPointer);
  const [focused, setFocused] = useState(0); // 0 = input, 1 = delete button
  const inputRef = useRef<HTMLInputElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const deleteBtnRef = useRef<HTMLButtonElement>(null);

  // handleEnterPress is now handled by handlePaymentPointerEnter helper

  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        setFocused((f) => (f + 1) % 2);
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setFocused((f) => (f - 1 + 2) % 2);
        e.preventDefault();
      } else if (e.key === "SoftLeft" || e.key === "Backspace") {
        nav("/menu");
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        nav('/payment-pointer');
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
        tabIndex={0 === focused ? 0 : -1}
        ref={inputRef}
        className={` mt-4 p-4 text-3xl bg-white ${0 === focused ? "active-item-bg" : ""}`}
        onClick={() => nav("/payment-pointer")}
      >
        <label className="flex flex-row">
          <div className="flex mx-4 items-center">
            <PpIcon fill={`${0 === focused ? "white" : "black"}`} />
          </div>
          <div className="flex flex-grow flex-col">
            <span data-l10n-id="menu-payment-pointer"></span>
            <span data-l10n-id={`menu-payment-pointer-hint`} className="text-xl"></span>
          </div>
          <div className="mt-2">
            <svg width="24" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_488_5622)">
                <path d="M8 7.41L12.58 12L8 16.59L9.41 18L15.41 12L9.41 6L8 7.41Z" fill={`${0 === focused ? "white" : "#000000"}`} />
              </g>
              <defs>
                <clipPath id="clip0_488_5622">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </label>
      </div>
      <Footer optionBtn={false} />
    </section>
  );
}

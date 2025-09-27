import { h } from "preact";
import { route } from "preact-router";
import { useEffect, useRef, useState } from "preact/hooks";
import { useAppStore } from "@state/AppStore";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { PpIcon } from "@components/icons/PpIcon";
import { ChevronIcon } from "@components/icons/ChevronIcon";

export default function Settings(_props: { path?: string }) {
  const nav = route;
  const { paymentPointer } = useAppStore();
  const [focused, setFocused] = useState(0); // 0 = input, 1 = delete button

  const items = [
    { key: "pp", path: "/payment-pointer" },
    { key: "language", path: "/language" },
  ];

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
        nav(items[focused].path);
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav, focused]);

  return (
    <section className="space-y-2">
      <Header />
      <div
        tabIndex={0 === focused ? 0 : -1}
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
            <ChevronIcon fill={`${0 === focused ? "white" : "black"}`} />
          </div>
        </label>
      </div>
      <div
        tabIndex={1 === focused ? 0 : -1}
        className={`p-4 text-3xl bg-white ${1 === focused ? "active-item-bg" : ""}`}
        onClick={() => nav("/language")}
      >
        <label className="flex flex-row">
          <div className="flex mx-4 items-center">
            <PpIcon fill={`${1 === focused ? "white" : "black"}`} />
          </div>
          <div className="flex flex-grow flex-col">
            <span data-l10n-id="menu-language"></span>
            <span data-l10n-id={`menu-language-hint`} className="text-xl"></span>
          </div>
          <div className="mt-2">
            <ChevronIcon fill={`${1 === focused ? "white" : "black"}`} />
          </div>
        </label>
      </div>
      <Footer optionBtn={false} />
    </section>
  );
}

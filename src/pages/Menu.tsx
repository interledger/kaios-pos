import { useAppStore } from "@state/AppStore";
import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";

import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { SellIcon } from "@components/icons/SellIcon";
import { BalanceIcon } from "@components/icons/BalanceIcon";
import { EodIcon } from "@components/icons/EodIcon";
import { ChevronIcon } from "@components/icons/ChevronIcon";

export default function Menu(_props: { path?: string }) {
  const nav = route;
  const { paymentPointer } = useAppStore();
  const items = [
    { key: "sell", path: "/sell", icon: "sell.png" },
    { key: "balance", path: "/balance", icon: "balance.png" },
    { key: "eod", path: "/eod", icon: "eod.png" },
    { key: "setup-qr", path: "/setup-qr", icon: "logo.png" },
    { key: "doamne", path: "/settings", icon: "settings.png" },
  ];
  const [focused, setFocused] = useState(0); // 0 = Sell
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (paymentPointer.trim().length == 0) {
      nav("/setup");
    }
  }, []);

  useEffect(() => {
    btnRefs.current[focused]?.focus();
  }, [focused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setFocused((f) => (f + 1) % items.length);
        e.preventDefault();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setFocused((f) => (f - 1 + items.length) % items.length);
        e.preventDefault();
      } else if (e.key === "Enter" || e.key === " ") {
        nav(items[focused].path);
        e.preventDefault();
      } else if (e.key === "SoftRight") {
        route("/settings");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused, nav]);

  return (
    <section className="flex flex-col w-full">
      {/* <Header /> */}
      {items.map((it, i) => (
        <button
          key={it.key}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          tabIndex={i === focused ? 0 : -1}
          onClick={() => nav(it.path)}
          className={`bg-none bg-white py-3 text-left text-3xl menu-height border-none text-black font-semibold ${i === focused ? "active-item-bg" : ""}`}
        >
          <div className="flex flex-row">
            <div className="flex mx-4 items-center">
              {it.key === 'sell' && <SellIcon fill={`${i === focused ? "white" : "#10b981"}`} />}
              {it.key === 'balance' && <BalanceIcon fill={`${i === focused ? "white" : "#815181"}`} />}
              {it.key === 'eod' && <EodIcon fill={`${i === focused ? "white" : "#FF7A7F"}`} />}
            </div>
            <div className="flex flex-grow flex-col">
              <span data-l10n-id={`menu-${it.key}`}></span>
              <span data-l10n-id={`menu-${it.key}-hint`} className="text-xl"></span>
            </div>
            <div className="flex-none items-center">
              <ChevronIcon fill={`${i === focused ? "white" : "black"}`} />
            </div>
          </div>
        </button>
      ))
      }
      <div className="w-15 h-15" />
      <Footer
        backBtn={false}
      />
    </section >
  );
}

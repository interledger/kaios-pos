import { useAppStore } from "@state/AppStore";
import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";

export default function Menu(_props: { path?: string }) {
  const nav = route;
  const { paymentPointer } = useAppStore();
  const items = [
    { key: "sell", label: "Sell", path: "/sell", hint: "Accept a payment" },
    {
      key: "balance",
      label: "Balance",
      path: "/balance",
      hint: "View recent transactions",
    },
    {
      key: "eod",
      label: "End of day report",
      path: "/eod",
      hint: "Daily totals & email",
    },
    {
      key: "settings",
      label: "Settings",
      path: "/settings",
      hint: "Configure device",
    },
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
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focused, nav]);

  return (
    <section
      className="flex flex-col gap-2 mt-2 w-full max-w-[270px] mx-auto px-1"
      style={{ minWidth: 0 }}
    >
      {items.map((it, i) => (
        <button
          key={it.key}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          tabIndex={i === focused ? 0 : -1}
          onClick={() => nav(it.path)}
          className={`rounded-kai px-2 py-3 text-left shadow-inner transition-colors outline-none
            ${i === focused ? "bg-kaiAccent text-kaiBg" : "bg-white/10 text-kaiText"}
            text-base font-semibold focus:ring-2 focus:ring-kaiAccent`}
          style={{ minWidth: 0 }}
        >
          <div className="flex flex-col">
            <span>{it.label}</span>
            <span className="text-xs text-kaiMuted">{it.hint}</span>
          </div>
        </button>
      ))}
    </section>
  );
}

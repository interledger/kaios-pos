import { useAppStore } from "@state/AppStore";
import { useEffect, useRef, useState } from "preact/hooks";
import { route } from "preact-router";

export default function Menu(_props: { path?: string }) {
  const nav = route;
  const { paymentPointer } = useAppStore();
  const items = [
    { key: "sell", path: "/sell" },
    { key: "balance", path: "/balance" },
    { key: "eod", path: "/eod" },
    { key: "settings", path: "/settings" },
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
      className="flex flex-col gap-2 mt-4 w-full max-w-270 mx-auto px-1"
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
          className={`bg-none bg-white rounded mb-2 px-2 py-3 text-left border-none text-black font-semibold focus:bg-orange-700 ${i === focused ? "item-bg" : ""}`}
        >
          <div className="flex flex-row">
            <div className="flex items-center mx-4">
              <img src={`/assets/icons/${it.key}.png`} alt="" className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span data-l10n-id={`menu-${it.key}`}></span>
              <span data-l10n-id={`menu-${it.key}-hint`} className="text-sm"></span>
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}

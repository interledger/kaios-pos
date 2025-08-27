import { useAppStore } from "@state/AppStore";
import { useEffect } from "preact/hooks";

import { route } from "preact-router";
export default function Menu() {
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
  useEffect(() => {
    console.log("Menu mounted with pp: ", paymentPointer, paymentPointer.trim().length);
    if (paymentPointer.trim().length == 0) {
      console.log("Redirecting to setup");
      nav("/setup", { replace: true });
    }
  }, []);
  return (
    <section className="grid sm:grid-cols-2 gap-4 mt-6">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => nav(it.path)}
          className="rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 p-2 text-left shadow-inner"
        >
          <div className="text-m font-semibold">{it.label}</div>
          <div className="mt-1 text-xs text-white/70">{it.hint}</div>
        </button>
      ))}
    </section>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
export default function Menu() {
  const nav = useNavigate();
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
  return (
    <section className="grid grid-cols-2 gap-4 mt-6">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => nav(it.path)}
          className="rounded-2xl bg-white/10 hover:bg-white/15 active:bg-white/20 p-6 text-left shadow-inner"
        >
          <div className="text-lg font-semibold">{it.label}</div>
          <div className="mt-1 text-xs text-white/70">{it.hint}</div>
        </button>
      ))}
    </section>
  );
}

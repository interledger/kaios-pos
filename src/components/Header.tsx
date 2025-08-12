import React from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "@state/AppStore";
export function Header() {
  const { paymentPointer } = useAppStore();
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <div className="flex items-center gap-2">
        <Link
          to="/menu"
          className="h-8 w-8 rounded-xl bg-emerald-400/20 grid place-items-center"
        >
          <span className="text-emerald-300 font-bold">IL</span>
        </Link>
        <h1 className="text-lg font-semibold">Interledger POS</h1>
      </div>
      <div className="text-xs opacity-80">
        {paymentPointer ? (
          <span className="truncate max-w-[220px] inline-block align-middle">
            {paymentPointer}
          </span>
        ) : (
          <span className="italic">No payment pointer</span>
        )}
      </div>
    </header>
  );
}

import { h } from "preact";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { getLocation } from "@lib/hashHistory";

export function Header() {
  const { paymentPointer } = useAppStore();
  const location = getLocation();
  const isSplash = location.pathname === "/" || location.pathname === "/setup";
  if (isSplash) return null;
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-white-10">
      <div className="flex items-center gap-2">
        <a
          href="/menu"
          className="h-8 w-8 rounded-xl bg-emerald-400-20 grid place-items-center"
          onClick={(e) => {
            e.preventDefault();
            route("/menu");
          }}
        >
          <img src="/assets/icons/app_56.png" alt="logo" className="h-8 w-8" />
        </a>
        <h1 className="text-lg font-semibold">Interledger POS</h1>
      </div>
      <div className="text-xs opacity-80">
        {paymentPointer ? (
          <>
            <span className="truncate max-w-220 align-middle">
              {paymentPointer.split("/").pop()}
            </span>
          </>
        ) : (
          <span className="italic">No payment pointer</span>
        )}
      </div>
    </header>
  );
}

import { h } from "preact";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { getLocation } from "@lib/hashHistory";

export function Header({ title }: { title?: string }) {
  const { paymentPointer } = useAppStore();
  const location = getLocation();
  const isSplash = location.pathname === "/" || location.pathname === "/setup";
  if (isSplash) return null;
  return (
    <header className="flex items-center justify-center px-4 py-2">
      <h1
        data-l10n-id={`menu-${title ? title : location.pathname.replace("/", "")}`}
        className="text-4xl my-2 font-bold text-center"
      ></h1>
    </header>
  );
}

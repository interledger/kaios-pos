import { useEffect } from "preact/hooks";
import { route } from "preact-router";
export default function Splash(_props: { path?: string }) {
  const nav = route;
  useEffect(() => {
    const id = setTimeout(() => nav("/setup"), 900);
    return () => clearTimeout(id);
  }, [nav]);
  return (
    <div className="h-[70vh] grid place-items-center">
      <div className="text-center">
        <div className="text-4xl font-extrabold tracking-tight">
          Interledger POS
        </div>
        <div className="mt-2 text-white/70">Fast · Open · Seamless</div>
        <div className="mt-8 animate-pulse text-sm text-white/60">Loading…</div>
      </div>
    </div>
  );
}

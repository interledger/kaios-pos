import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function Splash() {
  const nav = useNavigate();
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

import { h } from "preact";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { useEffect, useState } from "preact/compat";
export default function Settings(_props: { path?: string }) {
  const nav = route;
  const { currency, setCurrency, paymentPointer, setPaymentPointer } =
    useAppStore();
  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "Backspace") {
        nav("/menu");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nav]);
  const [email, setEmail] = useState("");
  const [reportDate, setReportDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => nav("/menu")}
          className="text-sm text-white/70 hover:text-white"
        >
          ← Back
        </button>
        <div className="text-sm text-white/70">Settings</div>
        <div className="w-10" />
      </div>
      <label className="block">
        <span className="text-sm text-white/80">Payment pointer</span>
        <input
          className="mt-2 w-full rounded-xl bg-white/10 px-2 py-2 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/40"
          placeholder="e.g., $example.com/alice"
          value={paymentPointer}
          onChange={(e) =>
            setPaymentPointer((e.target as HTMLInputElement).value)
          }
        />
      </label>
      <label className="block">
        <span className="text-sm text-white/80">Currency</span>
        <select
          value={currency}
          onChange={(e) => setCurrency((e.target as HTMLSelectElement).value)}
          className="mt-2 w-full rounded-xl bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </label>
      <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">
        <p className="font-medium text-white">About</p>
        <p className="mt-1">Wire up real APIs in src/services/*.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] mt-4">
        <input
          type="email"
          placeholder="Send report to email"
          value={email}
          onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
          className="w-full rounded-2xl bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-white/40"
        />
        <button
          onClick={() =>
            alert(
              `Sending report for ${reportDate} to ${email || "(no email)"}`,
            )
          }
          className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold"
        >
          Send
        </button>
      </div>
    </section>
  );
}

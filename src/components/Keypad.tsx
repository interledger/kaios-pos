import { h } from "preact";
export function Keypad({ onKey }: { onKey: (k: string) => void }) {
  const keys = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ".",
    "0",
    "⌫",
    "C",
  ];
  return (
    <div className="grid grid-cols-3 gap-3 select-none">
      {keys.slice(0, 12).map((k) => (
        <button
          key={k}
          onClick={() => onKey(k)}
          className="rounded-2xl bg-white-10 py-6 text-2xl font-semibold hover:bg-white-15 active:bg-white-20"
        >
          {k}
        </button>
      ))}
      <button
        key={"C"}
        onClick={() => onKey("C")}
        className="col-span-3 rounded-2xl bg-rose-500-80 py-4 text-base font-semibold hover:bg-rose-500"
      >
        Clear
      </button>
    </div>
  );
}

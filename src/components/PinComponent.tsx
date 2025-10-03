import { useEffect, useState } from "preact/hooks";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";

const PIN_LENGTH = 4;

export function PinComponent() {
  const nav = route;
  const { pin, setPin, pinTries, setPinTries } = useAppStore();
  const [localPin, setLocalPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPinTries(0);
    setPin("");
    setLocalPin("");
    setError("");
  }, []);

  const onKey = (key: string) => {
    if (/^\d$/.test(key)) {
      if (localPin.length < PIN_LENGTH) setLocalPin(localPin + key);
    } else if (key === "Backspace" || key === "⌫") {
      setLocalPin(localPin.slice(0, -1));
    } else if (key.toLowerCase() === "c") {
      setLocalPin("");
      setError("");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key >= "0" && e.key <= "9") {
        onKey(e.key);
        e.preventDefault();
      } else if (e.key === "Backspace") {
        onKey("Backspace");
        e.preventDefault();
      } else if (e.key === "SoftLeft") {
        nav("/menu");
        e.preventDefault();
      } else if (e.key.toLowerCase() === "c") {
        onKey("c");
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (localPin.length === PIN_LENGTH) {
          setPin(localPin);
          setPinTries(pinTries + 1);
          if (localPin === "1234") {
            setPin(localPin);
            setError("");
            nav("/menu");
          } else {
            setError("Invalid PIN");
            setPin("");
          }
          setLocalPin("");
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [localPin, nav, pinTries, setPin, setPinTries]);

  return (
    <div className="mt-4 bg-white px-4 py-6 text-center">
      <div className="flex flex-row justify-center tabular-nums text-center text-5xl font-bold tracking-widest">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => {
          return (
            <div key={i} className="w-15">
              {i < localPin.length ? "●" : "○"}
            </div>
          );
        })}
      </div>{localPin} - {pin}
      <div className="mt-2 text-sm text-gray-600">Tries: {pinTries}</div>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}

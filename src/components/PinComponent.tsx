import { useEffect, useState, useCallback } from "preact/hooks";
import { route } from "preact-router";
import { useAppStore } from "@state/AppStore";
import { config } from "@config";

type PinComponentProps = {
  onComplete?: (enteredPin: string, currentTries: number) => void;
  onCancel?: () => void;
};

export function PinComponent({ onComplete, onCancel }: PinComponentProps) {
  const nav = route;
  const { pinTries, setPinTries, setPinVerified } = useAppStore();
  const [localPin, setLocalPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setPinTries(0);
    setPinVerified(false);
    setLocalPin("");
    setError("");
  }, []);

  const onKey = useCallback(
    (key: string) => {
      // Block input if max attempts exceeded
      if (pinTries >= config.pin.maxAttempts) return;

      if (/^\d$/.test(key)) {
        if (localPin.length < config.pin.length) setLocalPin(localPin + key);
      } else if (key === "Backspace" || key === "⌫") {
        setLocalPin(localPin.slice(0, -1));
      } else if (key.toLowerCase() === "c") {
        setLocalPin("");
        setError("");
      }
    },
    [localPin, pinTries],
  );

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
        if (onCancel) onCancel();
        else nav("/menu");
        e.preventDefault();
      } else if (e.key.toLowerCase() === "c") {
        onKey("c");
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (localPin.length === config.pin.length) {
          const newTries = pinTries + 1;
          setPinTries(newTries);
          if (localPin === config.pin.devPin) {
            setError("");
            setPinVerified(true);
            if (onComplete) onComplete(localPin, newTries);
            else nav("/menu");
          } else {
            // Check if max attempts exceeded
            if (newTries >= config.pin.maxAttempts) {
              setError(
                `Maximum PIN attempts (${config.pin.maxAttempts}) exceeded. Transaction cancelled.`,
              );
              setPinVerified(false);
              // Auto-cancel after a short delay
              setTimeout(() => {
                if (onCancel) onCancel();
                else nav("/menu");
              }, 4000);
            } else {
              setError(
                `Invalid PIN (${newTries}/${config.pin.maxAttempts} attempts)`,
              );
              setPinVerified(false);
            }
          }
          setLocalPin("");
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    localPin,
    nav,
    onCancel,
    onComplete,
    onKey,
    pinTries,
    setPinTries,
    setPinVerified,
  ]);

  return (
    <div className="mt-4 bg-white px-4 py-6 text-center">
      <div className="flex flex-row justify-center tabular-nums text-center text-5xl font-bold tracking-widest">
        {Array.from({ length: config.pin.length }).map((_, i) => {
          return (
            <div key={i} className="w-15">
              {i < localPin.length ? "●" : "○"}
            </div>
          );
        })}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Tries left: {config.pin.maxAttempts - pinTries}
      </div>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}

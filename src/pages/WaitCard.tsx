// WaitCard.tsx
import { useEffect, useRef, useCallback, useState } from "preact/hooks";
import { route } from "preact-router";
import { playRingtone } from "@lib/commonHelper";
import { useAppStore } from "@state/AppStore";
import { formatCurrency } from "@lib/currency";


type WaitCardProps = {
  decrement?: (tag: any) => void;
  playRingtone?: () => void;
  onTagLost?: (e: any) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  className?: string;
};

export default function WaitCard({
  path,
  decrement,
  playRingtone,
  onTagLost,
  onCancel,
  autoFocus = true,
  className = "",
}: { path?: string } & WaitCardProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const { currency, amount, } = useAppStore();
  const [readerState, setReaderState] = useState('lost');
  const handleTagFound = useCallback(
    (event: any) => {
      const { tag } = event;
      console.log("NfcDemo tag found:", tag);

      if (!tag) return;

      // UX feedback
      if ("vibrate" in navigator) navigator.vibrate?.(100);
      playRingtone?.();

      // Your logic: only act on MIFARE-Classic
      if (
        Array.isArray(tag.techList) &&
        tag.techList.includes("MIFARE-Classic")
      ) {
        // prevent default so mozNfc doesn't immediately fire taglost
        if (typeof event.preventDefault === "function") {
          try {
            event.preventDefault();
          } catch { }
        }
        decrement?.(tag);
      }
    },
    [decrement, playRingtone],
  );

  const handleTagLost = useCallback(
    (event: any) => {
      console.log("NfcDemo tag lost:", event);
      onTagLost?.(event);
    },
    [onTagLost],
  );

  useEffect(() => {
    if (autoFocus) {
      const panel = panelRef.current;
      setTimeout(() => panel?.focus(), 0);
    }

    let nfc: typeof window.navigator.mozNfc | undefined;
    try {
      nfc = window.navigator.mozNfc;
      if (!nfc) throw new Error("mozNfc not available");
      nfc.ontagfound = handleTagFound;
      nfc.ontaglost = handleTagLost;
      return () => {
        if (nfc) {
          nfc.ontagfound = null;
          nfc.ontaglost = null;
        }
      };
    } catch (err) {
      console.log("mozNfc not available or error:", err);
      console.log("run later from here a cancel process function if needed");
      // commenting out this for now.
      //onCancel?.(); // Uncomment if we want to auto-cancel when NFC is not available
    }
  }, [autoFocus, handleTagFound, handleTagLost, onCancel]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      if (
        e.key === "Backspace" ||
        e.key === "ArrowLeft" ||
        e.key === "SoftRight" || //lets see if this works.
        e.key === "EndCall"      //lets see if this works.
      ) {
        route("/sell");
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className={`${className}`}
    >
      <div className="flex items-center justify-between">
        <a onClick={() => route("/menu")} className="text-lg">← Back</a>
        <div className="text-lg">Sell</div>
        <div className="w-10" />
      </div>
      <div className="flex flex-col mt-4 rounded-2xl py-8 bg-white ">
        <h2 className="mt-4 mb-2 px-4 text-3xl text-center font-semibold">Hold card near the reader</h2>
        <p className="text-lg my-1 text-center">
          {formatCurrency(parseFloat(amount || "0"), currency)}
        </p>
        <div className="mt-4 mb-4 text-center">
          <img src="/assets/icons/debit-card.png" className="mx-auto w-64 h-64" />
        </div>
      </div>
    </div>
  );
}

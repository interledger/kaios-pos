// WaitCard.tsx
import { useEffect, useRef, useCallback } from "preact/hooks";
import { route } from "preact-router";

declare global {
  interface Navigator {
    mozNfc?: {
      ontagfound: ((e: any) => void) | null;
      ontaglost: ((e: any) => void) | null;
    };
  }
}

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
      className={`rounded-2xl p-6 bg-white/5 ring-1 ring-white/10 ${className}`}
    >
      <h2 className="text-lg font-semibold">Hold card near the reader</h2>
      <p className="mt-2 text-white/70">
        Waiting for an NFC card… keep it in the field until confirmed.
      </p>
    </div>
  );
}

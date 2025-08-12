// WaitCard.tsx
import React, { useEffect, useRef, useCallback } from "react";

declare global {
  interface Navigator {
    mozNfc?: {
      ontagfound: ((e: any) => void) | null;
      ontaglost: ((e: any) => void) | null;
    };
  }
}

type WaitCardProps = {
  decrement: (tag: any) => void;
  playRingtone?: () => void;
  onTagLost?: (e: any) => void;
  autoFocus?: boolean;
  className?: string;
};

export default function WaitCard({
  decrement,
  playRingtone,
  onTagLost,
  autoFocus = true,
  className = "",
}: WaitCardProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleTagFound = useCallback((event: any) => {
    const { tag } = event;
    console.log("NfcDemo tag found:", tag);

    if (!tag) return;

    // UX feedback
    if ("vibrate" in navigator) navigator.vibrate?.(100);
    playRingtone?.();

    // Your logic: only act on MIFARE-Classic
    if (Array.isArray(tag.techList) && tag.techList.includes("MIFARE-Classic")) {
      // prevent default so mozNfc doesn't immediately fire taglost
      if (typeof event.preventDefault === "function") {
        try { event.preventDefault(); } catch {}
      }
      decrement(tag);
    }
  }, [decrement, playRingtone]);

  const handleTagLost = useCallback((event: any) => {
    console.log("NfcDemo tag lost:", event);
    onTagLost?.(event);
  }, [onTagLost]);

  useEffect(() => {
    if (autoFocus) {
      const panel = panelRef.current;
      // tiny delay can help some browsers
      setTimeout(() => panel?.focus(), 0);
    }

    const nfc = window.navigator.mozNfc;
    if (!nfc) {
      console.warn("mozNfc not available on this device/browser.");
      return;
    }

    nfc.ontagfound = handleTagFound;
    nfc.ontaglost = handleTagLost;

    return () => {
      // cleanup
      if (nfc) {
        nfc.ontagfound = null;
        nfc.ontaglost = null;
      }
    };
  }, [autoFocus, handleTagFound, handleTagLost]);

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

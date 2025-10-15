import { useCallback, useEffect } from "preact/hooks";
import type { MozNFCTag } from "@lib/card/service";

interface UseNfcReaderProps {
  onTagFound: (tag: MozNFCTag) => void;
  onTagLost?: (event: any) => void;
  onPlayRingtone?: () => void;
  autoFocus?: boolean;
  panelRef?: { current: HTMLElement | null };
}

export function useNfcReader({
  onTagFound,
  onTagLost,
  onPlayRingtone,
  autoFocus = true,
  panelRef,
}: UseNfcReaderProps) {
  const handleTagFound = useCallback(
    (event: any) => {
      const { tag } = event;

      if (!tag) return;

      // UX feedback
      if ("vibrate" in navigator) navigator.vibrate?.(100);
      onPlayRingtone?.();

      if (
        Array.isArray(tag.techList) &&
        tag.techList.indexOf("ISO-DEP") !== -1
      ) {
        // Prevent default so mozNfc doesn't immediately fire taglost
        if (typeof event.preventDefault === "function") {
          try {
            event.preventDefault();
          } catch {}
        }

        onTagFound(tag as MozNFCTag);
      }
    },
    [onTagFound, onPlayRingtone],
  );

  const handleTagLost = useCallback(
    (event: any) => {
      onTagLost?.(event);
    },
    [onTagLost],
  );

  useEffect(() => {
    if (autoFocus && panelRef) {
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
      // NFC not available - could auto-cancel here if needed
    }
  }, [autoFocus, handleTagFound, handleTagLost, panelRef]);

  return {
    handleTagFound,
    handleTagLost,
  };
}

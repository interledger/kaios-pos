// WaitCard.tsx
import { useEffect, useRef, useCallback, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  createTransactionData,
  createGenerateACCommand,
  uint8ArrayToHexString,
  APDU_COMMANDS,
  hexStringToUint8Array,
  extractRawDataFromAPDU,
} from "@lib/generateAC";
import {
  createPaymentServiceData,
  sendPaymentToRafiki,
} from "@lib/paymentService";
import { useAppStore } from "@state/AppStore";
import { playRingtone } from "@lib/commonHelper";
import { formatCurrency } from "@lib/currency";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { PinComponent } from "@components/PinComponent";
import { statuses } from "@constants/statuses";
import { TransactionStatus } from "@components/TransactionStatus";


interface MozNFCTag {
  id: Uint8Array;
  techList: string[];
  isLost: boolean;
  selectTech: (techType: string) => any;
}

interface MozNFCTech {
  transceive: (data: Uint8Array) => Promise<Uint8Array>;
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
  const { currency, paymentPointer, amount, signSecret } = useAppStore();

  const [transactionStatus, setTransactionStatus] = useState(0);

  const sendAPDUCommands = useCallback(
    async (tag: MozNFCTag) => {
      try {
        console.log("Starting APDU communication with tag...");

        if (tag.techList.indexOf("ISO-DEP") === -1) {
          console.error("Tag does not support ISO-DEP protocol");
          return;
        }

        const tech = tag.selectTech("ISO-DEP");
        if (!tech) {
          console.error("Failed to select ISO-DEP technology");
          return;
        }

        console.log("Selected ISO-DEP technology, tech object:", tech);

        // Send SELECT PPSE command
        const selectPPSE = hexStringToUint8Array(APDU_COMMANDS.SELECT_PPSE);
        await tech.transceive(selectPPSE);

        const now = new Date();
        const timestamp = now.getTime(); // UTC timestamp
        const amountInCents = Math.floor(parseFloat(amount || "0") * 100);
        const transactionData = createTransactionData(
          amountInCents,
          paymentPointer,
        );

        const generateAC = createGenerateACCommand(transactionData);

        const rawData = extractRawDataFromAPDU(generateAC);

        console.log("=== GENERATE AC COMMAND ===");
        console.log(uint8ArrayToHexString(generateAC));

        const generateResponse = await tech.transceive(generateAC);

        console.log("=== GENERATE AC RESPONSE ===");
        console.log(uint8ArrayToHexString(generateResponse));

        // Create payment json to be sent to rafiki
        const paymentData = createPaymentServiceData(
          transactionData,
          generateResponse,
          rawData,
          timestamp,
        );

        console.log("=== Rafiki payment JSON ===");
        console.log(JSON.stringify(paymentData, null, 2));

        // Send payment to Rafiki POS service
        const rafikiResult = await sendPaymentToRafiki(paymentData, signSecret);

        if (rafikiResult.success) {
          console.log("Payment sent to Rafiki successfully!");
          // Play success sound
          playRingtone?.();
        } else {
          console.error(
            "Failed to send payment to Rafiki:",
            rafikiResult.error,
          );
        }

        console.log("APDU communication completed successfully");
      } catch (error) {
        console.error("Error during APDU communication:", error);
      }
    },
    [amount, paymentPointer, signSecret],
  );
  const [readerState, setReaderState] = useState("lost");
  const handleTagFound = useCallback(
    (event: any) => {
      console.log("event", event);
      const { tag } = event;
      console.log("NfcDemo tag found:", tag);

      if (!tag) return;

      // UX feedback
      if ("vibrate" in navigator) navigator.vibrate?.(100);
      playRingtone?.();

      if (
        Array.isArray(tag.techList) &&
        tag.techList.indexOf("ISO-DEP") !== -1
      ) {
        console.log("Tag supports ISO-DEP, starting APDU communication...");
        console.log("Available technologies:", tag.techList);
        console.log("Tag object methods:", Object.getOwnPropertyNames(tag));

        // prevent default so mozNfc doesn't immediately fire taglost
        if (typeof event.preventDefault === "function") {
          try {
            event.preventDefault();
          } catch { }
        }

        // Send APDU commands
        sendAPDUCommands(tag as MozNFCTag);
      } else {
        console.log(
          "Tag does not support required technologies:",
          tag.techList,
        );
      }
    },
    [decrement, playRingtone, sendAPDUCommands],
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
        e.key === "SoftLeft" ||
        e.key === "EndCall" //lets see if this works.
      ) {
        route("/sell");
        e.preventDefault();
      } else if (e.key === "Enter") {
        setTransactionStatus((s) => (s + 1) % statuses.length);
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
      <Header title="wait-card" />
      {transactionStatus === 4 && (
        <PinComponent />
      )}
      {transactionStatus < 4 && (
        <TransactionStatus
          transactionStatus={transactionStatus}
          amount={amount}
          currency={currency}
        />
      )}
      <Footer selectBtn={false} optionBtn={false} />
    </div>
  );
}

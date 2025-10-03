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
  sendPaymentToPosService,
} from "@lib/paymentService";
import { useAppStore } from "@state/AppStore";
import { playRingtone } from "@lib/commonHelper";
import { formatCurrency } from "@lib/currency";
import { Header } from "@components/Header";
import { Footer } from "@components/Footer";
import { PinComponent } from "@components/PinComponent";
import { statuses } from "@constants/statuses";
import { TransactionStatus } from "@components/TransactionStatus";
import type { PaymentServiceData } from "@lib/paymentService";

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
  const {
    currency,
    paymentPointer,
    amount,
    signSecret,
    pinVerified,
    setPinVerified,
  } = useAppStore();
  const [preparedPayment, setPreparedPayment] =
    useState<PaymentServiceData | null>(null);

  // 0: waiting for card, 4: pin, 1: processing, 2: complete, 3: failed
  const [transactionStatus, setTransactionStatus] = useState(0);

  const sendAPDUCommands = useCallback(
    async (tag: MozNFCTag): Promise<PaymentServiceData | null> => {
      try {
        console.log("Starting APDU communication with tag...");

        if (tag.techList.indexOf("ISO-DEP") === -1) {
          console.error("Tag does not support ISO-DEP protocol");
          return null;
        }

        const tech = tag.selectTech("ISO-DEP");
        if (!tech) {
          console.error("Failed to select ISO-DEP technology");
          return null;
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

        // Create payment json to be sent to pos service
        const paymentData = createPaymentServiceData(
          transactionData,
          generateResponse,
          rawData,
          timestamp,
        );
        console.log("=== POS SERVICE payment JSON (prepared) ===");
        console.log(JSON.stringify(paymentData, null, 2));

        console.log(
          "APDU communication completed successfully; payment prepared",
        );
        return paymentData;
      } catch (error) {
        console.error("Error during APDU communication:", error);
        setTransactionStatus(3); // failed
        return null;
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
          } catch {}
        }

        // Decide PIN requirement by amount
        const amountNumber = parseFloat(amount || "0");
        const pinThreshold = 100; // threshold for requiring PIN
        const requirePin = amountNumber > pinThreshold && !pinVerified;

        // Show processing while talking to the card
        setTransactionStatus(1);

        (async () => {
          const paymentData = await sendAPDUCommands(tag as MozNFCTag);
          if (!paymentData) return;
          setPreparedPayment(paymentData);

          if (requirePin) {
            setTransactionStatus(4);
          } else {
            // Send directly to POS SERVICE
            const posServiceResult = await sendPaymentToPosService(
              paymentData,
              signSecret,
            );
            if (posServiceResult.success) {
              console.log("Payment sent to POS SERVICE!");
              playRingtone?.();
              setPinVerified(false);
              setPreparedPayment(null);
              setTransactionStatus(2);
            } else {
              console.error(
                "Failed to send payment to POS SERVIEC:",
                posServiceResult.error,
              );
              setTransactionStatus(3);
            }
          }
        })();
      } else {
        console.log(
          "Tag does not support required technologies:",
          tag.techList,
        );
      }
    },
    [
      decrement,
      playRingtone,
      sendAPDUCommands,
      amount,
      pinVerified,
      signSecret,
    ],
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
        // prevent manual cycling; Enter does nothing here
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={panelRef} tabIndex={-1} className={`${className}`}>
      <Header title="wait-card" />
      {transactionStatus === 4 && (
        <PinComponent
          onComplete={() => {
            // Mark verified and send prepared payment to POS service
            setPinVerified(true);
            if (preparedPayment) {
              setTransactionStatus(1);
              (async () => {
                const posServiceResult = await sendPaymentToPosService(
                  preparedPayment,
                  signSecret,
                );
                if (posServiceResult.success) {
                  playRingtone?.();
                  setPinVerified(false);
                  setPreparedPayment(null);
                  setTransactionStatus(2);
                } else {
                  console.error(
                    "Failed to send payment to POS service:",
                    posServiceResult.error,
                  );
                  setTransactionStatus(3);
                }
              })();
            } else {
              setTransactionStatus(3);
            }
          }}
          onCancel={() => {
            setTransactionStatus(3);
          }}
        />
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

// WaitCard.tsx
import { useEffect, useRef, useCallback, useState } from "preact/hooks";
import { route } from "preact-router";
import {
  createTransactionData,
  createGenerateACCommand,
  APDU_COMMANDS,
  hexStringToUint8Array,
  parseGPOResponse,
  parseReadRecordResponse,
} from "@lib/generateAC";
import { uint8ArrayToHex } from "@interledger/tlv-kit";
import {
  createPaymentServiceData,
  createPosServicePayload,
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
    pinTries,
    pinVerified,
    pinThreshold,
    setPinVerified,
    setPinTries,
  } = useAppStore();
  const [preparedPayment, setPreparedPayment] =
    useState<PaymentServiceData | null>(null);
  const [cardResponse, setCardResponse] = useState<{
    generateResponse: Uint8Array;
    transactionData: any;
    timestamp: number;
  } | null>(null);

  // 0: waiting for card, 4: pin, 1: processing, 2: complete, 3: failed
  const [transactionStatus, setTransactionStatus] = useState(0);

  const sendAPDUCommands = useCallback(
    async (
      tag: MozNFCTag,
    ): Promise<{
      generateResponse: Uint8Array;
      transactionData: any;
      timestamp: number;
    } | null> => {
      try {
        if (tag.techList.indexOf("ISO-DEP") === -1) {
          console.error("Tag does not support ISO-DEP protocol");
          return null;
        }

        const tech = tag.selectTech("ISO-DEP");
        if (!tech) {
          console.error("Failed to select ISO-DEP technology");
          return null;
        }

        // Send SELECT PPSE command
        const selectPPSE = hexStringToUint8Array(APDU_COMMANDS.SELECT_PPSE);
        await tech.transceive(selectPPSE);

        // Send GET PROCESSING OPTIONS command
        const gpoCommand = hexStringToUint8Array(
          APDU_COMMANDS.GET_PROCESSING_OPTIONS,
        );
        console.log("[GPO Command]", uint8ArrayToHex(gpoCommand));
        const gpoResponse = await tech.transceive(gpoCommand);
        console.log("[GPO Response]", uint8ArrayToHex(gpoResponse));

        // Parse GPO response to extract ATC
        const atc = parseGPOResponse(gpoResponse);
        if (atc === null) {
          console.error("Failed to extract ATC from GPO response");
          setTransactionStatus(3); // failed
          return null;
        }

        // Send READ RECORD command
        const readRecordCommand = hexStringToUint8Array(
          APDU_COMMANDS.READ_RECORD,
        );
        console.log(
          "[READ RECORD Command]",
          uint8ArrayToHex(readRecordCommand),
        );
        const readRecordResponse = await tech.transceive(readRecordCommand);
        console.log(
          "[READ RECORD Response]",
          uint8ArrayToHex(readRecordResponse),
        );

        // Parse READ RECORD response to extract sender wallet address
        const senderWallet = parseReadRecordResponse(readRecordResponse);
        if (!senderWallet) {
          console.error(
            "Failed to extract sender wallet from READ RECORD response",
          );
          setTransactionStatus(3); // failed
          return null;
        }

        const now = new Date();
        const timestamp = now.getTime(); // UTC timestamp
        const amountInCents = Math.floor(parseFloat(amount || "0") * 100);
        const transactionData = createTransactionData(
          amountInCents,
          paymentPointer,
          atc,
          senderWallet,
        );

        const generateAC = createGenerateACCommand(transactionData);

        console.log("[Generate AC Command]", uint8ArrayToHex(generateAC));

        const generateResponse = await tech.transceive(generateAC);

        console.log(
          "[Generate AC Response]",
          uint8ArrayToHex(generateResponse),
        );

        // Return card response data - don't create payload yet
        return {
          generateResponse,
          transactionData,
          timestamp,
        };
      } catch (error) {
        console.error("Error during APDU communication:", error);
        setTransactionStatus(3); // failed
        return null;
      }
    },
    [amount, paymentPointer, signSecret, pinTries, pinThreshold],
  );
  const [readerState, setReaderState] = useState("lost");
  const handleTagFound = useCallback(
    (event: any) => {
      const { tag } = event;

      if (!tag) return;

      // UX feedback
      if ("vibrate" in navigator) navigator.vibrate?.(100);
      playRingtone?.();

      if (
        Array.isArray(tag.techList) &&
        tag.techList.indexOf("ISO-DEP") !== -1
      ) {
        // prevent default so mozNfc doesn't immediately fire taglost
        if (typeof event.preventDefault === "function") {
          try {
            event.preventDefault();
          } catch {}
        }

        // Show processing while talking to the card
        setTransactionStatus(1);

        (async () => {
          // Step 1: Talk to card (always happens first)
          const cardData = await sendAPDUCommands(tag as MozNFCTag);
          if (!cardData) return;

          // Step 2: Check if PIN is required
          const amountNumber = parseFloat(amount || "0");
          const requirePin = amountNumber > pinThreshold && !pinVerified;

          if (requirePin) {
            // Step 3a: PIN required - store card response and show PIN entry
            setCardResponse(cardData);
            setTransactionStatus(4);
          } else {
            // Step 3b: No PIN required - create payload and send immediately
            const posServicePayload = createPosServicePayload(
              cardData.generateResponse,
              cardData.transactionData,
              undefined, // No PIN
              undefined, // No PIN tries
            );

            const paymentData = createPaymentServiceData(
              cardData.transactionData,
              cardData.generateResponse,
              posServicePayload,
              cardData.timestamp,
            );

            const posServiceResult = await sendPaymentToPosService(
              paymentData,
              signSecret,
            );

            if (posServiceResult.success) {
              playRingtone?.();
              setPinVerified(false);
              setPinTries(0);
              setTransactionStatus(2);
            } else {
              setPinVerified(false);
              setPinTries(0);
              setTransactionStatus(3);
            }
          }
        })();
      }
    },
    [
      decrement,
      playRingtone,
      sendAPDUCommands,
      amount,
      pinVerified,
      pinThreshold,
      signSecret,
      setPinVerified,
      setPinTries,
      setCardResponse,
    ],
  );

  const handleTagLost = useCallback(
    (event: any) => {
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
      // NFC not available - could auto-cancel here if needed
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
          onComplete={(enteredPin, currentTries) => {
            // Mark verified and create payload with PIN
            setPinVerified(true);

            if (cardResponse) {
              setTransactionStatus(1);
              (async () => {
                // Now create the POS Service Payload WITH PIN
                const posServicePayload = createPosServicePayload(
                  cardResponse.generateResponse,
                  cardResponse.transactionData,
                  enteredPin, // Use the PIN directly from the callback!
                  currentTries, // Use the current tries count from the callback!
                );

                const paymentData = createPaymentServiceData(
                  cardResponse.transactionData,
                  cardResponse.generateResponse,
                  posServicePayload,
                  cardResponse.timestamp,
                );

                // Send to POS SERVICE
                const posServiceResult = await sendPaymentToPosService(
                  paymentData,
                  signSecret,
                );

                if (posServiceResult.success) {
                  playRingtone?.();
                  setPinVerified(false);
                  setPinTries(0);
                  setCardResponse(null);
                  setTransactionStatus(2);
                } else {
                  setPinVerified(false);
                  setPinTries(0);
                  setCardResponse(null);
                  setTransactionStatus(3);
                }
              })();
            } else {
              setPinVerified(false);
              setPinTries(0);
              setTransactionStatus(3);
            }
          }}
          onCancel={() => {
            setPinVerified(false);
            setPinTries(0);
            setCardResponse(null);
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

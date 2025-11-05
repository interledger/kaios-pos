import { useCallback, useState } from "preact/hooks";
import { uint8ArrayToHex } from "@interledger/tlv-kit";
import {
  createGenerateACCommand,
  createTransactionData,
  type TransactionData,
} from "@lib/card/commands/generateAC";
import {
  createGetProcessingOptionsCommand,
  parseGetProcessingOptionsResponse,
} from "@lib/card/commands/getProcessingOptions";
import {
  createReadRecordCommand,
  parseReadRecordResponse,
} from "@lib/card/commands/readRecord";
import { initializeCard, transceive, type MozNFCTag } from "@lib/card/service";
import { sendPayment } from "@lib/posService";
import { TransactionStatus } from "@constants/statuses";
import { useAppStore } from "../state/AppStore";

interface CardResponse {
  generateResponse: Uint8Array;
  transactionData: TransactionData;
  timestamp: number;
}

interface UseCardPaymentProps {
  amount: string | undefined;
  paymentPointer: string;
  signSecret: string;
  pinThreshold: number;
  pinVerified: boolean;
  onSuccess?: () => void;
  onPlayRingtone?: () => void;
  onResetPin: () => void;
}

export function useCardPayment({
  amount,
  paymentPointer,
  signSecret,
  pinThreshold,
  pinVerified,
  onSuccess,
  onPlayRingtone,
  onResetPin,
}: UseCardPaymentProps) {
  const [transactionStatus, setTransactionStatus] = useState(
    TransactionStatus.WAITING_FOR_CARD,
  );
  const [cardResponse, setCardResponse] = useState<CardResponse | null>(null);

  const { currency: currencyCode } = useAppStore();

  const processCardCommunication = useCallback(
    async (tag: MozNFCTag): Promise<CardResponse | null> => {
      try {
        // Initialize card with SELECT PPSE
        await initializeCard(tag);

        // Send GET PROCESSING OPTIONS command
        const gpoCommand = createGetProcessingOptionsCommand();
        console.log("[GPO Command]", uint8ArrayToHex(gpoCommand));
        const gpoResponse = await transceive(tag, gpoCommand);
        console.log("[GPO Response]", uint8ArrayToHex(gpoResponse));

        // Parse GPO response to extract ATC
        const atc = parseGetProcessingOptionsResponse(gpoResponse);
        if (atc === null) {
          console.error("Failed to extract ATC from GPO response");
          setTransactionStatus(TransactionStatus.FAILED);
          return null;
        }

        // Send READ RECORD command
        const readRecordCommand = createReadRecordCommand();
        console.log(
          "[READ RECORD Command]",
          uint8ArrayToHex(readRecordCommand),
        );
        const readRecordResponse = await transceive(tag, readRecordCommand);
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
          setTransactionStatus(TransactionStatus.FAILED);
          return null;
        }

        const now = new Date();
        const timestamp = now.getTime(); // UTC timestamp
        const amountInCents = Math.floor(parseFloat(amount || "0") * 100);
        const transactionData = createTransactionData(
          amountInCents,
          currencyCode,
          paymentPointer,
          atc,
          senderWallet,
        );

        const generateAC = createGenerateACCommand(transactionData);

        console.log("[Generate AC Command]", uint8ArrayToHex(generateAC));

        const generateResponse = await transceive(tag, generateAC);

        console.log(
          "[Generate AC Response]",
          uint8ArrayToHex(generateResponse),
        );

        return {
          generateResponse,
          transactionData,
          timestamp,
        };
      } catch (error) {
        console.error("Error during APDU communication:", error);
        setTransactionStatus(TransactionStatus.FAILED);
        return null;
      }
    },
    [amount, paymentPointer],
  );

  const processPayment = useCallback(
    async (
      cardData: CardResponse,
      pin?: string,
      pinTries?: number,
    ): Promise<void> => {
      const result = await sendPayment(
        cardData.generateResponse,
        cardData.transactionData,
        cardData.timestamp,

        signSecret,
        pin,
        pinTries,
      );

      if (result.success) {
        onPlayRingtone?.();
        onResetPin();
        setCardResponse(null);
        setTransactionStatus(TransactionStatus.COMPLETE);
        onSuccess?.();
      } else {
        onResetPin();
        setCardResponse(null);
        setTransactionStatus(TransactionStatus.FAILED);
      }
    },
    [signSecret, onPlayRingtone, onResetPin, onSuccess],
  );

  const processCard = useCallback(
    async (tag: MozNFCTag) => {
      setTransactionStatus(TransactionStatus.PROCESSING);

      const cardData = await processCardCommunication(tag);
      if (!cardData) return;

      // Check if PIN is required
      const amountNumber = parseFloat(amount || "0");
      const requirePin = amountNumber > pinThreshold && !pinVerified;

      if (requirePin) {
        // PIN required - store card response and show PIN entry
        setCardResponse(cardData);
        setTransactionStatus(TransactionStatus.PIN_ENTRY);
      } else {
        // No PIN required - send payment immediately
        await processPayment(cardData);
      }
    },
    [
      processCardCommunication,
      processPayment,
      amount,
      pinThreshold,
      pinVerified,
    ],
  );

  const handlePinComplete = useCallback(
    (enteredPin: string, currentTries: number) => {
      if (!cardResponse) {
        onResetPin();
        setTransactionStatus(TransactionStatus.FAILED);
        return;
      }

      setTransactionStatus(TransactionStatus.PROCESSING);

      (async () => {
        await processPayment(cardResponse, enteredPin, currentTries);
      })();
    },
    [cardResponse, processPayment, onResetPin],
  );

  const handlePinCancel = useCallback(() => {
    onResetPin();
    setCardResponse(null);
    setTransactionStatus(TransactionStatus.FAILED);
  }, [onResetPin]);

  return {
    transactionStatus,
    processCard,
    handlePinComplete,
    handlePinCancel,
  };
}

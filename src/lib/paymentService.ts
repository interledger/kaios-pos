import type { TransactionData } from "./generateAC";

// Payment data to be sent to Rafiki
export interface PaymentServiceData {
  signature: string; // hex string (GEN AC result)
  payload: string; // hex string (GEN AC payload - raw data only)
  amount: {
    value: string; // amount in cents as string
    assetScale: number; // transaction currency exponent
    assetCode: string; // currency code
  };
  senderWalletAddress: string;
  receiverWalletAddress: string;
  timestamp: number; // UTC timestamp from Date.getTime()
}

export function createPaymentServiceData(
  transactionData: TransactionData,
  signature: Uint8Array, // APDU response
  payload: Uint8Array, // Raw data sent to card
  timestamp: number, // UTC timestamp
): PaymentServiceData {
  return {
    signature: uint8ArrayToHexString(signature),
    payload: uint8ArrayToHexString(payload),
    amount: {
      value: transactionData.amount.toString(), // Already in cents
      assetScale: transactionData.transactionCurrencyExponent,
      assetCode: transactionData.currencyCode,
    },
    senderWalletAddress: transactionData.senderWalletAddress,
    receiverWalletAddress: transactionData.receiverWalletAddress,
    timestamp: timestamp,
  };
}

// Helper function to convert Uint8Array to hex string
function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => {
      const hex = byte.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
}

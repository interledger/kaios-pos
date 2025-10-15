import { hexToUint8Array } from "@interledger/tlv-kit";
import {
  createBCDAmount,
  currencyCodeToBytes,
  dateStringToBytes,
  timeStringToBytes,
  numberTo4Bytes,
  numberTo2Bytes,
} from "../utils";

export interface TransactionData {
  applicationTransactionCounter: number; // ATC - 2 bytes
  amount: number;
  currencyCode: string;
  transactionCurrencyExponent: number;
  date: string;
  time: string;
  unpredictableNumber: number;
  senderWalletAddress: string;
  receiverWalletAddress: string;
}

// GENERATE AC APDU command header (will be completed with raw data)
const GENERATE_AC_APDU_HEADER = "80AEC100";

/**
 * Creates transaction data for a payment
 * @param amount - Amount in cents
 * @param receiverWalletAddress - The receiver's wallet address
 * @param applicationTransactionCounter - The ATC from the card
 * @param senderWalletAddress - The sender's wallet address
 * @returns TransactionData object
 */
export function createTransactionData(
  amount: number,
  receiverWalletAddress: string,
  applicationTransactionCounter: number,
  senderWalletAddress: string,
): TransactionData {
  const now = new Date();
  const year = now.getFullYear() % 100;
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();

  // Generate random 4-byte unpredictable number
  const unpredictableNumber = Math.floor(Math.random() * 0x100000000); // 0 to 0xffffffff

  return {
    applicationTransactionCounter,
    amount,
    currencyCode: "EUR",
    transactionCurrencyExponent: 2,
    date: `${year.toString().padStart(2, "0")}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`,
    time: `${hour.toString().padStart(2, "0")}${minute.toString().padStart(2, "0")}${second.toString().padStart(2, "0")}`,
    unpredictableNumber: unpredictableNumber,
    senderWalletAddress: senderWalletAddress,
    receiverWalletAddress: receiverWalletAddress,
  };
}

/**
 * Creates the GENERATE AC APDU command
 * @param transactionData - The transaction data
 * @returns The GENERATE AC command as Uint8Array
 */
export function createGenerateACCommand(
  transactionData: TransactionData,
): Uint8Array {
  // Convert transaction data to raw bytes for CDOL (concatenated, not TLV)
  const atcData = numberTo2Bytes(transactionData.applicationTransactionCounter);
  const amountData = createBCDAmount(transactionData.amount / 100);
  const currencyData = currencyCodeToBytes(transactionData.currencyCode);
  const exponentData = new Uint8Array([
    transactionData.transactionCurrencyExponent,
  ]);
  const dateData = dateStringToBytes(transactionData.date);
  const timeData = timeStringToBytes(transactionData.time);
  const unpredictableData = numberTo4Bytes(transactionData.unpredictableNumber);

  const createPaddedPaymentPointer = (pointer: string): Uint8Array => {
    const asciiData = new Uint8Array(64);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(pointer);
    asciiData.set(encoded, 0);
    return asciiData;
  };

  const recipientData = createPaddedPaymentPointer(
    transactionData.receiverWalletAddress,
  );
  const senderData = createPaddedPaymentPointer(
    transactionData.senderWalletAddress,
  );

  // Combine all raw data fields in order (concatenated, no TLV encoding)
  const rawDataFields = [
    atcData, // 2 bytes - ATC
    amountData, // 6 bytes - Amount
    currencyData, // 2 bytes - Currency
    exponentData, // 1 byte - Exponent
    dateData, // 3 bytes - Date
    timeData, // 3 bytes - Time
    unpredictableData, // 4 bytes - Unpredictable
    recipientData, // 64 bytes - Receiver
    senderData, // 64 bytes - Sender
  ];

  const totalLength = rawDataFields.reduce(
    (sum, field) => sum + field.length,
    0,
  );

  // Concatenate all raw data
  const rawData = new Uint8Array(totalLength);
  let offset = 0;

  for (const field of rawDataFields) {
    rawData.set(field, offset);
    offset += field.length;
  }

  const commandHeader = hexToUint8Array(GENERATE_AC_APDU_HEADER);
  const lc = new Uint8Array([rawData.length]); // Length of data
  const le = new Uint8Array([0x00]); // Expected response length

  const completeCommand = new Uint8Array(
    commandHeader.length + lc.length + rawData.length + le.length,
  );

  let cmdOffset = 0;
  completeCommand.set(commandHeader, cmdOffset);
  cmdOffset += commandHeader.length;
  completeCommand.set(lc, cmdOffset);
  cmdOffset += lc.length;
  completeCommand.set(rawData, cmdOffset);
  cmdOffset += rawData.length;
  completeCommand.set(le, cmdOffset);

  return completeCommand;
}

/**
 * Helper function to extract raw data from APDU command
 * @param apduCommand - The complete APDU command
 * @returns The raw data portion of the command
 */
export function extractRawDataFromAPDU(apduCommand: Uint8Array): Uint8Array {
  // APDU structure: [CLA, INS, P1, P2, LC, DATA..., LE]
  // Raw data starts after the LC byte (5th byte) and excludes the LE byte (last byte)
  const lcIndex = 4; // LC is at index 4
  const lc = apduCommand[lcIndex]; // Length of data
  const dataStart = lcIndex + 1;
  const dataEnd = dataStart + lc;

  return apduCommand.slice(dataStart, dataEnd);
}

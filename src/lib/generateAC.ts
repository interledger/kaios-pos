import {
  TLVParser,
  uint8ArrayToHex,
  hexToUint8Array,
  uint8ArrayToAscii,
} from "@interledger/tlv-kit";
import { EMV_TAGS } from "@constants/emvTags";

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

export const APDU_COMMANDS = {
  SELECT_PPSE: "00A404000AA00000015103010C0601",
  GET_PROCESSING_OPTIONS: "80A8000002830000",
  READ_RECORD: "00B2010C00",
  GENERATE_AC: "80AEC100", // Will be completed with raw data
} as const;

// Re-export from tlv-kit for backwards compatibility
export const hexStringToUint8Array = hexToUint8Array;
export const uint8ArrayToHexString = uint8ArrayToHex;

// Convert amount to BCD format (12 digits, 6 bytes)
export function createBCDAmount(amount: number): Uint8Array {
  const amountStr = Math.floor(amount * 100)
    .toString()
    .padStart(12, "0");

  const bcd = new Uint8Array(6);

  // Convert each pair of decimal digits to BCD
  for (let i = 0; i < 6; i++) {
    const pair = amountStr.substr(i * 2, 2);
    const tens = parseInt(pair[0], 10);
    const ones = parseInt(pair[1], 10);
    bcd[i] = (tens << 4) | ones; // BCD encoding: tens in high nibble, ones in low nibble
  }

  return bcd;
}

export function createDate(date: Date): Uint8Array {
  const year = date.getFullYear() % 100;
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return new Uint8Array([year, month, day]);
}

export function currencyCodeToBytes(_currencyCode: string): Uint8Array {
  // Hardcoded to EUR for now
  return new Uint8Array([0x09, 0x78]);
}

export function numberTo4Bytes(value: number): Uint8Array {
  const bytes = new Uint8Array(4);
  bytes[0] = (value >> 24) & 0xff;
  bytes[1] = (value >> 16) & 0xff;
  bytes[2] = (value >> 8) & 0xff;
  bytes[3] = value & 0xff;
  return bytes;
}

export function dateStringToBytes(dateStr: string): Uint8Array {
  const year = parseInt(dateStr.substr(0, 2), 10);
  const month = parseInt(dateStr.substr(2, 2), 10);
  const day = parseInt(dateStr.substr(4, 2), 10);
  return new Uint8Array([year, month, day]);
}

// Helper function to convert time string to bytes (HHMMSS format)
export function timeStringToBytes(timeStr: string): Uint8Array {
  const hour = parseInt(timeStr.substr(0, 2), 10);
  const minute = parseInt(timeStr.substr(2, 2), 10);
  const second = parseInt(timeStr.substr(4, 2), 10);
  return new Uint8Array([hour, minute, second]);
}

// Helper function to convert ATC to 2-byte Uint8Array
export function numberTo2Bytes(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[0] = (value >> 8) & 0xff;
  bytes[1] = value & 0xff;
  return bytes;
}

export function parseGPOResponse(response: Uint8Array): number | null {
  try {
    console.log("[GPO Response Raw]", uint8ArrayToHex(response));

    const parsedResponse = TLVParser(response);

    // Extract ATC (9F36) from the response (tag 77 is the root)
    const atcTag = parsedResponse[0]?.getChild(
      EMV_TAGS.APPLICATION_TRANSACTION_COUNTER,
    );

    if (!atcTag) {
      console.error("[GPO Parse] ATC tag (9F36) not found");
      return null;
    }

    const atcValue = atcTag.getValue();

    // Convert 2-byte ATC to number
    const atc = (atcValue[0] << 8) | atcValue[1];

    console.log(
      `[GPO Parse] ATC (9F36): ${atc} (0x${atc.toString(16).padStart(4, "0")})`,
    );

    return atc;
  } catch (error) {
    console.error("[GPO Parse] Error parsing GPO response:", error);
    return null;
  }
}

export function parseReadRecordResponse(response: Uint8Array): string | null {
  try {
    console.log("[READ RECORD Response Raw]", uint8ArrayToHex(response));

    const parsedResponse = TLVParser(response);

    // Extract sender wallet address (C1) from the response (tag 70 is the root)
    const walletTag = parsedResponse[0]?.getChild(
      EMV_TAGS.SENDER_WALLET_ADDRESS,
    );

    if (!walletTag) {
      console.error(
        "[READ RECORD Parse] Sender wallet address tag (C1) not found",
      );
      return null;
    }

    const walletBytes = walletTag.getValue();

    // Convert bytes to ASCII string using tlv-kit utility
    const walletAddress = uint8ArrayToAscii(walletBytes).replace(/\0+$/, ""); // Remove null padding

    console.log(
      `[READ RECORD Parse] Sender Wallet Address (C1): ${walletAddress}`,
    );

    return walletAddress;
  } catch (error) {
    console.error(
      "[READ RECORD Parse] Error parsing READ RECORD response:",
      error,
    );
    return null;
  }
}

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

  const commandHeader = hexStringToUint8Array(APDU_COMMANDS.GENERATE_AC);
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

// Helper function to extract raw data from APDU command
export function extractRawDataFromAPDU(apduCommand: Uint8Array): Uint8Array {
  // APDU structure: [CLA, INS, P1, P2, LC, DATA..., LE]
  // Raw data starts after the LC byte (5th byte) and excludes the LE byte (last byte)
  const lcIndex = 4; // LC is at index 4
  const lc = apduCommand[lcIndex]; // Length of data
  const dataStart = lcIndex + 1;
  const dataEnd = dataStart + lc;

  return apduCommand.slice(dataStart, dataEnd);
}

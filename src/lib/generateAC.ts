// generateAC.ts - APDU command generation utilities

// Transaction data structure for human-readable format
export interface TransactionData {
  amount: number;
  currencyCode: string;
  transactionCurrencyExponent: number;
  date: string;
  unpredictableNumber: number;
  senderWalletAddress: string;
  receiverWalletAddress: string;
}

export const APDU_COMMANDS = {
  SELECT_PPSE: "00A404000AA00000015103010C0601",
  GENERATE_AC: "80AEC100", // Will be completed with raw data
} as const;

export function hexStringToUint8Array(hexString: string): Uint8Array {
  const bytes = [];
  for (let i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

export function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => {
      const hex = byte.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join(" ");
}

// (12 digits)
export function createBCDAmount(amount: number): Uint8Array {
  const amountStr = Math.floor(amount * 100)
    .toString()
    .padStart(12, "0");
  const bcd = new Uint8Array(6);

  for (let i = 0; i < 6; i++) {
    const pair = amountStr.substr(i * 2, 2);
    bcd[i] = parseInt(pair, 16);
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

export function createTransactionData(amount = 10): TransactionData {
  const now = new Date();
  const year = now.getFullYear() % 100;
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Generate random 4-byte unpredictable number
  const unpredictableNumber = Math.floor(Math.random() * 0x100000000); // 0 to 0xFFFFFFFF

  return {
    amount,
    currencyCode: "EUR",
    transactionCurrencyExponent: 2,
    date: `${year.toString().padStart(2, "0")}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}`,
    unpredictableNumber: unpredictableNumber,
    senderWalletAddress: "https://wallet.example/alice",
    receiverWalletAddress: "https://wallet.example/alice",
  };
}

export function createGenerateACCommand(
  transactionData: TransactionData,
): Uint8Array {
  // Convert transaction data to raw bytes for CDOL
  const amountData = createBCDAmount(transactionData.amount / 100);
  const currencyData = currencyCodeToBytes(transactionData.currencyCode);
  const exponentData = new Uint8Array([
    transactionData.transactionCurrencyExponent,
  ]);
  const dateData = dateStringToBytes(transactionData.date);
  const unpredictableData = numberTo4Bytes(transactionData.unpredictableNumber);

  const createPaddedPaymentPointer = (pointer: string): Uint8Array => {
    const asciiData = new Uint8Array(64);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(pointer);
    asciiData.set(encoded, 0);
    // Rest is already padded with zeros
    return asciiData;
  };

  const recipientData = createPaddedPaymentPointer(
    transactionData.receiverWalletAddress,
  );
  const senderData = createPaddedPaymentPointer(
    transactionData.senderWalletAddress,
  );

  console.log("=== RAW DATA STRUCTURE ===");
  console.log("Amount (6 bytes):", uint8ArrayToHexString(amountData));
  console.log("Currency (2 bytes):", uint8ArrayToHexString(currencyData));
  console.log("Exponent (1 byte):", uint8ArrayToHexString(exponentData));
  console.log("Date (3 bytes):", uint8ArrayToHexString(dateData));
  console.log(
    "Unpredictable (4 bytes):",
    uint8ArrayToHexString(unpredictableData),
  );
  console.log("Recipient (64 bytes):", uint8ArrayToHexString(recipientData));
  console.log("Sender (64 bytes):", uint8ArrayToHexString(senderData));

  // Combine all raw data fields in order (no TLV encoding)
  const rawDataFields = [
    amountData, // 6 bytes
    currencyData, // 2 bytes
    exponentData, // 1 byte
    dateData, // 3 bytes
    unpredictableData, // 4 bytes
    recipientData, // 64 bytes
    senderData, // 64 bytes
  ];

  const totalLength = rawDataFields.reduce(
    (sum, field) => sum + field.length,
    0,
  );
  console.log("Total raw data length:", totalLength, "bytes");

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

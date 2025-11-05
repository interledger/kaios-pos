import { asciiToUint8Array } from "@interledger/tlv-kit";

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
  // return asciiToUint8Array(_currencyCode.toUpperCase());
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
  // Convert date string to BCD format (e.g., "251105" -> [0x25, 0x11, 0x05])
  const year = parseInt(dateStr.substr(0, 2), 10);
  const month = parseInt(dateStr.substr(2, 2), 10);
  const day = parseInt(dateStr.substr(4, 2), 10);

  // Convert each decimal value to BCD
  const yearBCD = (Math.floor(year / 10) << 4) | year % 10;
  const monthBCD = (Math.floor(month / 10) << 4) | month % 10;
  const dayBCD = (Math.floor(day / 10) << 4) | day % 10;

  return new Uint8Array([yearBCD, monthBCD, dayBCD]);
}

// Helper function to convert time string to bytes (HHMMSS format)
export function timeStringToBytes(timeStr: string): Uint8Array {
  // Convert time string to BCD format (e.g., "123045" -> [0x12, 0x30, 0x45])
  const hour = parseInt(timeStr.substr(0, 2), 10);
  const minute = parseInt(timeStr.substr(2, 2), 10);
  const second = parseInt(timeStr.substr(4, 2), 10);

  // Convert each decimal value to BCD
  const hourBCD = (Math.floor(hour / 10) << 4) | hour % 10;
  const minuteBCD = (Math.floor(minute / 10) << 4) | minute % 10;
  const secondBCD = (Math.floor(second / 10) << 4) | second % 10;

  return new Uint8Array([hourBCD, minuteBCD, secondBCD]);
}

// Helper function to convert ATC to 2-byte Uint8Array
export function numberTo2Bytes(value: number): Uint8Array {
  const bytes = new Uint8Array(2);
  bytes[0] = (value >> 8) & 0xff;
  bytes[1] = value & 0xff;
  return bytes;
}

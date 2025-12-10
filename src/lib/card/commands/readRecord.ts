import {
  TLVParser,
  uint8ArrayToHex,
  uint8ArrayToAscii,
  hexToUint8Array,
} from "@interledger/tlv-kit";
import { EMV_TAGS } from "@constants/emvTags";

// READ RECORD APDU command
const READ_RECORD_APDU = "00B2010C00";

/**
 * Creates the READ RECORD APDU command
 * @returns The READ RECORD command as Uint8Array
 */
export function createReadRecordCommand(): Uint8Array {
  return hexToUint8Array(READ_RECORD_APDU);
}

/**
 * Parses the READ RECORD response to extract the sender wallet address
 * @param response - The response from the card
 * @returns The sender wallet address or null if parsing fails
 */
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

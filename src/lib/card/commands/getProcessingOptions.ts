import {
  TLVParser,
  uint8ArrayToHex,
  hexToUint8Array,
} from "@interledger/tlv-kit";
import { EMV_TAGS } from "@constants/emvTags";

// GET PROCESSING OPTIONS APDU command
const GET_PROCESSING_OPTIONS_APDU = "80A8000002830000";

/**
 * Creates the GET PROCESSING OPTIONS APDU command
 * @returns The GPO command as Uint8Array
 */
export function createGetProcessingOptionsCommand(): Uint8Array {
  return hexToUint8Array(GET_PROCESSING_OPTIONS_APDU);
}

/**
 * Parses the GET PROCESSING OPTIONS response to extract the ATC
 * @param response - The response from the card
 * @returns The Application Transaction Counter (ATC) or null if parsing fails
 */
export function parseGetProcessingOptionsResponse(
  response: Uint8Array,
): number | null {
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

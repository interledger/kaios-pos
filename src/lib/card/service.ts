import { hexToUint8Array } from "@interledger/tlv-kit";

export interface MozNFCTag {
  id: Uint8Array;
  techList: string[];
  isLost: boolean;
  selectTech: (techType: string) => MozNFCTech | null;
}

export interface MozNFCTech {
  transceive: (data: Uint8Array) => Promise<Uint8Array>;
}

// SELECT PPSE APDU command
export const SELECT_PPSE_COMMAND = "00A404000AA00000015103010C0601";

/**
 * Wraps the NFC transceive function with error handling
 * @param tag - The NFC tag to communicate with
 * @param command - The APDU command to send
 * @returns Promise resolving to the response from the card
 */
export async function transceive(
  tag: MozNFCTag,
  command: Uint8Array,
): Promise<Uint8Array> {
  if (tag.techList.indexOf("ISO-DEP") === -1) {
    throw new Error("Tag does not support ISO-DEP protocol");
  }

  const tech = tag.selectTech("ISO-DEP");
  if (!tech) {
    throw new Error("Failed to select ISO-DEP technology");
  }

  return await tech.transceive(command);
}

/**
 * Initializes communication with the card by sending SELECT PPSE
 * @param tag - The NFC tag to initialize
 */
export async function initializeCard(tag: MozNFCTag): Promise<void> {
  const selectPPSE = hexToUint8Array(SELECT_PPSE_COMMAND);
  await transceive(tag, selectPPSE);
}

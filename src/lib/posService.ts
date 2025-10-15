import type { TransactionData } from "./card/commands/generateAC";
import {
  numberTo4Bytes,
  createBCDAmount,
  dateStringToBytes,
  timeStringToBytes,
  currencyCodeToBytes,
} from "./card/utils";
import {
  TLVParser,
  TLV,
  uint8ArrayToHex,
  formatPinBlockISO1,
  hexToUint8Array,
} from "@interledger/tlv-kit";
import { EMV_TAGS } from "@constants/emvTags";
import { config } from "@config";

export interface PosPaymentRequest {
  signature: string; // hex string (GEN AC result)
  payload: string; // hex string (TLV-encoded transaction data)
  amount: {
    value: string; // amount in cents as string
    assetScale: number; // transaction currency exponent
    assetCode: string; // currency code
  };
  senderWalletAddress: string;
  receiverWalletAddress: string;
  timestamp: number; // UTC timestamp from Date.getTime()
}

/**
 * Main public API: Sends payment to POS service
 * @param cardResponse - The GENERATE AC response from the card
 * @param transactionData - Transaction data created during card communication
 * @param timestamp - UTC timestamp from when transaction was initiated
 * @param signSecret - Secret for HMAC signature
 * @param pin - Optional PIN (required for transactions above threshold)
 * @param pinTries - Optional PIN attempt count
 * @returns Promise with success status and response/error
 */
export async function sendPayment(
  cardResponse: Uint8Array,
  transactionData: TransactionData,
  timestamp: number,
  signSecret: string,
  pin?: string,
  pinTries?: number,
): Promise<{ success: boolean; response?: any; error?: string }> {
  // Build TLV payload from card response and transaction data
  const tlvPayload = buildTlvPayload(
    cardResponse,
    transactionData,
    pin,
    pinTries,
  );

  // Build complete payment request
  const paymentRequest = buildPaymentRequest(
    transactionData,
    cardResponse,
    tlvPayload,
    timestamp,
  );

  // Send to POS service
  return await sendToPosService(paymentRequest, signSecret);
}

/**
 * Builds the TLV-encoded payload for the POS service
 * Internal function - not exported
 */
function buildTlvPayload(
  generateACResponse: Uint8Array,
  transactionData: TransactionData,
  pin?: string,
  pinTries?: number,
): Uint8Array {
  const parsedResponse = TLVParser(generateACResponse);

  const tag9F26 = parsedResponse[0]?.getChild(EMV_TAGS.APPLICATION_CRYPTOGRAM); // Application Cryptogram
  const tag9F27 = parsedResponse[0]?.getChild(EMV_TAGS.CRYPTOGRAM_INFO_DATA); // Cryptogram Information Data

  const tag9F37Value = numberTo4Bytes(transactionData.unpredictableNumber); // Unpredictable Number (4 bytes)
  const tag9AValue = dateStringToBytes(transactionData.date); // Transaction Date (3 bytes: YYMMDD)
  const tag9F21Value = timeStringToBytes(transactionData.time); // Transaction Time (3 bytes: HHMMSS)
  const tag9F02Value = createBCDAmount(transactionData.amount); // Amount, Authorised (6 bytes BCD)
  const tag5F2AValue = currencyCodeToBytes(transactionData.currencyCode); // Transaction Currency Code (2 bytes)

  // PIN block
  let tag99Value: Uint8Array | null = null;
  let tag9F17Value: Uint8Array | null = null;

  if (pin) {
    // Format PIN block using ISO-1 format
    const pinBlockHex = formatPinBlockISO1(pin, undefined, true); // Use random padding
    tag99Value = hexToUint8Array(pinBlockHex); // PIN block (8 bytes)

    const triesRemaining =
      pinTries !== undefined
        ? config.pin.maxAttempts - pinTries
        : config.pin.maxAttempts;
    tag9F17Value = new Uint8Array([Math.max(0, triesRemaining)]);
  }

  // Create TLV objects for each tag
  const tlv9F26 = new TLV(
    EMV_TAGS.APPLICATION_CRYPTOGRAM,
    tag9F26?.getValue() || new Uint8Array(),
  );
  const tlv9F27 = new TLV(
    EMV_TAGS.CRYPTOGRAM_INFO_DATA,
    tag9F27?.getValue() || new Uint8Array(),
  );
  const tlv9F37 = new TLV(EMV_TAGS.UNPREDICTABLE_NUMBER, tag9F37Value);
  const tlv9A = new TLV(EMV_TAGS.TRANSACTION_DATE, tag9AValue);
  const tlv9F21 = new TLV(EMV_TAGS.TRANSACTION_TIME, tag9F21Value);
  const tlv9F02 = new TLV(EMV_TAGS.AMOUNT_AUTHORISED, tag9F02Value);
  const tlv5F2A = new TLV(EMV_TAGS.TRANSACTION_CURRENCY_CODE, tag5F2AValue);

  const encodedTags = [
    tlv9F26.encode(),
    tlv9F27.encode(),
    tlv9F37.encode(),
    tlv9A.encode(),
    tlv9F21.encode(),
    tlv9F02.encode(),
    tlv5F2A.encode(),
  ];

  // Add PIN-related tags if PIN is provided
  if (tag9F17Value && tag99Value) {
    const tlv9F17 = new TLV(EMV_TAGS.PIN_TRY_COUNTER, tag9F17Value);
    const tlv99 = new TLV(EMV_TAGS.TRANSACTION_PIN_DATA, tag99Value);
    encodedTags.push(tlv9F17.encode());
    encodedTags.push(tlv99.encode());
  }

  // Calculate total length
  const totalLength = encodedTags.reduce((sum, tag) => sum + tag.length, 0);

  // Concatenate all encoded tags
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const encodedTag of encodedTags) {
    result.set(encodedTag, offset);
    offset += encodedTag.length;
  }

  console.log(
    "[TLV Payload]",
    uint8ArrayToHex(result),
    `(${totalLength} bytes, PIN: ${pin ? "included" : "not included"})`,
  );

  return result;
}

/**
 * Builds the complete payment request object for POS service
 * Internal function - not exported
 */
function buildPaymentRequest(
  transactionData: TransactionData,
  signature: Uint8Array, // APDU response from GENERATE AC
  payload: Uint8Array, // TLV-encoded payload
  timestamp: number, // UTC timestamp
): PosPaymentRequest {
  const signatureHex = uint8ArrayToHex(signature);
  const payloadHex = uint8ArrayToHex(payload);

  return {
    signature: signatureHex,
    payload: payloadHex,
    amount: {
      value: transactionData.amount.toString(), // Already in cents
      assetScale: transactionData.transactionCurrencyExponent,
      assetCode: "USD",
    },
    //TODO: remove hardcoded wallet addresses
    // senderWalletAddress: transactionData.senderWalletAddress,
    // receiverWalletAddress: transactionData.receiverWalletAddress,
    senderWalletAddress: "https://cloud-nine-wallet-backend/accounts/gfranklin",
    receiverWalletAddress: "https://happy-life-bank-backend/accounts/pfry",
    timestamp: timestamp,
  };
}

/**
 * Sends payment request to POS service endpoint
 * Internal function - not exported
 */
async function sendToPosService(
  paymentRequest: PosPaymentRequest,
  signSecret: string,
): Promise<{ success: boolean; response?: any; error?: string }> {
  const endpoint = config.posService.endpoint;

  try {
    console.log(
      "[POS Service Request]",
      JSON.stringify(paymentRequest, null, 2),
    );

    // Validate JSON before sending
    const jsonString = JSON.stringify(paymentRequest);

    const signature = signSecret
      ? await createHmacSignature(signSecret, jsonString)
      : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (signature) {
      headers["X-Signature"] = signature;
      headers["X-Signature-Algorithm"] = "HMAC-SHA256";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: jsonString,
    });

    const contentType = response.headers.get("content-type") || "";

    // Read response body as text once
    const responseText = await response.text();

    let responseData;
    const isJsonContentType = contentType.toLowerCase().includes("json");
    if (isJsonContentType) {
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        return {
          success: false,
          error: `Invalid JSON response: ${
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error"
          }`,
          response: responseText,
        };
      }
    } else {
      responseData = responseText;
    }

    if (response.ok) {
      console.log("[POS Service Response]", responseData);
      return { success: true, response: responseData };
    } else {
      console.error(
        `[POS Service Error] HTTP ${response.status}:`,
        responseData,
      );
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        response: responseData,
      };
    }
  } catch (error) {
    console.error("[POS Service Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Creates HMAC-SHA256 signature for request authentication
 * Internal function - not exported
 */
async function createHmacSignature(
  secret: string,
  payload: string,
): Promise<string> {
  const cryptoApi = typeof window !== "undefined" ? window.crypto : undefined;

  if (!cryptoApi?.subtle) {
    throw new Error("WebCrypto not supported; cannot sign request");
  }

  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await cryptoApi.subtle.importKey(
    "raw",
    keyData,
    {
      name: "HMAC",
      hash: { name: "SHA-256" },
    },
    false,
    ["sign"],
  );

  const signatureBuffer = await cryptoApi.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

import type { TransactionData } from "./generateAC";
import {
  numberTo2Bytes,
  numberTo4Bytes,
  createBCDAmount,
  dateStringToBytes,
  timeStringToBytes,
  currencyCodeToBytes,
} from "./generateAC";
import {
  TLVParser,
  TLV,
  uint8ArrayToHex,
  formatPinBlockISO1,
  hexToUint8Array,
} from "@interledger/tlv-kit";
import { EMV_TAGS } from "@constants/emvTags";
import { MAX_PIN_ATTEMPTS } from "@constants/pin";

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
  const signatureHex = uint8ArrayToHexString(signature);
  const payloadHex = uint8ArrayToHexString(payload);

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

// Helper function to convert Uint8Array to hex string
function uint8ArrayToHexString(uint8Array: Uint8Array): string {
  return Array.from(uint8Array)
    .map((byte) => {
      const hex = byte.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");
}

export function createPosServicePayload(
  generateACResponse: Uint8Array,
  transactionData: TransactionData,
  pin?: string,
  pinTries?: number,
): Uint8Array {
  const parsedResponse = TLVParser(generateACResponse);

  // Find tag 77 (Response Message Template Format 2)
  const tag77Byte = parseInt(EMV_TAGS.RESPONSE_MESSAGE_TEMPLATE, 16);
  const tag77 = parsedResponse.find(
    (tlv) =>
      tlv.getTag()[0] === tag77Byte ||
      (tlv.getTag().length === 1 && tlv.getTag()[0] === tag77Byte),
  );
  const tag9F26 = tag77?.getChild(EMV_TAGS.APPLICATION_CRYPTOGRAM); // Application Cryptogram
  const tag9F27 = tag77?.getChild(EMV_TAGS.CRYPTOGRAM_INFO_DATA); // Cryptogram Information Data

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
      pinTries !== undefined ? MAX_PIN_ATTEMPTS - pinTries : MAX_PIN_ATTEMPTS;
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
    "[POS Service Payload]",
    uint8ArrayToHex(result),
    `(${totalLength} bytes, PIN: ${pin ? "included" : "not included"})`,
  );

  return result;
}

export async function sendPaymentToPosService(
  paymentData: PaymentServiceData,
  signSecret: string,
): Promise<{ success: boolean; response?: any; error?: string }> {
  //Change this to local service that exposes pos service (any link that redirects to -> localhost:4008/payment with rafiki localenv started)
  const endpoint = "https://4dc811ba5137.ngrok-free.app/payment";

  try {
    console.log("[POS Service Request]", JSON.stringify(paymentData, null, 2));

    // Validate JSON before sending
    const jsonString = JSON.stringify(paymentData);

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

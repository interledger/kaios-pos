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

// Send payment data to Rafiki POS service
export async function sendPaymentToRafiki(
  paymentData: PaymentServiceData,
  signSecret: string,
): Promise<{ success: boolean; response?: any; error?: string }> {
  //Change this to your local service that exposes pos service (any link that redirects to -> localhost:4008/payment with rafiki localenv started)
  const endpoint = "https://84c92ece1b62.ngrok-free.app/payment";

  try {
    console.log("=== SENDING PAYMENT TO RAFIKI ===");
    console.log("Endpoint:", endpoint);
    console.log("Request data:", JSON.stringify(paymentData, null, 2));

    // Validate JSON before sending
    const jsonString = JSON.stringify(paymentData);

    if (!signSecret) {
      console.warn(
        "sendPaymentToRafiki called without signSecret; request will not be signed",
      );
    }

    const signature = signSecret
      ? await createHmacSignature(signSecret, jsonString)
      : null;

    if (signature) {
      console.log("=== HMAC SIGNATURE ===");
      console.log("Signature:", signature);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (signature) {
      headers["X-Signature"] = signature;
      headers["X-Signature-Algorithm"] = "HMAC-SHA256";
    }

    console.log("=== HEADERS ===");
    console.log(headers);

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: jsonString,
    });

    console.log("=== RAFIKI RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    // Get response text first to debug
    const responseText = await response.text();
    console.log("Raw response text:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log(
        "Parsed response data:",
        JSON.stringify(responseData, null, 2),
      );
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      console.error("Response text that failed to parse:", responseText);
      return {
        success: false,
        error: `Invalid JSON response: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
        response: responseText,
      };
    }

    if (response.ok) {
      return { success: true, response: responseData };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        response: responseData,
      };
    }
  } catch (error) {
    console.error("=== RAFIKI REQUEST ERROR ===");
    console.error("Error:", error);
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

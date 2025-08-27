export class WalletValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletValidationError";
  }
}

function normalize(paymentPointer: string) {
  if (!paymentPointer.startsWith("$")) {
    return paymentPointer;
  }

  const withoutDollar = paymentPointer.slice(1);
  return `https://${withoutDollar}`;
}

export async function get(paymentPointer: string) {
  const endpoint = normalize(paymentPointer);
  console.log("ENDPOINT: ", endpoint);
  const res = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to resolve Payment Pointer");
  }

  return res.json();
}

export function validatePaymentPointer(paymentPointer: string): boolean {
  if (!paymentPointer || typeof paymentPointer !== "string") {
    throw new WalletValidationError("must be a string");
  }
  let urlString = paymentPointer.trim();
  if (urlString.startsWith("$")) {
    urlString = urlString.replace(/^\$/, "https://");
  }
  if (!urlString.startsWith("https://")) {
    throw new WalletValidationError("must start with https:// or $");
  }
  if (urlString.includes(" ")) {
    throw new WalletValidationError("must not contain spaces");
  }
  const allowedChars = /^[a-zA-Z0-9\-._~:?#/]+$/;
  if (!allowedChars.test(urlString)) {
    throw new WalletValidationError("contains invalid characters");
  }
  let url: URL;
  try {
    url = new URL(urlString);
  } catch (err) {
    throw new WalletValidationError("is not a valid URL");
  }

  if (url.protocol !== "https:") {
    throw new WalletValidationError("must use HTTPS protocol");
  }
  if (!url.hostname) {
    throw new WalletValidationError("must include a domain name");
  }
  if (url.search || url.hash) {
    throw new WalletValidationError(
      "must not contain query string or fragment",
    );
  }
  if (url.pathname && !url.pathname.startsWith("/")) {
    throw new WalletValidationError("path must start with a slash");
  }
  const hostnameRegex =
    /^(?=.{1,253}$)(?!.*\.\.)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!hostnameRegex.test(url.hostname)) {
    throw new WalletValidationError("Domain name is not valid");
  }
  return true;
}

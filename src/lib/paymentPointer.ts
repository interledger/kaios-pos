export async function handlePaymentPointerEnter(
  pp: string,
  {
    setError,
    setPaymentPointer,
    setPaymentPointerInput,
    setCurrency,
    nav,
  }: {
    setError: (msg: string) => void;
    setPaymentPointer: (pp: string) => void;
    setPaymentPointerInput: (pp: string) => void;
    setCurrency: (currency: string) => void;
    nav: (path: string) => void;
  },
) {
  setPaymentPointerInput(pp);
  try {
    validatePaymentPointer(pp);
    setError("");
  } catch (error: any) {
    setError(error.message);
    return false;
  }
  try {
    const data = { assetCode: "EUR" }; //await get(pp); // Disabled actual fetch for demo purposes
    setPaymentPointer(pp);
    setCurrency(data.assetCode || "EUR");
    nav("/menu");
    return true;
  } catch (error) {
    console.error("Error fetching payment pointer data:", error);
    setError("Invalid payment pointer");
    return false;
  }
}
type WalletAddress = {
  id: string;
  assetCode: string;
  authServer: string;
  resourceServer: string;
};
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

function isWalletAddress(x: unknown): x is WalletAddress {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.authServer === "string" &&
    o.authServer.startsWith("https://") &&
    typeof o.resourceServer === "string" &&
    o.resourceServer.startsWith("https://")
  );
}

export async function get(paymentPointer: string) {
  const endpoint = normalize(paymentPointer);
  console.log("ENDPOINT: ", endpoint);
  const res = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to access the wallet address url");
  }

  const json = await res.json();
  if (!isWalletAddress(json))
    throw new Error("Invalid wallet response for " + paymentPointer);

  return json;
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

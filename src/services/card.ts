export async function waitForCardPresent(
  timeoutMs = 6000,
): Promise<"tap" | "insert" | "swipe"> {
  await new Promise((r) => setTimeout(r, timeoutMs));
  return "tap";
}

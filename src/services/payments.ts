import { z } from "zod";
export async function createQuote(input: {
  paymentPointer: string;
  amount: number;
  currency: string;
}) {
  const Quote = z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
  });
  return Quote.parse({
    id: Math.random().toString(36).slice(2),
    amount: input.amount,
    currency: input.currency,
  });
}
export async function capturePayment(input: {
  quoteId: string;
  method: "card-present" | "wallet";
}) {
  const Capture = z.object({
    id: z.string(),
    status: z.enum(["authorized", "captured", "failed"]),
  });
  return Capture.parse({
    id: Math.random().toString(36).slice(2),
    status: "captured",
  });
}

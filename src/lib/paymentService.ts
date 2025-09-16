// paymentService.ts - Payment service utilities

import type { TransactionData } from "./generateAC";

// Payment service data structure
export interface PaymentServiceData {
  applicationTransactionCounter: string;
  amount: number;
  currencyCode: string;
  transactionCurrencyExponent: number;
  date: string;
  unpredictableNumber: string;
  senderWalletAddress: string;
  receiverWalletAddress: string;
}

export function createPaymentServiceData(
  transactionData: TransactionData,
): PaymentServiceData {
  return {
    applicationTransactionCounter: transactionData.unpredictableNumber
      .toString(16)
      .padStart(8, "0"),
    amount: transactionData.amount, // Already in cents
    currencyCode: transactionData.currencyCode,
    transactionCurrencyExponent: transactionData.transactionCurrencyExponent,
    date: transactionData.date,
    unpredictableNumber: transactionData.unpredictableNumber
      .toString(16)
      .padStart(8, "0"),
    senderWalletAddress: transactionData.senderWalletAddress,
    receiverWalletAddress: transactionData.receiverWalletAddress,
  };
}

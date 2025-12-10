export enum TransactionStatus {
  WAITING_FOR_CARD = "WAITING_FOR_CARD",
  PROCESSING = "PROCESSING",
  COMPLETE = "COMPLETE",
  FAILED = "FAILED",
  PIN_ENTRY = "PIN_ENTRY",
}

export const statusConfig = {
  [TransactionStatus.WAITING_FOR_CARD]: {
    key: "debit-card",
    icon: "debit-card",
    index: 0,
  },
  [TransactionStatus.PROCESSING]: {
    key: "processing",
    icon: "processing",
    index: 1,
  },
  [TransactionStatus.COMPLETE]: {
    key: "complete",
    icon: "checked",
    index: 2,
  },
  [TransactionStatus.FAILED]: {
    key: "failed",
    icon: "failed",
    index: 3,
  },
  [TransactionStatus.PIN_ENTRY]: {
    key: "pin",
    icon: "",
    index: 4,
  },
} as const;

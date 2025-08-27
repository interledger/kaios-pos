import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Tx = {
  id: string;
  amount: number;
  fee: number;
  currency: string;
  ts: Date;
};

type Store = {
  paymentPointer: string;
  setPaymentPointer: (v: string) => void;

  currency: string;
  setCurrency: (v: string) => void;

  amount: string;
  setAmount: (v: string) => void;

  tx: Tx[];
  setTx: (tx: Tx[]) => void;

  totalBalance: number; // computed
  error: string | null;
  setError: (v: string | null) => void;
};

const sampleTx: Tx[] = [
  {
    id: "t1",
    amount: 12.5,
    fee: 0.05,
    currency: "EUR",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 20),
  },
  {
    id: "t2",
    amount: 5.9,
    fee: 0.03,
    currency: "EUR",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "t3",
    amount: 31,
    fee: 0.1,
    currency: "EUR",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 8),
  },
  {
    id: "t4",
    amount: 7.25,
    fee: 0.02,
    currency: "EUR",
    ts: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "t5",
    amount: 19.99,
    fee: 0.07,
    currency: "EUR",
    ts: new Date(Date.now() - 1000 * 60 * 30),
  },
];

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      paymentPointer: "",
      setPaymentPointer: (v) => set({ paymentPointer: v }),

      currency: "EUR",
      setCurrency: (v) => set({ currency: v }),

      amount: "0",
      setAmount: (v) => set({ amount: v }),

      tx: sampleTx,
      setTx: (tx) => set({ tx }),

      get totalBalance() {
        return get().tx.reduce((a, t) => a + t.amount - t.fee, 0);
      },

      error: null,
      setError: (v) => set({ error: v }),
    }),
    {
      name: "ilf-pos-storage", // key in localStorage
      partialize: (state) => ({
        paymentPointer: state.paymentPointer,
        currency: state.currency,
        amount: state.amount,
        tx: state.tx,
        error: state.error,
      }),
    }
  )
);

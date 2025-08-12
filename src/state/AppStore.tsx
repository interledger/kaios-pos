import React, { createContext, useContext, useMemo, useState } from "react";
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
  setAmount: React.Dispatch<React.SetStateAction<string>>;
  tx: Tx[];
  setTx: React.Dispatch<React.SetStateAction<Tx[]>>;
  totalBalance: number;
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
const Ctx = createContext<Store | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [paymentPointer, setPaymentPointer] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [amount, setAmount] = useState("0");
  const [tx, setTx] = useState<Tx[]>(sampleTx);
  const totalBalance = useMemo(
    () => tx.reduce((a, t) => a + t.amount - t.fee, 0),
    [tx],
  );
  const value: Store = {
    paymentPointer,
    setPaymentPointer,
    currency,
    setCurrency,
    amount,
    setAmount,
    tx,
    setTx,
    totalBalance,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAppStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used within AppProvider");
  return v;
}

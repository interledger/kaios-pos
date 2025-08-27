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
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
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
    (set, get) => {
      return {
        paymentPointer: "",
        setPaymentPointer: (v: string) => set({ paymentPointer: v }),

        currency: "EUR",
        setCurrency: (v: string) => set({ currency: v }),

        amount: "0",
        setAmount: (v: string) => set({ amount: v }),

        tx: sampleTx,
        setTx: (tx: Tx[]) => set({ tx }),
        error: null,
        setError: (v: string | null) => set({ error: v }),
        _hasHydrated: false,
        setHasHydrated: (v: boolean) => set({ _hasHydrated: v })
      };
    },
    {
      name: "ilfpos", // key in localStorage
      version: 1,
      merge: (persistedState: any, currentState: any) => {
        try {
          const plainKeys = Object.keys(persistedState).filter(
            (k) => typeof persistedState[k] !== 'function'
          );
          const merged = { ...currentState };
          for (const key of plainKeys) {
            merged[key] = persistedState[key];
          }
          return merged;
        } catch (e) {
          console.error('Error in merge:', e);
          return currentState;
        }
      },
      onRehydrateStorage: () => (state) => {
        // Always set hydrated to true, even if state is undefined (first load)
        state?.setHasHydrated?.(true);
        if (!state) {
          setTimeout(() => {
            // Use the store's setHasHydrated directly
            try {
              // @ts-ignore
              import('../state/AppStore').then(mod => mod.useAppStore.getState().setHasHydrated(true));
            } catch { }
          }, 0);
        }
      },
    },
  ),
);

// Selector for totalBalance
export function selectTotalBalance(state: Store) {
  const tx = state.tx;
  if (!Array.isArray(tx)) return 0;
  return tx.reduce((a, t) => a + t.amount - t.fee, 0);
}

// Debug: Read and decode Zustand persisted state from localStorage
export function debugReadPersistedState() {
  try {
    const raw = localStorage.getItem('ilfpos');
    if (!raw) {
      console.log('No ilfpos found in localStorage');
      return null;
    }
    const decoded = JSON.parse(raw);
    console.log('Decoded ilfpos:', decoded);
    return decoded;
  } catch (e) {
    console.error('Error decoding ilfpos:', e);
    return null;
  }
}


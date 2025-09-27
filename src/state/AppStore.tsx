import { createContext } from "preact";
import { useContext, useReducer, useEffect, type Dispatch } from "preact/hooks";

export type Tx = {
  id: string;
  amount: number;
  fee: number;
  currency: string;
  ts: Date;
};

export type Store = {
  paymentPointer: string;
  currency: string;
  amount: string;
  tx: Tx[];
  error: string | null;
  _hasHydrated: boolean;
  signSecret: string;
};

type Action =
  | { type: "setPaymentPointer"; value: string }
  | { type: "setCurrency"; value: string }
  | { type: "setAmount"; value: string }
  | { type: "setTx"; value: Tx[] }
  | { type: "setError"; value: string | null }
  | { type: "setHasHydrated"; value: boolean }
  | { type: "setSignSecret"; value: string };

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

const initialState: Store = {
  paymentPointer: "",
  currency: "EUR",
  amount: "0",
  tx: sampleTx,
  error: null,
  _hasHydrated: false,
  signSecret: "",
};

function reducer(state: Store, action: Action): Store {
  switch (action.type) {
    case "setPaymentPointer":
      return { ...state, paymentPointer: action.value };
    case "setCurrency":
      return { ...state, currency: action.value };
    case "setAmount":
      return { ...state, amount: action.value };
    case "setTx":
      return { ...state, tx: action.value };
    case "setError":
      return { ...state, error: action.value };
    case "setHasHydrated":
      return { ...state, _hasHydrated: action.value };
    case "setSignSecret":
      return { ...state, signSecret: action.value };
    default:
      return state;
  }
}

const StoreContext = createContext<[Store, Dispatch<Action>] | undefined>(
  undefined,
);

export function AppStoreProvider({
  children,
}: {
  children: preact.ComponentChildren;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ilfpos");
      if (raw) {
        const parsed = JSON.parse(raw);
        console.log("[AppStore] Parsed persisted state", parsed);
        dispatch({
          type: "setPaymentPointer",
          value: parsed.paymentPointer || "https://ilp.dev/009" || "",
        });
        dispatch({ type: "setCurrency", value: parsed.currency || "EUR" });
        dispatch({ type: "setAmount", value: parsed.amount || "0" });
        dispatch({
          type: "setTx",
          value: Array.isArray(parsed.tx)
            ? parsed.tx.map((t: any) => ({ ...t, ts: new Date(t.ts) }))
            : sampleTx,
        });
        dispatch({ type: "setError", value: parsed.error || null });
        dispatch({ type: "setSignSecret", value: parsed.signSecret || "" });
      }
      if (!raw) {
        console.log("[AppStore] No persisted state found in localStorage");
      }
    } catch (e) {
      // ignore
      console.error("[AppStore] Failed to hydrate persisted state", e);
    }
    dispatch({ type: "setHasHydrated", value: true });
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (state._hasHydrated) {
      // Serialize to a plain object for localStorage
      const toSave = {
        ...state,
        tx: state.tx.map((t) => ({
          ...t,
          ts: t.ts instanceof Date ? t.ts.toISOString() : t.ts,
        })),
      };
      console.log("[AppStore] Persisting state", toSave);
      localStorage.setItem("ilfpos", JSON.stringify(toSave));
    }
  }, [state]);

  return (
    <StoreContext.Provider value={[state, dispatch]}>
      {children}
    </StoreContext.Provider>
  );
}

// Custom hook to use the store
export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  const [state, dispatch] = ctx;
  // Provide state and setter functions for compatibility
  return {
    ...state,
    setPaymentPointer: (v: string) =>
      dispatch({ type: "setPaymentPointer", value: v }),
    setCurrency: (v: string) => dispatch({ type: "setCurrency", value: v }),
    setAmount: (v: string) => dispatch({ type: "setAmount", value: v }),
    setTx: (tx: Tx[]) => dispatch({ type: "setTx", value: tx }),
    setError: (v: string | null) => dispatch({ type: "setError", value: v }),
    setHasHydrated: (v: boolean) =>
      dispatch({ type: "setHasHydrated", value: v }),
    setSignSecret: (v: string) => dispatch({ type: "setSignSecret", value: v }),
  };
}

// Selector for totalBalance
export function selectTotalBalance(state: { tx: Tx[] }) {
  const tx = state.tx;
  if (!Array.isArray(tx)) return 0;
  return tx.reduce((a, t) => a + t.amount - t.fee, 0);
}

// Debug: Read and decode persisted state from localStorage
export function debugReadPersistedState() {
  try {
    const raw = localStorage.getItem("ilfpos");
    if (!raw) {
      console.log("No ilfpos found in localStorage");
      return null;
    }
    const decoded = JSON.parse(raw);
    console.log("Decoded ilfpos:", decoded);
    return decoded;
  } catch (e) {
    console.error("Error decoding ilfpos:", e);
    return null;
  }
}

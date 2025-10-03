import { useEffect } from "preact/hooks";
import { route } from "preact-router";
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { formatCurrency } from "@lib/currency";
import { useAppStore } from "@state/AppStore";
export default function Sell(_props: { path?: string }) {
  const nav = route;
  const { paymentPointer, currency, amount, setAmount } = useAppStore();
  const onKey = (key: string) => {
    let newAmount = amount;
    if (key === "C") {
      newAmount = "0";
    } else if (key === "⌫") {
      newAmount = amount.length <= 1 ? "0" : amount.slice(0, -1);
    } else if (key === ".") {
      newAmount = amount.includes(".") ? amount : amount + ".";
    } else if (/^\d$/.test(key)) {
      if (amount === "0") newAmount = key;
      else if (amount.length < 9) newAmount = amount + key;
      // else leave as is
    }
    setAmount(newAmount);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(e.key);
      if (e.repeat) return;
      if (e.key >= "0" && e.key <= "9") {
        onKey(e.key);
        e.preventDefault();
      } else if (e.key === "." || e.key === "," || e.key === "*") {
        onKey(".");
        e.preventDefault();
      } else if (e.key === "Backspace") {
        // Backspace: go to menu if amount is 0, else delete
        if (parseFloat(amount || "0") === 0) {
          nav("/menu");
        } else {
          onKey("⌫");
        }
        e.preventDefault();
      } else if (e.key === "SoftLeft") {
        route("/menu");
        e.preventDefault();
      } else if (e.key.toLowerCase() === "c") {
        onKey("C");
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (parseFloat(amount || "0") > 1000) {
          nav("/pin");
        } else if (parseFloat(amount || "0") > 0) {
          nav("/wait-card");
        }
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [amount, nav]);
  useEffect(() => {
    if (paymentPointer.length == 0) {
      nav("/setup");
    }
  }, []);
  return (
    <section className="space-y-4">
      <Header />
      <div className="mt-4 rounded-xl bg-white px-4 py-6 text-center">
        <div className="text-3xl font-bold tabular-nums">
          {formatCurrency(parseFloat(amount || "0"), currency)}
        </div>
      </div>
      <Footer optionBtn={false} />
    </section>
  );
}

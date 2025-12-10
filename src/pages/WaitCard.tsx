// WaitCard.tsx
import { Footer } from "@components/Footer";
import { Header } from "@components/Header";
import { PinComponent } from "@components/PinComponent";
import { TransactionStatus as TransactionStatusComponent } from "@components/TransactionStatus";
import { TransactionStatus } from "@constants/statuses";
import { useCardPayment } from "@hooks/useCardPayment";
import { useNfcReader } from "@hooks/useNfcReader";
import { useAppStore } from "@state/AppStore";
import { route } from "preact-router";
import { useCallback, useEffect, useRef } from "preact/hooks";

type WaitCardProps = {
  playRingtone?: () => void;
  onTagLost?: (e: any) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  className?: string;
};

export default function WaitCard({
  playRingtone,
  onTagLost,
  autoFocus = true,
  className = "",
}: { path?: string } & WaitCardProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const {
    currency,
    paymentPointer,
    amount,
    signSecret,
    pinVerified,
    pinThreshold,
    setPinVerified,
    setPinTries,
  } = useAppStore();

  const handleResetPin = useCallback(() => {
    setPinVerified(false);
    setPinTries(0);
  }, [setPinVerified, setPinTries]);

  const { transactionStatus, processCard, handlePinComplete, handlePinCancel } =
    useCardPayment({
      amount,
      paymentPointer,
      signSecret,
      pinThreshold,
      pinVerified,
      onPlayRingtone: playRingtone,
      onResetPin: handleResetPin,
    });

  useNfcReader({
    onTagFound: processCard,
    onTagLost,
    onPlayRingtone: playRingtone,
    autoFocus,
    panelRef,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Backspace" ||
        e.key === "SoftLeft" ||
        e.key === "EndCall" //lets see if this works.
      ) {
        route("/sell");
        e.preventDefault();
      } else if (e.key === "Enter") {
        // prevent manual cycling; Enter does nothing here
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div ref={panelRef} tabIndex={-1} className={`${className}`}>
      <Header title="wait-card" />
      {transactionStatus === TransactionStatus.PIN_ENTRY && (
        <PinComponent
          onComplete={handlePinComplete}
          onCancel={handlePinCancel}
        />
      )}
      {transactionStatus !== TransactionStatus.PIN_ENTRY && (
        <TransactionStatusComponent
          transactionStatus={transactionStatus}
          amount={amount}
          currency={currency}
        />
      )}
      <Footer selectBtn={false} optionBtn={false} />
    </div>
  );
}

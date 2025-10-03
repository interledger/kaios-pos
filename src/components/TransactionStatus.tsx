import { formatCurrency } from "@lib/currency";
import { statuses } from "@constants/statuses";

export function TransactionStatus({
  transactionStatus,
  amount,
  currency,
}: {
  transactionStatus: number;
  amount: string | undefined;
  currency: string | undefined;
}) {
  return (
    <div className="flex flex-col mt-4 py-8 bg-white ">
      <h2
        data-l10n-id={`statuses-${transactionStatus}-key`}
        className="mt-4 mb-2 px-4 text-3xl text-center font-semibold"
      ></h2>
      {transactionStatus === 0 && (
        <p className="text-3xl my-1 font-semibold text-center">
          {formatCurrency(parseFloat(amount || "0"), currency || "EUR")}
        </p>
      )}
      <span
        data-l10n-id={`statuses-${transactionStatus}-key-message`}
        className="mt-4 mb-2 px-4 text-xl text-center"
      ></span>
      <div className="mt-4 mb-4 text-center">
        {statuses[transactionStatus].icon && (
          <img
            src={`/assets/icons/${statuses[transactionStatus].icon}.png`}
            className="mx-auto"
          />
        )}
      </div>
    </div>
  );
}

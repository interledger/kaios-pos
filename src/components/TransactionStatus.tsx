import { formatCurrency } from "@lib/currency";
import { TransactionStatus as Status, statusConfig } from "@constants/statuses";

export function TransactionStatus({
  transactionStatus,
  amount,
  currency,
}: {
  transactionStatus: Status;
  amount: string | undefined;
  currency: string | undefined;
}) {
  const config = statusConfig[transactionStatus];

  return (
    <div className="flex flex-col mt-4 py-8 bg-white ">
      <h2
        data-l10n-id={`statuses-${config.index}-key`}
        className="mt-4 mb-2 px-4 text-3xl text-center font-semibold"
      ></h2>
      {transactionStatus === Status.WAITING_FOR_CARD && (
        <p className="text-3xl my-1 font-semibold text-center">
          {formatCurrency(parseFloat(amount || "0"), currency || "EUR")}
        </p>
      )}
      <span
        data-l10n-id={`statuses-${config.index}-key-message`}
        className="mt-4 mb-2 px-4 text-xl text-center"
      ></span>
      <div className="mt-4 mb-4 text-center">
        {config.icon && (
          <img src={`/assets/icons/${config.icon}.png`} className="mx-auto" />
        )}
      </div>
    </div>
  );
}

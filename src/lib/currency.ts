export function currencySymbol(c: string) {
  const m: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
  };

  return m[c] || c;
}

export function formatCurrency(value: number, currency: string) {
  try {
    const formatted = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value || 0);
    return formatted;
  } catch {
    console.error(
      "Intl.NumberFormat missing Error formatting currency:",
      value,
      currency,
    );
    const s = currencySymbol(currency);
    return `${s} ${value || 0}`;
  }
}
export function formatValue(value: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
    }).format(value || 0);
  } catch {
    return `${value ? "+" : "-"}${(value || 0).toFixed(2)}`;
  }
}

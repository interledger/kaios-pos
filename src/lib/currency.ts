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
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(value || 0);
  } catch {
    const s = currencySymbol(currency);
    return `${s} ${(value || 0).toFixed(2)}`;
  }
}
export function formatValue(value: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency"
    }).format(value || 0);
  } catch {
    return `${value ? '+':'-'}${(value || 0).toFixed(2)}`;
  }
}

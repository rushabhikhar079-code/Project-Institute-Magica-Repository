export function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)} L`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} K`;
  }

  return `${value.toFixed(2)}`;
}

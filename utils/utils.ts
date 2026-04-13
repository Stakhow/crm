/* @param {date} ISO 8601 standard */
export function dateToLocalString(timestamp: number) {
  return new Date(timestamp).toLocaleString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function priceFormat(sum: string | number) {
  return (sum || 0).toLocaleString("uk-UA", {
    style: "currency",
    currency: "UAH",
  });
}

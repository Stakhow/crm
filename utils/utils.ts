/* @param {date} ISO 8601 standard */
export function dateToLocalString(timestamp: number) {
  return new Date(timestamp).toLocaleString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export function priceFormat(value: string | number) {
  return (value || 0).toLocaleString("uk-UA", {
    style: "currency",
    currency: "UAH",
  });
}

export function quantityFormat(
  value: string | number,
  unit: "kilogram" | "piece" = "kilogram",
) {
  if (unit === "piece") {
    return `${value || 0} (шт.)`;
  }
  return (value || 0).toLocaleString("uk-UA", {
    style: "unit",
    unit,
    unitDisplay: "short",
  });
}

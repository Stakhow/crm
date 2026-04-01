/* @param {date} ISO 8601 standard */
export function dateToLocalString(date: string) {
  return new Date(date).toLocaleString("uk-UA", {
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

export function getWeightOfBag(
  length: number,
  width: number,
  thickness: number,
  quantity: number,
): number {
  if (length > 0 && width > 0 && thickness > 0 && quantity > 0)
    return Number(
      (
        length *
        0.01 *
        width *
        0.01 *
        (thickness * 0.001 * 2 * quantity)
      ).toFixed(3),
    );
  else return 0;
}

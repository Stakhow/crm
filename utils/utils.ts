/* @param {date} ISO 8601 standard */
export function dateToLocalString(date: string) {
  return new Date(date).toLocaleString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

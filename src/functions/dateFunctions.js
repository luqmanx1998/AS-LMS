export function formatDateRange(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const sameMonth = startDate.getMonth() === endDate.getMonth();
  const sameYear = startDate.getFullYear() === endDate.getFullYear();

  const options = { day: "numeric", month: "long" };

  if (sameMonth && sameYear) {
    // e.g. 15–18 October 2025
    return `${startDate.getDate()}–${endDate.getDate()} ${startDate.toLocaleString("en-US", { month: "long" })} ${startDate.getFullYear()}`;
  } else if (sameYear) {
    // e.g. 28 September – 2 October 2025
    return `${startDate.toLocaleDateString("en-US", options)} – ${endDate.toLocaleDateString("en-US", options)} ${startDate.getFullYear()}`;
  } else {
    // e.g. 28 December 2025 – 2 January 2026
    return `${startDate.toLocaleDateString("en-US", options)} ${startDate.getFullYear()} – ${endDate.toLocaleDateString("en-US", options)} ${endDate.getFullYear()}`;
  }
}

export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

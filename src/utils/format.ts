export function formatMoney(amount: string | number): string {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(value)) return String(amount);
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function nightsBetween(checkin: string, checkout: string): number {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diffMs = end.getTime() - start.getTime();
  if (Number.isNaN(diffMs) || diffMs <= 0) return 0;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function titleCase(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

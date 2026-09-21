import { titleCase } from "../utils/format";

const TONE_MAP: Record<string, "good" | "warn" | "bad" | "neutral"> = {
  vacant: "good",
  approved: "good",
  confirmed: "good",
  assigned: "good",
  booked: "warn",
  pending: "warn",
  occupied: "bad",
  rejected: "bad",
  refunded: "bad",
  unpaid: "bad",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONE_MAP[status] ?? "neutral";
  return <span className={`badge badge-${tone}`}>{titleCase(status)}</span>;
}

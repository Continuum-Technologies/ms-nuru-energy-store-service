import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { AvailabilityStatus } from "@/lib/inventory-status";

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; tone: NonNullable<BadgeProps["tone"]> }> = {
  IN_STOCK: { label: "In Stock", tone: "success" },
  LOW_STOCK: { label: "Low Stock", tone: "warning" },
  OUT_OF_STOCK: { label: "Out of Stock", tone: "danger" },
  AVAILABLE_ON_REQUEST: { label: "Available on Request", tone: "neutral" },
};

export interface StockBadgeProps {
  status: AvailabilityStatus;
  className?: string;
}

/** Maps a derived availability status onto the shared `Badge` tones — never a raw quantity (CLAUDE.md §4). */
export function StockBadge({ status, className }: Readonly<StockBadgeProps>) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge tone={config.tone} className={className}>
      {config.label}
    </Badge>
  );
}

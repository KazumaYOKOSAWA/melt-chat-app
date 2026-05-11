import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/types"
import { RISK_LABELS } from "@/lib/types"

interface RiskBadgeProps {
  level: RiskLevel
  className?: string
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        level === "low" && "bg-primary/10 text-primary",
        level === "medium" && "bg-amber-100 text-amber-700",
        level === "high" && "bg-red-100 text-red-700",
        className
      )}
    >
      {RISK_LABELS[level]}
    </span>
  )
}

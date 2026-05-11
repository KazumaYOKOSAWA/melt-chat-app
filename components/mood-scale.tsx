"use client"

import { cn } from "@/lib/utils"

interface MoodScaleProps {
  label: string
  value: number
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
}

export function MoodScale({
  label,
  value,
  onChange,
  lowLabel = "低い",
  highLabel = "高い",
}: MoodScaleProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{value}/5</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-10">{lowLabel}</span>
        <div className="flex flex-1 justify-between gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all",
                value === num
                  ? "bg-primary text-primary-foreground scale-110 shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
              aria-label={`${label}: ${num}`}
              aria-pressed={value === num}
            >
              {num}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground w-10 text-right">{highLabel}</span>
      </div>
    </div>
  )
}

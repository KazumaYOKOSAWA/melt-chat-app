"use client"

import { X, Phone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CRISIS_RESOURCES } from "@/lib/types"

interface CrisisSupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CrisisSupportModal({ isOpen, onClose }: CrisisSupportModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-support-title"
    >
      <Card className="w-full max-w-md border-2 border-primary/30 shadow-xl">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full"
            onClick={onClose}
            aria-label="閉じる"
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle
            id="crisis-support-title"
            className="text-center text-lg font-semibold text-foreground"
          >
            今すぐ一人で抱えないでください
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            あなたの安全が最優先です。今すぐ身近な人、医療機関、または相談窓口に連絡してください。
          </p>

          <div className="space-y-3">
            {CRISIS_RESOURCES.map((resource) => (
              <div
                key={resource.id}
                className="rounded-xl border border-border bg-secondary/50 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{resource.name}</h3>
                    {resource.description && (
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {resource.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {resource.phone && (
                      <a
                        href={`tel:${resource.phone}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                        aria-label={`${resource.name}に電話する`}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/80"
                        aria-label={`${resource.name}のサイトを開く`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            このウィンドウを閉じても、いつでも相談窓口を確認できます。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

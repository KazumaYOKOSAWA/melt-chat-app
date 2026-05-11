"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const canDoItems = [
  "気持ちを言葉にする",
  "悩みを整理する",
  "小さなセルフケアを提案する",
  "気分の変化を記録する",
]

const cannotDoItems = [
  "病気の診断",
  "治療方針の提示",
  "薬の助言",
  "緊急時の対応",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [understood, setUnderstood] = useState(false)

  const handleStart = () => {
    console.log("[v0] Onboarding completed, navigating to mood check")
    // TODO: Update user.onboardingCompleted in Supabase
    router.push("/mood-check")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">meltについて</h1>
          <p className="text-sm text-muted-foreground">
            はじめる前に、このアプリでできることを確認してください。
          </p>
        </div>

        {/* Can Do Card */}
        <Card className="border-primary/30 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              できること
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {canDoItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Cannot Do Card */}
        <Card className="border-muted shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
              <X className="h-5 w-5" aria-hidden="true" />
              できないこと
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-3">
              {cannotDoItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                    <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Checkbox */}
        <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-4">
          <Checkbox
            id="understood"
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked === true)}
            className="h-5 w-5"
          />
          <Label
            htmlFor="understood"
            className="text-sm font-medium leading-relaxed cursor-pointer"
          >
            上記を理解しました
          </Label>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!understood}
          className="w-full h-12 text-base font-medium rounded-xl shadow-md"
        >
          はじめる
        </Button>
      </div>
    </main>
  )
}

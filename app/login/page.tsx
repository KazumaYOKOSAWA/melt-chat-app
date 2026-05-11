"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CrisisSupportModal } from "@/components/crisis-support-modal"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [showCrisisModal, setShowCrisisModal] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser()

      // if (error) {
      //   console.error("checkAuth error:", error)
      // }

      if (data.user) {
        router.replace("/")
        return
      }

      setAuthChecking(false)
    }

    checkAuth()
  }, [router, supabase])

  async function handleGoogleLogin() {
    if (isLoggingIn) return

    setIsLoggingIn(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error("Google login error:", error)
      setIsLoggingIn(false)
    }
  }

  if (authChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">ログイン状態を確認しています...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">
                m
              </span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">melt</h1>
          </div>

          <p className="text-balance text-lg leading-relaxed text-muted-foreground">
            ひとりで抱えた気持ちを、少しずつ言葉にする場所。
          </p>
        </div>

        <Card className="border-0 bg-card/80 shadow-lg backdrop-blur-sm">
          <CardContent className="pt-6">
            <p className="text-center text-sm leading-relaxed text-foreground">
              今日の気持ちをチャットで整理し、小さなセルフケアにつなげます。
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-center py-4">
          <div className="flex h-32 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="space-y-2 text-center">
              <div className="flex justify-center gap-1">
                <div className="h-3 w-3 rounded-full bg-primary/30" />
                <div className="h-3 w-3 rounded-full bg-primary/50" />
                <div className="h-3 w-3 rounded-full bg-primary/70" />
              </div>
              <p className="text-xs text-muted-foreground">心を整える</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="h-12 w-full rounded-xl text-base font-medium shadow-md"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ログイン中...
              </>
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ログイン済みの場合は、自動的にホーム画面へ移動します。
          </p>
        </div>

        <Card className="border border-amber-200 bg-amber-50/50">
          <CardContent className="pb-4 pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />

              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-amber-800">
                  緊急時はこのアプリではなく、身近な人・医療機関・相談窓口に連絡してください。
                </p>

                <Button
                  variant="link"
                  className="h-auto p-0 text-sm text-amber-700 hover:text-amber-900"
                  onClick={() => setShowCrisisModal(true)}
                >
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  相談窓口を見る
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="px-4 text-center text-xs leading-relaxed text-muted-foreground">
          meltは医療・診断・治療を目的としたサービスではありません。
          つらさを言葉にし、セルフケアや相談行動につなげるためのサポートツールです。
        </p>
      </div>

      <CrisisSupportModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />
    </main>
  )
}
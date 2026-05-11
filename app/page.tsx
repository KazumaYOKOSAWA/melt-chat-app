"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  History,
  TrendingUp,
  LogOut,
  Loader2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { SessionTimeout } from "@/components/session-timeout";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    async function checkAuth() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      const name =
        data.user.user_metadata?.name ??
        data.user.user_metadata?.full_name ??
        data.user.email ??
        "";

      setUserName(name);
      setLoading(false);
    }

    checkAuth();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">読み込んでいます...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <SessionTimeout />
      <DesktopSidebar />

      <main className="min-h-screen pb-24 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-md">
                <span className="text-xl font-bold text-primary-foreground">
                  m
                </span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">melt</h1>
                <p className="text-sm text-muted-foreground">
                  おかえりなさい{userName ? `、${userName}さん` : ""}
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              今日の気持ちを少しだけ言葉にして、無理のないセルフケアにつなげましょう。
            </p>
          </div>

          <Card className="mb-5 border-primary/20 bg-primary/5 shadow-md">
            <CardContent className="py-5">
              <div className="flex items-start gap-3">
                <Heart className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h2 className="font-semibold text-foreground">
                    今日はどこから始めますか？
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    まとまっていなくても大丈夫です。今の状態に近い入口を選んでください。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <Button
              asChild
              className="h-auto justify-start rounded-2xl px-4 py-4 text-left shadow-md"
            >
              <Link href="/mood-check">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5" />
                  <div>
                    <p className="font-medium">気分チェックから始める</p>
                    <p className="text-xs opacity-80">
                      今の気分・不安・疲労・孤独感を記録します
                    </p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto justify-start rounded-2xl px-4 py-4 text-left"
            >
              <Link href="/chat">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">すぐにチャットする</p>
                    <p className="text-xs text-muted-foreground">
                      今の気持ちをそのまま書き出します
                    </p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto justify-start rounded-2xl px-4 py-4 text-left"
            >
              <Link href="/history">
                <div className="flex items-center gap-3">
                  <History className="h-5 w-5" />
                  <div>
                    <p className="font-medium">過去の記録を見る</p>
                    <p className="text-xs text-muted-foreground">
                      会話履歴や気分の変化を振り返ります
                    </p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-auto justify-start rounded-2xl px-4 py-4 text-left"
            >
              <Link href="/reflection">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5" />
                  <div>
                    <p className="font-medium">最近の傾向を見る</p>
                    <p className="text-xs text-muted-foreground">
                      気分スコアやよく出るテーマを確認します
                    </p>
                  </div>
                </div>
              </Link>
            </Button>
          </div>

          <div className="mt-6">
            <Button
              variant="ghost"
              className="w-full rounded-xl text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </div>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            meltは医療・診断・治療を目的としたサービスではありません。
            緊急時は身近な人・医療機関・相談窓口に連絡してください。
          </p>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

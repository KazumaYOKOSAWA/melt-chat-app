"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, MessageCircle, Calendar, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { SessionTimeout } from "@/components/session-timeout";
import { createClient } from "@/lib/supabase/client";
import type { RiskLevel } from "@/lib/types";

type ConversationRow = {
  id: string;
  user_id: string;
  title: string | null;
  risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
};

type MoodLogRow = {
  id: string;
  user_id: string;
  mood_score: number;
  anxiety_score: number;
  fatigue_score: number;
  loneliness_score: number;
  note: string | null;
  created_at: string;
};

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "low";
}

export default function HistoryPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<"mood" | "conversations">(
    "conversations",
  );
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("getUser error:", userError);
        setLoading(false);
        return;
      }

      const userId = userData.user.id;

      const { data: conversationData, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id, user_id, title, risk_level, created_at, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

      if (conversationError) {
        console.error("fetch conversations error:", conversationError);
      } else {
        setConversations(
          (conversationData ?? []).map((conversation) => ({
            id: conversation.id,
            user_id: conversation.user_id,
            title: conversation.title,
            risk_level: normalizeRiskLevel(conversation.risk_level),
            created_at: conversation.created_at,
            updated_at: conversation.updated_at,
          })),
        );
      }

      const { data: moodData, error: moodError } = await supabase
        .from("mood_logs")
        .select(
          "id, user_id, mood_score, anxiety_score, fatigue_score, loneliness_score, note, created_at",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (moodError) {
        console.error("fetch mood logs error:", moodError);
      } else {
        setMoodLogs(moodData ?? []);
      }

      setLoading(false);
    }

    fetchHistory();
  }, []);

  const moodTrend = moodLogs.slice(0, 5).map((log) => ({
    date: new Date(log.created_at).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    }),
    mood: log.mood_score,
    anxiety: log.anxiety_score,
    fatigue: log.fatigue_score,
  }));

  return (
    <>
      <SessionTimeout />
      <DesktopSidebar />

      <main className="min-h-screen pb-24 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">履歴</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              過去の気分記録と会話を確認できます
            </p>
          </div>

          <div className="mb-6 flex gap-2">
            <Button
              variant={activeTab === "mood" ? "default" : "outline"}
              onClick={() => setActiveTab("mood")}
              className="flex-1 rounded-xl"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              気分の推移
            </Button>

            <Button
              variant={activeTab === "conversations" ? "default" : "outline"}
              onClick={() => setActiveTab("conversations")}
              className="flex-1 rounded-xl"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              会話履歴
            </Button>
          </div>

          {loading && (
            <Card className="shadow-md">
              <CardContent className="flex items-center justify-center gap-2 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  履歴を読み込んでいます...
                </span>
              </CardContent>
            </Card>
          )}

          {!loading && activeTab === "mood" && (
            <div className="space-y-4">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    気分の推移（直近5件）
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {moodTrend.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        まだ気分記録がありません
                      </p>
                      <Button asChild className="mt-4 rounded-xl">
                        <Link href="/mood-check">気分を記録する</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex h-24 items-end justify-between gap-2">
                        {[...moodTrend].reverse().map((day, index) => (
                          <div
                            key={`${day.date}-${index}`}
                            className="flex flex-1 flex-col items-center gap-1"
                          >
                            <div
                              className="w-full rounded-t-lg bg-primary/80 transition-all"
                              style={{ height: `${day.mood * 18}px` }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {day.date}
                            </span>
                          </div>
                        ))}
                      </div>

                      <p className="text-center text-xs text-muted-foreground">
                        気分スコア（1〜5）
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h2 className="text-sm font-medium text-foreground">
                  気分記録一覧
                </h2>

                {moodLogs.map((log) => (
                  <Card key={log.id} className="shadow-sm">
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {new Date(log.created_at).toLocaleDateString(
                                "ja-JP",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>

                          {log.note && (
                            <p className="pl-6 text-sm text-muted-foreground">
                              {log.note}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 text-xs">
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                            気分 {log.mood_score}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-1 text-secondary-foreground">
                            不安 {log.anxiety_score}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!loading && activeTab === "conversations" && (
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <Card className="shadow-md">
                  <CardContent className="py-12 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      まだ会話履歴がありません
                    </p>
                    <Button asChild className="mt-4 rounded-xl">
                      <Link href="/chat">チャットを始める</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    href={`/chat?conversationId=${conversation.id}`}
                    className="block"
                  >
                    <Card className="cursor-pointer shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <h3 className="font-medium text-foreground">
                              {conversation.title ?? "無題の会話"}
                            </h3>

                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  conversation.updated_at,
                                ).toLocaleDateString("ja-JP", {
                                  month: "long",
                                  day: "numeric",
                                })}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  conversation.updated_at,
                                ).toLocaleTimeString("ja-JP", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>

                          <RiskBadge level={conversation.risk_level} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Tag,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { SessionTimeout } from "@/components/session-timeout";
import { createClient } from "@/lib/supabase/client";

type Trend = "up" | "down" | "stable";

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

type MessageRow = {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
};

interface ScoreCardProps {
  title: string;
  score: number | null;
  trend?: Trend;
  description?: string;
}

function ScoreCard({ title, score, trend, description }: ScoreCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-red-500"
      : trend === "down"
        ? "text-primary"
        : "text-muted-foreground";

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">
              {score === null ? (
                <span className="text-base font-normal text-muted-foreground">
                  未記録
                </span>
              ) : (
                <>
                  {score.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /5
                  </span>
                </>
              )}
            </p>
          </div>

          {trend && score !== null && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-xs">
                {trend === "up" ? "上昇" : trend === "down" ? "低下" : "安定"}
              </span>
            </div>
          )}
        </div>

        {description && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function average(values: number[]) {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getTrend(values: number[]): Trend {
  if (values.length < 2) return "stable";

  const midpoint = Math.floor(values.length / 2);
  const older = values.slice(midpoint);
  const newer = values.slice(0, midpoint);

  const olderAverage = average(older);
  const newerAverage = average(newer);

  if (olderAverage === null || newerAverage === null) return "stable";

  const diff = newerAverage - olderAverage;

  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "stable";
}

function extractThemes(messages: MessageRow[]) {
  const text = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join(" ");

  const themeCandidates = [
    { label: "研究", keywords: ["研究", "論文", "実験", "教授", "発表"] },
    { label: "仕事", keywords: ["仕事", "職場", "上司", "バイト", "業務"] },
    {
      label: "人間関係",
      keywords: ["友達", "恋人", "先輩", "後輩", "人間関係"],
    },
    {
      label: "将来不安",
      keywords: ["将来", "就活", "キャリア", "内定", "不安"],
    },
    { label: "孤独感", keywords: ["孤独", "ひとり", "寂しい", "居場所"] },
    {
      label: "疲労",
      keywords: ["疲れ", "疲労", "眠い", "休みたい", "しんどい"],
    },
    { label: "睡眠", keywords: ["眠れない", "睡眠", "寝れない", "夜"] },
    { label: "自己否定", keywords: ["自分が嫌", "価値", "だめ", "できない"] },
  ];

  return themeCandidates
    .filter((theme) => theme.keywords.some((keyword) => text.includes(keyword)))
    .map((theme) => theme.label)
    .slice(0, 6);
}

function buildInsight({
  moodAverage,
  anxietyAverage,
  fatigueAverage,
  lonelinessAverage,
  themes,
}: {
  moodAverage: number | null;
  anxietyAverage: number | null;
  fatigueAverage: number | null;
  lonelinessAverage: number | null;
  themes: string[];
}) {
  if (
    moodAverage === null &&
    anxietyAverage === null &&
    fatigueAverage === null &&
    lonelinessAverage === null
  ) {
    return "まだ十分な記録がありません。まずは気分チェックやチャットを数回使ってみると、最近の傾向が見えやすくなります。";
  }

  if (fatigueAverage !== null && fatigueAverage >= 4) {
    return "最近は疲労感が高めです。新しいことを増やすより、まずは休息・睡眠・予定を減らすことを優先してもよさそうです。";
  }

  if (anxietyAverage !== null && anxietyAverage >= 4) {
    return "最近は不安が高めに出ています。不安の原因をすべて解決しようとするより、まずは今日できる小さな行動に分けることが役立つかもしれません。";
  }

  if (lonelinessAverage !== null && lonelinessAverage >= 4) {
    return "最近は孤独感がやや強い傾向があります。信頼できる人に短い一言を送る、外に出る、誰かのいる場所に行くなど、小さな接点を作ることが助けになるかもしれません。";
  }

  if (themes.length > 0) {
    return `最近は「${themes.slice(0, 2).join("」「")}」に関する話題が出ています。気持ちが動きやすいテーマとして、少し丁寧に扱ってもよさそうです。`;
  }

  return "全体として大きな偏りはまだ見えていません。引き続き、気分チェックとチャットを続けることで、自分の状態の変化に気づきやすくなります。";
}

export default function ReflectionPage() {
  const supabase = createClient();

  const [moodLogs, setMoodLogs] = useState<MoodLogRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReflectionData() {
      setLoading(true);

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          console.error("getUser error:", userError);
          return;
        }

        const userId = userData.user.id;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: moodData, error: moodError } = await supabase
          .from("mood_logs")
          .select(
            "id, user_id, mood_score, anxiety_score, fatigue_score, loneliness_score, note, created_at",
          )
          .eq("user_id", userId)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false });

        if (moodError) {
          console.error("fetch mood logs error:", moodError);
        } else {
          setMoodLogs(moodData ?? []);
        }

        const { data: messageData, error: messageError } = await supabase
          .from("messages")
          .select("id, content, role, created_at")
          .eq("user_id", userId)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: false })
          .limit(100);

        if (messageError) {
          console.error("fetch messages error:", messageError);
        } else {
          setMessages((messageData ?? []) as MessageRow[]);
        }
      } catch (error) {
        console.error("fetchReflectionData error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReflectionData();
  }, []);

  const reflection = useMemo(() => {
    const moodValues = moodLogs.map((log) => log.mood_score);
    const anxietyValues = moodLogs.map((log) => log.anxiety_score);
    const fatigueValues = moodLogs.map((log) => log.fatigue_score);
    const lonelinessValues = moodLogs.map((log) => log.loneliness_score);

    const moodAverage = average(moodValues);
    const anxietyAverage = average(anxietyValues);
    const fatigueAverage = average(fatigueValues);
    const lonelinessAverage = average(lonelinessValues);

    const themes = extractThemes(messages);

    const insight = buildInsight({
      moodAverage,
      anxietyAverage,
      fatigueAverage,
      lonelinessAverage,
      themes,
    });

    return {
      moodAverage,
      anxietyAverage,
      fatigueAverage,
      lonelinessAverage,
      moodTrend: getTrend(moodValues),
      anxietyTrend: getTrend(anxietyValues),
      fatigueTrend: getTrend(fatigueValues),
      lonelinessTrend: getTrend(lonelinessValues),
      themes,
      insight,
    };
  }, [moodLogs, messages]);

  return (
    <>
      <SessionTimeout />
      <DesktopSidebar />

      <main className="min-h-screen pb-24 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">
              最近の気持ちの変化
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              直近7日間の記録から
            </p>
          </div>

          {loading ? (
            <Card className="shadow-md">
              <CardContent className="flex items-center justify-center gap-2 py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  振り返りを読み込んでいます...
                </span>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3">
                <ScoreCard
                  title="気分スコア"
                  score={reflection.moodAverage}
                  trend={reflection.moodTrend}
                />
                <ScoreCard
                  title="不安スコア"
                  score={reflection.anxietyAverage}
                  trend={reflection.anxietyTrend}
                />
                <ScoreCard
                  title="疲労スコア"
                  score={reflection.fatigueAverage}
                  trend={reflection.fatigueTrend}
                />
                <ScoreCard
                  title="孤独感スコア"
                  score={reflection.lonelinessAverage}
                  trend={reflection.lonelinessTrend}
                />
              </div>

              <Card className="mb-6 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <Tag className="h-4 w-4 text-primary" />
                    よく出てきたテーマ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reflection.themes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      まだテーマを抽出できるほどの会話記録がありません。
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {reflection.themes.map((theme) => (
                        <span
                          key={theme}
                          className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                        >
                          {theme}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/30 bg-primary/5 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                    <Lightbulb className="h-4 w-4" />
                    気づき
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-foreground">
                    {reflection.insight}
                  </p>
                </CardContent>
              </Card>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                この分析は参考情報です。専門的なアドバイスが必要な場合は、
                医療機関や相談窓口にご連絡ください。
              </p>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}

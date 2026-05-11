"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MoodScale } from "@/components/mood-scale";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { SessionTimeout } from "@/components/session-timeout";
import type { MoodCheckInput } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const MAX_NOTE_LENGTH = 200;

export default function MoodCheckPage() {
  const router = useRouter();
  const supabase = createClient();

  const [moodData, setMoodData] = useState<MoodCheckInput>({
    mood: 3,
    anxiety: 3,
    fatigue: 3,
    loneliness: 3,
    note: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSaveAndStartChat() {
    if (isSaving) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("getUser error:", userError);
        setErrorMessage(
          "ログイン状態を確認できませんでした。もう一度ログインしてください。",
        );
        return;
      }

      const { error } = await supabase.from("mood_logs").insert({
        user_id: userData.user.id,
        mood_score: moodData.mood,
        anxiety_score: moodData.anxiety,
        fatigue_score: moodData.fatigue,
        loneliness_score: moodData.loneliness,
        note: moodData.note.trim() || null,
      });

      if (error) {
        console.error("save mood log error:", error);
        setErrorMessage(
          "気分記録の保存に失敗しました。少し時間をおいてもう一度試してください。",
        );
        return;
      }

      router.push("/chat");
    } catch (error) {
      console.error("handleSaveAndStartChat error:", error);
      setErrorMessage(
        "予期しないエラーが発生しました。少し時間をおいてもう一度試してください。",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleSkipAndStartChat() {
    router.push("/chat");
  }

  return (
    <>
      <SessionTimeout />
      <DesktopSidebar />

      <main className="min-h-screen pb-24 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold text-foreground">
              今日の気分チェック
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              今の状態を教えてください
            </p>
          </div>

          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">
                気持ちの状態
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <MoodScale
                label="気分"
                value={moodData.mood}
                onChange={(value) =>
                  setMoodData((prev) => ({ ...prev, mood: value }))
                }
                lowLabel="悪い"
                highLabel="良い"
              />

              <MoodScale
                label="不安"
                value={moodData.anxiety}
                onChange={(value) =>
                  setMoodData((prev) => ({ ...prev, anxiety: value }))
                }
                lowLabel="低い"
                highLabel="高い"
              />

              <MoodScale
                label="疲労"
                value={moodData.fatigue}
                onChange={(value) =>
                  setMoodData((prev) => ({ ...prev, fatigue: value }))
                }
                lowLabel="低い"
                highLabel="高い"
              />

              <MoodScale
                label="孤独感"
                value={moodData.loneliness}
                onChange={(value) =>
                  setMoodData((prev) => ({ ...prev, loneliness: value }))
                }
                lowLabel="低い"
                highLabel="高い"
              />
            </CardContent>
          </Card>

          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                今の気持ちを少しだけ書く
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  （任意）
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Textarea
                value={moodData.note}
                onChange={(e) =>
                  setMoodData((prev) => ({
                    ...prev,
                    note: e.target.value.slice(0, MAX_NOTE_LENGTH),
                  }))
                }
                placeholder="まとまっていなくても大丈夫です..."
                className="min-h-[100px] resize-none rounded-xl"
                disabled={isSaving}
              />

              <p className="mt-2 text-right text-xs text-muted-foreground">
                {moodData.note.length} / {MAX_NOTE_LENGTH}
              </p>
            </CardContent>
          </Card>

          {errorMessage && (
            <Card className="mb-4 border-destructive/30 bg-destructive/5">
              <CardContent className="py-3">
                <p className="text-sm text-destructive">{errorMessage}</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleSaveAndStartChat}
              disabled={isSaving}
              className="h-12 w-full rounded-xl text-base font-medium shadow-md"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存しています...
                </>
              ) : (
                "保存してチャットを始める"
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkipAndStartChat}
              disabled={isSaving}
              className="w-full rounded-xl text-muted-foreground"
            >
              記録せずにチャットへ進む
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}

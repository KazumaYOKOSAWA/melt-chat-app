"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Trash2,
  LogOut,
  Shield,
  ChevronRight,
  Loader2,
  Camera,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { SessionTimeout } from "@/components/session-timeout";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    async function fetchUserAndProfile() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error("getUser error:", error);
        router.replace("/login");
        return;
      }

      const user = data.user;
      const metadata = user.user_metadata ?? {};

      const fallbackName =
        metadata.name ?? metadata.full_name ?? user.email ?? "ユーザー";
      const fallbackAvatar = metadata.avatar_url ?? metadata.picture ?? null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("fetch profile error:", profileError);
      }

      if (!profile) {
        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: user.id,
          display_name: fallbackName,
          avatar_url: fallbackAvatar,
          //updated_at: new Date().toISOString(),
        });

        if (upsertError) {
          console.error("create profile error:", upsertError);
        }
      }

      const name = profile?.display_name ?? fallbackName;
      const avatarUrl = profile?.avatar_url ?? fallbackAvatar;

      setUserProfile({
        id: user.id,
        name,
        email: user.email ?? "",
        avatarUrl,
      });
      setDisplayName(name);
      setIsLoading(false);
    }

    fetchUserAndProfile();
  }, [router, supabase]);

  async function handleSaveProfile() {
    if (!userProfile || isSavingProfile) return;

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      alert("ニックネームを入力してください。");
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: userProfile.id,
        display_name: trimmedName,
        avatar_url: userProfile.avatarUrl ?? null,
        //updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("save profile error:", error);
        alert("プロフィールの保存に失敗しました。");
        return;
      }

      setUserProfile((prev) =>
        prev ? { ...prev, name: trimmedName } : prev
      );

      alert("プロフィールを保存しました。");
    } catch (error) {
      console.error("handleSaveProfile error:", error);
      alert("プロフィール保存中にエラーが発生しました。");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!userProfile) return;

    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。");
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("画像サイズは2MB以下にしてください。");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop() ?? "png";
      const filePath = `${userProfile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("avatar upload error:", uploadError);
        alert("画像のアップロードに失敗しました。");
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userProfile.id,
        display_name: displayName.trim() || userProfile.name,
        avatar_url: publicUrl,
        //updated_at: new Date().toISOString(),
      });

      if (profileError) {
        console.error("avatar profile update error:", profileError);
        alert("プロフィール画像の保存に失敗しました。");
        return;
      }

      setUserProfile((prev) =>
        prev ? { ...prev, avatarUrl: publicUrl } : prev
      );
    } catch (error) {
      console.error("handleAvatarChange error:", error);
      alert("画像更新中にエラーが発生しました。");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  }

  const handleDeleteData = async () => {
    setIsDeleting(true);

    try {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError || !data.user) {
        console.error("getUser error:", userError);
        alert("ログイン状態を確認できませんでした。もう一度ログインしてください。");
        router.replace("/login");
        return;
      }

      const userId = data.user.id;

      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("user_id", userId);

      if (messagesError) {
        console.error("delete messages error:", messagesError);
        alert("メッセージの削除に失敗しました。");
        return;
      }

      const { error: conversationsError } = await supabase
        .from("conversations")
        .delete()
        .eq("user_id", userId);

      if (conversationsError) {
        console.error("delete conversations error:", conversationsError);
        alert("会話履歴の削除に失敗しました。");
        return;
      }

      const { error: moodLogsError } = await supabase
        .from("mood_logs")
        .delete()
        .eq("user_id", userId);

      if (moodLogsError) {
        console.error("delete mood logs error:", moodLogsError);
        alert("気分記録の削除に失敗しました。");
        return;
      }

      alert("会話データと気分記録を削除しました。");
      router.refresh();
    } catch (error) {
      console.error("handleDeleteData error:", error);
      alert("データ削除中にエラーが発生しました。");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("logout error:", error);
        alert("ログアウトに失敗しました。");
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("handleLogout error:", error);
      alert("ログアウト中にエラーが発生しました。");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <SessionTimeout />
        <DesktopSidebar />
        <main className="flex min-h-screen items-center justify-center pb-24 md:pb-8 md:pl-64">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">設定を読み込んでいます...</p>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <SessionTimeout />
      <DesktopSidebar />

      <main className="min-h-screen pb-24 md:pb-8 md:pl-64">
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground">設定</h1>
          </div>

          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                プロフィール
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                  {userProfile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={userProfile.avatarUrl}
                      alt="プロフィール画像"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}

                  {isUploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {userProfile?.name}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm text-muted-foreground">
                      {userProfile?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    ニックネーム
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="ニックネームを入力"
                    maxLength={30}
                    className="rounded-xl"
                    disabled={isSavingProfile}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {displayName.length}/30
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={isUploadingAvatar}
                    asChild
                  >
                    <label className="cursor-pointer">
                      {isUploadingAvatar ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="mr-2 h-4 w-4" />
                      )}
                      画像を変更
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </Button>

                  <Button
                    type="button"
                    className="rounded-xl"
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile || !displayName.trim()}
                  >
                    {isSavingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    保存
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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
                <span>Googleアカウントでログイン中</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                データ管理
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-full justify-between rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeleting || isLoggingOut}
                  >
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span>会話データを削除</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      すべての会話履歴と気分記録が完全に削除されます。
                      この操作は取り消せません。
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">
                      キャンセル
                    </AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleDeleteData}
                      disabled={isDeleting}
                      className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "削除中..." : "削除する"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                className="h-12 w-full justify-between rounded-xl"
                onClick={handleLogout}
                disabled={isDeleting || isLoggingOut}
              >
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "ログアウト中..." : "ログアウト"}</span>
                </div>
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Shield className="h-4 w-4 text-primary" />
                プライバシー
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                会話内容は本人のみが閲覧できます。保存時にはサーバー側で暗号化し、
                データベースには平文の本文を保存しない設計にしています。
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-2 text-center">
            <p className="text-sm font-medium text-foreground">melt</p>
            <p className="text-xs text-muted-foreground">
              ひとりで抱えた気持ちを、少しずつ言葉にする場所。
            </p>
            <p className="text-xs text-muted-foreground">Version 1.0.0 (MVP)</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </>
  );
}
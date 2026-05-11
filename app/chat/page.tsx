"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Phone, Save, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat-message";
import { CrisisSupportModal } from "@/components/crisis-support-modal";
import { BottomNav } from "@/components/bottom-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { SessionTimeout } from "@/components/session-timeout";
import { useUserProfile } from "@/hooks/use-user-profile";
import type { Message, RiskLevel } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const MAX_MESSAGE_LENGTH = 500;

const INITIAL_ASSISTANT_TEXT =
  "こんばんは。来てくれてありがとうございます。今の気持ちは、まだまとまっていなくても大丈夫です。少しずつでいいので、ここに書いてみてください。";

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "low";
}

export default function ChatPage() {
  const supabase = createClient();
  const router = useRouter();
  const { profile } = useUserProfile();
  const [conversationIdFromUrl, setConversationIdFromUrl] = useState<
    string | null
  >(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGreetingTyping, setIsGreetingTyping] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isGreetingTyping]);

  const showInitialGreeting = useCallback(() => {
    setMessages([]);
    setIsGreetingTyping(true);

    const messageId = crypto.randomUUID();

    const initialMessage: Message = {
      id: messageId,
      conversationId: "current",
      role: "assistant",
      content: "",
      riskLevel: "low",
      createdAt: new Date().toISOString(),
    };

    let index = 0;
    let typingTimer: number | undefined;

    const startTimer = window.setTimeout(() => {
      setMessages([initialMessage]);

      typingTimer = window.setInterval(() => {
        index += 1;

        const nextText = INITIAL_ASSISTANT_TEXT.slice(0, index);

        setMessages((prev) =>
          prev.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: nextText,
                }
              : message,
          ),
        );

        if (index >= INITIAL_ASSISTANT_TEXT.length) {
          if (typingTimer) {
            window.clearInterval(typingTimer);
          }

          setIsGreetingTyping(false);
        }
      }, 55);
    }, 650);

    return () => {
      window.clearTimeout(startTimer);

      if (typingTimer) {
        window.clearInterval(typingTimer);
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setConversationIdFromUrl(params.get("conversationId"));
  }, []);

  useEffect(() => {
    if (conversationIdFromUrl) return;

    setCurrentConversationId(null);
    return showInitialGreeting();
  }, [conversationIdFromUrl, showInitialGreeting]);

  useEffect(() => {
    async function fetchConversationMessages() {
      if (!conversationIdFromUrl) return;

      setIsLoading(true);
      setIsGreetingTyping(false);

      try {
        const res = await fetch(
          `/api/messages?conversationId=${conversationIdFromUrl}`,
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error("fetch messages API error:", errorData);

          setMessages([
            {
              id: crypto.randomUUID(),
              conversationId: "current",
              role: "assistant",
              content:
                "会話履歴の読み込みに失敗しました。少し時間をおいてもう一度試してください。",
              riskLevel: "low",
              createdAt: new Date().toISOString(),
            },
          ]);

          return;
        }

        const data = await res.json();
        const loadedMessages: Message[] = data.messages ?? [];

        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        } else {
          showInitialGreeting();
        }

        setCurrentConversationId(conversationIdFromUrl);
      } catch (error) {
        console.error("fetchConversationMessages error:", error);

        setMessages([
          {
            id: crypto.randomUUID(),
            conversationId: "current",
            role: "assistant",
            content:
              "会話履歴の読み込み中にエラーが発生しました。少し時間をおいてもう一度試してください。",
            riskLevel: "low",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchConversationMessages();
  }, [conversationIdFromUrl, showInitialGreeting]);

  async function createConversation(userId: string, firstMessage: string) {
    const title =
      firstMessage.length > 24
        ? firstMessage.slice(0, 24) + "..."
        : firstMessage;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: userId,
        title,
        risk_level: "low",
      })
      .select("id")
      .single();

    if (error) {
      console.error("createConversation error:", error);
      throw error;
    }

    if (!data?.id) {
      throw new Error("conversation id was not returned");
    }

    return data.id as string;
  }

  async function saveMessage({
    conversationId,
    role,
    content,
    riskLevel = "low",
  }: {
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    riskLevel?: RiskLevel;
  }) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId,
        role,
        content,
        riskLevel,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      console.error("saveMessage API error:", data);
      throw new Error("Failed to save encrypted message");
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || isLoading || isGreetingTyping) return;

    const userText = input.trim();

    setInput("");
    setIsLoading(true);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData.user) {
        console.error("User not logged in:", userError);

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            conversationId: currentConversationId ?? "current",
            role: "assistant",
            content:
              "ログイン状態を確認できませんでした。もう一度ログインしてください。",
            riskLevel: "low",
            createdAt: new Date().toISOString(),
          },
        ]);

        return;
      }

      const userId = userData.user.id;

      let conversationId: string;

      if (currentConversationId) {
        conversationId = currentConversationId;
      } else {
        conversationId = await createConversation(userId, userText);
        setCurrentConversationId(conversationId);
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        role: "user",
        content: userText,
        riskLevel: "low",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      await saveMessage({
        conversationId,
        role: "user",
        content: userText,
        riskLevel: "low",
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
        }),
      });

      const data = await res.json();

      const riskLevel = normalizeRiskLevel(data.riskLevel);

      const assistantText =
        data.reply ??
        "すみません。うまく返答を生成できませんでした。少し時間をおいてもう一度試してください。";

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        conversationId,
        role: "assistant",
        content: assistantText,
        riskLevel,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      await saveMessage({
        conversationId,
        role: "assistant",
        content: assistantText,
        riskLevel,
      });

      const { error: updateError } = await supabase
        .from("conversations")
        .update({
          risk_level: riskLevel,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("updateConversation error:", updateError);
      }
    } catch (error) {
      console.error("handleSendMessage error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          conversationId: currentConversationId ?? "current",
          role: "assistant",
          content:
            "すみません。通信または保存中にエラーが発生しました。少し時間をおいてもう一度試してください。",
          riskLevel: "low",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleNewConversation() {
    setCurrentConversationId(null);
    setInput("");
    router.push("/chat");
    showInitialGreeting();
  }

  const handleSaveConversation = () => {
    alert("この会話は自動で保存されています");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <SessionTimeout />
      <DesktopSidebar />

      <main className="flex h-screen flex-col pb-20 md:pb-0 md:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground">melt</h1>
              <p className="text-xs text-muted-foreground">
                診断ではなく、気持ちの整理をサポートします
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={handleNewConversation}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                新しい会話
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setShowCrisisModal(true)}
              >
                <Phone className="mr-1.5 h-3.5 w-3.5" />
                相談窓口
              </Button>
            </div>
          </div>
        </header>

        {profile?.displayName && (
          <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
            {profile.displayName}さん、今の気持ちをそのまま書き出してみてください。
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isGreetingTyping && messages.length === 0 && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              </div>
            )}

            {isLoading && !isGreetingTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      考えています...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="sticky bottom-20 border-t border-border bg-card/95 backdrop-blur-sm md:bottom-0">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <p className="mb-2 text-center text-xs text-muted-foreground">
              自傷や自殺の危険がある場合は、AI応答ではなく相談窓口を表示します。
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="気持ちを書いてみてください..."
                  className="min-h-[48px] max-h-32 resize-none rounded-xl pr-12"
                  disabled={isLoading || isGreetingTyping}
                />

                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {input.length}/{MAX_MESSAGE_LENGTH}
                </span>
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading || isGreetingTyping}
                size="icon"
                className="h-12 w-12 rounded-xl"
                aria-label="送信"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveConversation}
                className="text-muted-foreground hover:text-foreground"
              >
                <Save className="mr-1.5 h-3.5 w-3.5" />
                自動保存されています
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />

      <CrisisSupportModal
        isOpen={showCrisisModal}
        onClose={() => setShowCrisisModal(false)}
      />
    </>
  );
}

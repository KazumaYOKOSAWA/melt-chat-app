// Risk Level Types
export type RiskLevel = "low" | "medium" | "high"

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "通常",
  medium: "注意",
  high: "要相談",
}

// Mood Log Types
export interface MoodLog {
  id: string
  userId: string
  date: string
  mood: number // 1-5
  anxiety: number // 1-5
  fatigue: number // 1-5
  loneliness: number // 1-5
  note?: string
  createdAt: string
}

// Message Types
export interface Message {
  id: string
  conversationId: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  riskLevel?: RiskLevel
}

// Conversation Types
export interface Conversation {
  id: string
  userId: string
  title: string
  summary?: string
  riskLevel: RiskLevel
  moodScore: number
  messages: Message[]
  createdAt: string
  updatedAt: string
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
  onboardingCompleted: boolean
}

// App State Types
export type AppPage = "welcome" | "onboarding" | "mood-check" | "chat" | "history" | "reflection" | "settings"

// Mood Check Input
export interface MoodCheckInput {
  mood: number
  anxiety: number
  fatigue: number
  loneliness: number
  note: string
}

// Crisis Support Resource
export interface CrisisResource {
  id: string
  name: string
  description?: string
  url?: string
  phone?: string
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: "mamorouyo",
    name: "まもろうよ こころ",
    description: "厚生労働省の相談窓口まとめサイト",
    url: "https://www.mhlw.go.jp/mamorouyokokoro/",
  },
  {
    id: "inochi-sos",
    name: "#いのちSOS",
    description: "0120-061-338（毎日16時〜21時、毎月10日は8時〜翌8時）",
    phone: "0120-061-338",
  },
  {
    id: "yorisoi",
    name: "よりそいホットライン",
    description: "0120-279-338（24時間対応）",
    phone: "0120-279-338",
  },
  {
    id: "emergency",
    name: "緊急時は119 / 110",
    description: "命の危険がある場合は迷わず電話してください",
    phone: "119",
  },
]

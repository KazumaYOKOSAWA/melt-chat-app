import type { User, MoodLog, Conversation, Message } from "./types"

// Mock User
export const mockUser: User = {
  id: "user-1",
  email: "tanaka@example.com",
  name: "田中 太郎",
  avatarUrl: undefined,
  createdAt: "2024-01-15T10:00:00Z",
  onboardingCompleted: true,
}

// Mock Mood Logs
export const mockMoodLogs: MoodLog[] = [
  {
    id: "mood-1",
    userId: "user-1",
    date: "2024-03-10",
    mood: 3,
    anxiety: 4,
    fatigue: 4,
    loneliness: 3,
    note: "仕事が忙しくて疲れている",
    createdAt: "2024-03-10T09:00:00Z",
  },
  {
    id: "mood-2",
    userId: "user-1",
    date: "2024-03-09",
    mood: 2,
    anxiety: 5,
    fatigue: 5,
    loneliness: 4,
    note: "眠れなかった",
    createdAt: "2024-03-09T08:30:00Z",
  },
  {
    id: "mood-3",
    userId: "user-1",
    date: "2024-03-08",
    mood: 4,
    anxiety: 2,
    fatigue: 3,
    loneliness: 2,
    note: "友人と話せて少し楽になった",
    createdAt: "2024-03-08T10:15:00Z",
  },
  {
    id: "mood-4",
    userId: "user-1",
    date: "2024-03-07",
    mood: 3,
    anxiety: 3,
    fatigue: 4,
    loneliness: 3,
    createdAt: "2024-03-07T09:45:00Z",
  },
  {
    id: "mood-5",
    userId: "user-1",
    date: "2024-03-06",
    mood: 2,
    anxiety: 4,
    fatigue: 5,
    loneliness: 4,
    note: "将来のことが不安",
    createdAt: "2024-03-06T08:00:00Z",
  },
]

// Mock Messages
const mockMessages1: Message[] = [
  {
    id: "msg-1-1",
    conversationId: "conv-1",
    role: "assistant",
    content: "こんばんは。今の気持ちを、まとまっていなくても大丈夫なので書いてみてください。",
    createdAt: "2024-03-10T20:00:00Z",
  },
  {
    id: "msg-1-2",
    conversationId: "conv-1",
    role: "user",
    content: "研究がうまくいかなくて、教授にも相談できないでいます。",
    createdAt: "2024-03-10T20:01:00Z",
  },
  {
    id: "msg-1-3",
    conversationId: "conv-1",
    role: "assistant",
    content: "話してくれてありがとうございます。研究のことで行き詰まっていて、さらに相談もしづらい状況なんですね。それはとても孤独でつらいですよね。教授に相談しづらいのは、何か理由がありますか？",
    createdAt: "2024-03-10T20:01:30Z",
  },
]

const mockMessages2: Message[] = [
  {
    id: "msg-2-1",
    conversationId: "conv-2",
    role: "assistant",
    content: "こんばんは。今の気持ちを、まとまっていなくても大丈夫なので書いてみてください。",
    createdAt: "2024-03-09T21:00:00Z",
  },
  {
    id: "msg-2-2",
    conversationId: "conv-2",
    role: "user",
    content: "最近、誰とも話したくないし、でも一人でいると寂しいです。",
    createdAt: "2024-03-09T21:02:00Z",
  },
  {
    id: "msg-2-3",
    conversationId: "conv-2",
    role: "assistant",
    content: "その矛盾した気持ち、よく分かります。人と話すエネルギーはないけれど、孤独感はある。それはとても疲れる状態ですね。今は無理に誰かと会わなくても大丈夫です。",
    createdAt: "2024-03-09T21:02:30Z",
  },
]

const mockMessages3: Message[] = [
  {
    id: "msg-3-1",
    conversationId: "conv-3",
    role: "assistant",
    content: "こんばんは。今の気持ちを、まとまっていなくても大丈夫なので書いてみてください。",
    createdAt: "2024-03-08T22:00:00Z",
  },
  {
    id: "msg-3-2",
    conversationId: "conv-3",
    role: "user",
    content: "疲れすぎて何もできない。布団から出られない日が続いています。",
    createdAt: "2024-03-08T22:03:00Z",
  },
  {
    id: "msg-3-3",
    conversationId: "conv-3",
    role: "assistant",
    content: "話してくれてありがとうございます。布団から出られないほど疲れているんですね。それは体と心が「休みたい」と強く訴えているサインかもしれません。今は何もできなくても大丈夫です。",
    createdAt: "2024-03-08T22:03:30Z",
  },
]

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    userId: "user-1",
    title: "研究の不安について話した",
    summary: "研究の進捗と教授への相談について",
    riskLevel: "low",
    moodScore: 3,
    messages: mockMessages1,
    createdAt: "2024-03-10T20:00:00Z",
    updatedAt: "2024-03-10T20:15:00Z",
  },
  {
    id: "conv-2",
    userId: "user-1",
    title: "人間関係のモヤモヤ",
    summary: "孤独感と人と会うエネルギーについて",
    riskLevel: "medium",
    moodScore: 2,
    messages: mockMessages2,
    createdAt: "2024-03-09T21:00:00Z",
    updatedAt: "2024-03-09T21:30:00Z",
  },
  {
    id: "conv-3",
    userId: "user-1",
    title: "疲れて何もできない日",
    summary: "極度の疲労と休息の必要性について",
    riskLevel: "medium",
    moodScore: 2,
    messages: mockMessages3,
    createdAt: "2024-03-08T22:00:00Z",
    updatedAt: "2024-03-08T22:20:00Z",
  },
]

// Reflection Data
export const mockReflectionData = {
  moodAverage: 2.8,
  anxietyAverage: 3.6,
  fatigueAverage: 4.2,
  lonelinessAverage: 3.2,
  commonThemes: ["研究", "孤独感", "将来不安", "睡眠不足"],
  insight: "最近は疲労スコアが高めです。新しいことを増やすより、まずは休息を予定に入れることが役立つかもしれません。",
}

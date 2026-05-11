import { NextResponse } from "next/server"
import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
})

const highRiskWords = [
  "死にたい",
  "消えたい",
  "自殺",
  "自傷",
  "生きたくない",
  "もう生きていたくない",
  "首を吊る",
  "飛び降り",
]

function detectRiskLevel(text: string): "low" | "medium" | "high" {
  if (highRiskWords.some((word) => text.includes(word))) {
    return "high"
  }

  if (
    text.includes("つらい") ||
    text.includes("苦しい") ||
    text.includes("限界") ||
    text.includes("眠れない")
  ) {
    return "medium"
  }

  return "low"
}

export async function POST(req: Request) {
  try {
    const { message, mood } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 }
      )
    }

    const riskLevel = detectRiskLevel(message)

    if (riskLevel === "high") {
      return NextResponse.json({
        riskLevel,
        reply:
          "今すぐ一人で抱えないでください。あなたの安全が最優先です。身近な人、医療機関、または相談窓口に連絡してください。緊急の危険がある場合は、119または110に連絡してください。",
      })
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "あなたはメンタルヘルス支援チャットアプリのサポートAIです。医師・カウンセラーではありません。診断、治療、薬の助言はしません。ユーザーの気持ちを否定せずに受け止め、状況を短く整理し、小さなセルフケア行動を1〜2個提案してください。返答は日本語で、やさしく、300字以内にしてください。",
        },
        {
          role: "user",
          content: `今日の気分情報: ${JSON.stringify(mood ?? {})}\n\nユーザーの発言: ${message}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    return NextResponse.json({
      riskLevel,
      reply:
        completion.choices[0]?.message?.content ??
        "すみません。うまく返答を生成できませんでした。",
    })
  } catch (error: any) {
    console.error("Groq API error:", error)

    if (error?.status === 429) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          riskLevel: "low",
          reply:
            "現在、無料利用枠の上限に達している可能性があります。少し時間をおいてから、もう一度試してください。",
        },
        { status: 429 }
      )
    }

    return NextResponse.json(
      {
        error: "FAILED_TO_GENERATE",
        riskLevel: "low",
        reply:
          "すみません。AI応答の生成中にエラーが発生しました。少し時間をおいてもう一度試してください。",
      },
      { status: 500 }
    )
  }
}
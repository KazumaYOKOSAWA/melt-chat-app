import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { encryptText, decryptText } from "@/lib/crypto"

type RiskLevel = "low" | "medium" | "high"

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (value === "low" || value === "medium" || value === "high") {
    return value
  }

  return "low"
}

function normalizeRole(value: unknown): "user" | "assistant" {
  if (value === "user" || value === "assistant") {
    return value
  }

  return "assistant"
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const conversationId = body.conversationId
    const role = normalizeRole(body.role)
    const content = body.content
    const riskLevel = normalizeRiskLevel(body.riskLevel)

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      )
    }

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      )
    }

    const encryptedContent = encryptText(content)

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: userData.user.id,
      role,
      content: null,
      encrypted_content: encryptedContent,
      risk_level: riskLevel,
    })

    if (error) {
      console.error("insert encrypted message error:", error)
      return NextResponse.json(
        { error: "Failed to save message" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST /api/messages error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const url = new URL(req.url)
    const conversationId = url.searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, role, content, encrypted_content, risk_level, created_at")
      .eq("conversation_id", conversationId)
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("fetch encrypted messages error:", error)
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    const messages = (data ?? []).map((message) => {
      let content = message.content ?? ""

      if (message.encrypted_content) {
        content = decryptText(message.encrypted_content)
      }

      return {
        id: message.id,
        conversationId: message.conversation_id,
        role: normalizeRole(message.role),
        content,
        riskLevel: normalizeRiskLevel(message.risk_level),
        createdAt: message.created_at,
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("GET /api/messages error:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000 // 30分

export function SessionTimeout() {
  const router = useRouter()
  const supabase = createClient()
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    function clearTimer() {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current)
      }
    }

    function startTimer() {
      clearTimer()

      timerRef.current = window.setTimeout(async () => {
        await supabase.auth.signOut()
        router.replace("/login")
      }, INACTIVITY_LIMIT_MS)
    }

    function resetTimer() {
      startTimer()
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"]

    events.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    startTimer()

    return () => {
      clearTimer()

      events.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
    }
  }, [router, supabase])

  return null
}
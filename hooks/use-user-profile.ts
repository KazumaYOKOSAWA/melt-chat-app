"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types"

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasUser, setHasUser] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile() {
      setLoading(true)

      const { data, error } = await supabase.auth.getUser()
      if (error) {
        console.error("getUser error:", error)
        setHasUser(false)
        setLoading(false)
        return
      }

      if (!data.user) {
        setHasUser(false)
        setLoading(false)
        return
      }

      setHasUser(true)

      const user = data.user
      const fallbackName =
        user.user_metadata?.name ??
        user.user_metadata?.full_name ??
        user.email ??
        "ユーザー"
      const fallbackAvatar =
        user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        console.error("fetch profile error:", profileError)
      }

      const name = profileData?.display_name ?? fallbackName
      const avatarUrl = profileData?.avatar_url ?? fallbackAvatar

      setProfile({
        id: user.id,
        displayName: name,
        email: user.email ?? "",
        avatarUrl,
      })
      setLoading(false)
    }

    fetchProfile()
  }, [])

  return { profile, loading, hasUser }
}

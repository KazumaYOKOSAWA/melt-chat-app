"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, BarChart3, MessageCircle, History, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", icon: Home, label: "ホーム" },
  { href: "/mood-check", icon: BarChart3, label: "気分記録" },
  { href: "/chat", icon: MessageCircle, label: "チャット" },
  { href: "/history", icon: History, label: "履歴" },
  { href: "/settings", icon: Settings, label: "設定" },
]

export function DesktopSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-border bg-card md:block">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">m</span>
          </div>
          <span className="text-xl font-semibold text-foreground">melt</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Safety Notice */}
        <div className="border-t border-border p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            meltは医療・診断・治療を目的としたサービスではありません。
          </p>
        </div>
      </div>
    </aside>
  )
}

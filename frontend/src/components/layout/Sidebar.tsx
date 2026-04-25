'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { APP_MODULES, PLACEHOLDER_BRAND } from "@/config/modules"

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="sidebar">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--text-2)" }}>
          Control Plane
        </div>
        <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700 }}>{PLACEHOLDER_BRAND.productName}</div>
      </div>

      <nav style={{ display: "grid", gap: 6 }}>
        {APP_MODULES.map((m) => {
          const active = pathname === m.href
          return (
            <Link
              key={m.id}
              href={m.href}
              style={{
                border: `1px solid ${active ? "#38588f" : "var(--line)"}`,
                background: active ? "#122748" : "transparent",
                borderRadius: 6,
                padding: "10px 11px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span>{m.label}</span>
              <small style={{ color: "var(--text-2)", textTransform: "uppercase", fontSize: 10 }}>{m.status}</small>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

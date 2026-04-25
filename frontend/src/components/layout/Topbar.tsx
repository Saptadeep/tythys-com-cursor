import { PLACEHOLDER_BRAND } from "@/config/modules"

export function Topbar() {
  return (
    <header className="topbar">
      <div>
        <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-2)" }}>
          Enterprise Preview
        </div>
        <div style={{ marginTop: 4, fontWeight: 600 }}>{PLACEHOLDER_BRAND.topbarTagline}</div>
      </div>
      <div className="status ok">Nominal</div>
    </header>
  )
}

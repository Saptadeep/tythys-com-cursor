import { PLACEHOLDER_BRAND } from "@/config/modules"

export function Footer() {
  return (
    <footer className="footer">
      <span>{PLACEHOLDER_BRAND.companyName} · Placeholder footer (customize in branding pass)</span>
      <span>v0.1.0-prelaunch</span>
    </footer>
  )
}

export type AppModule = {
  id: string
  label: string
  href: string
  status: "live" | "beta" | "mock"
}

export const APP_MODULES: AppModule[] = [
  { id: "overview", label: "Overview", href: "/", status: "live" },
  { id: "incidents", label: "Incidents", href: "/incidents", status: "beta" },
  { id: "endpoints", label: "Endpoints", href: "/endpoints", status: "beta" },
  { id: "timeline", label: "Timeline", href: "/timeline", status: "beta" },
  { id: "contact", label: "Get In Touch", href: "/contact", status: "mock" },
  { id: "login", label: "Login", href: "/auth/login", status: "mock" },
]

export const PLACEHOLDER_BRAND = {
  productName: "YOUR_PRODUCT_NAME",
  companyName: "YOUR_COMPANY",
  topbarTagline: "Revenue-risk visibility for API businesses",
}

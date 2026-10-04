import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Kit from "./kit"

export const metadata: Metadata = {
  title: "Component kit",
  robots: { index: false, follow: false },
}

/** Dev-only catalog of every design-system component. 404s in production builds. */
export default function KitPage() {
  if (process.env.NODE_ENV === "production") notFound()
  return <Kit />
}

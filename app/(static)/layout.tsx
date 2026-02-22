import SiteNav from "@/components/site-nav"

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-black text-white">
      <SiteNav />
      {children}
    </div>
  )
}

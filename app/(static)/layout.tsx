import { TopBar } from "@/components/shell/top-bar"

export default function StaticLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh overflow-y-auto overflow-x-hidden bg-bg text-fg">
      <TopBar variant="site" />
      {children}
    </div>
  )
}

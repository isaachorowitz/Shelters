import { Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between p-3 h-[56px] bg-neutral-900/80 backdrop-blur-sm text-white shadow-md">
      <div className="flex items-center gap-2">
        <Home className="h-6 w-6 text-primary" />
        <span className="text-xl font-semibold">ShelterNow</span>
      </div>
      <Button variant="ghost" size="icon" disabled className="text-white opacity-50 cursor-not-allowed">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Settings</span>
      </Button>
    </header>
  )
}

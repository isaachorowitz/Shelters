"use client"

import { Shield, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

export default function Header() {
  const [isAlertActive, setIsAlertActive] = useState(true)
  
  useEffect(() => {
    // Pulse animation for alert state
    const interval = setInterval(() => {
      setIsAlertActive(prev => !prev)
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-black/80 backdrop-blur-xl border-b border-red-500/50">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className={`h-8 w-8 text-red-500 transition-all ${isAlertActive ? 'scale-110' : 'scale-100'}`} />
            {isAlertActive && (
              <div className="absolute inset-0 h-8 w-8 animate-ping">
                <Shield className="h-8 w-8 text-red-500/50" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-white tracking-wider leading-none">SHELTER NOW</h1>
            <p className="text-[10px] text-red-400 font-bold tracking-widest uppercase">Bomb Shelter Locator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${isAlertActive ? 'bg-red-600/20' : 'bg-red-600/10'} border border-red-500/50 transition-all`}>
            <div className={`w-2 h-2 rounded-full ${isAlertActive ? 'bg-red-500' : 'bg-red-400'} animate-pulse`} />
            <span className="text-xs font-bold text-red-400">ACTIVE</span>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse hidden sm:block" />
        </div>
      </div>
    </header>
  )
}

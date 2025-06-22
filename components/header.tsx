"use client"

import { Shield, AlertTriangle } from "lucide-react"
import { useEffect, useState } from "react"

export default function Header() {
  const [isAlert, setIsAlert] = useState(false)

  useEffect(() => {
    // Simulate alert state changes
    const interval = setInterval(() => {
      setIsAlert(prev => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-3 h-[56px] bg-black/80 backdrop-blur-xl text-white shadow-lg border-b border-red-500/30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className={`h-8 w-8 ${isAlert ? 'text-red-500' : 'text-red-600'} transition-colors duration-300`} />
          {isAlert && (
            <div className="absolute inset-0 h-8 w-8 animate-ping">
              <Shield className="h-8 w-8 text-red-500/50" />
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">SHELTER NOW</h1>
          <p className="text-xs text-red-400 font-bold -mt-1">BOMB SHELTER LOCATOR</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isAlert && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/50 rounded-full animate-pulse">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-bold text-red-500">ALERT ACTIVE</span>
          </div>
        )}
        <div className="text-xs font-mono text-white/70">
          {new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </header>
  )
}

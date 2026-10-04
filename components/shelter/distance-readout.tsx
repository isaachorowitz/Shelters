import { cn } from "@/lib/utils"

/** Large distance figure with a small "מרחק" caption, right-aligned on the card. */
export function DistanceReadout({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-end flex-shrink-0 max-w-[90px]">
      <span className={cn("font-black text-fg leading-none", text.length > 6 ? "text-base" : "text-display")}>{text}</span>
      <span className="text-tiny text-brand-soft/80 font-semibold uppercase tracking-wide mt-0.5">מרחק</span>
    </div>
  )
}

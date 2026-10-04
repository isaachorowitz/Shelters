/**
 * Israeli emergency numbers, shown as tap-to-call links.
 * Verified 2026-10-04 against gov.il (Israel Police emergency information)
 * and Access Israel's essential numbers list. Change only from an official source.
 */
export const EMERGENCY_NUMBERS = [
  { number: "104", he: "פיקוד העורף", en: "Home Front", full: "Home Front Command" },
  { number: "101", he: "מד״א", en: "Ambulance", full: "Magen David Adom ambulance" },
  { number: "100", he: "משטרה", en: "Police", full: "Israel Police" },
  { number: "102", he: "כיבוי אש", en: "Fire", full: "Fire and Rescue" },
] as const

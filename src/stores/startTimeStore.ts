import { create } from "zustand"

export interface StartTimeStore {
  startTime: number
  setStartTime: (startTime: number) => void
}

export const useStartTimeStore = create<StartTimeStore>((set) => ({
  startTime: 0,
  setStartTime: (startTime) => set({ startTime: round4(startTime) }),
}))


function round4(num: number) {
  return Math.round(num * 10000) / 10000
}
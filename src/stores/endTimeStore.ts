import { create } from "zustand"

export interface EndTimeStore {
  endTime: number
  setEndTime: (endTime: number) => void
}

export const useEndTimeStore = create<EndTimeStore>((set) => ({
  endTime: 0,
  setEndTime: (endTime) => set({ endTime: round4(endTime) }),
}))

function round4(num: number) {
  return Math.round(num * 10000) / 10000
}
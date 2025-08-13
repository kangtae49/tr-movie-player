import { create } from "zustand"

export interface DurationStore {
  duration: number
  setDuration: (duration: number) => void
}

export const useDurationStore = create<DurationStore>((set) => ({
  duration: 0,
  setDuration: (duration) => set({ duration }),
}))

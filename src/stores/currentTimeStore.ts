import { create } from "zustand"

export interface CurrentTimeStore {
  currentTime: number
  setCurrentTime: (currentTime: number) => void
}

export const useCurrentTimeStore = create<CurrentTimeStore>((set) => ({
  currentTime: 0,
  setCurrentTime: (currentTime) => set({ currentTime }),
}))

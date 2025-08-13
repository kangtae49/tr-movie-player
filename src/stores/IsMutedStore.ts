import { create } from "zustand"

export interface IsMutedStore {
  isMuted: boolean
  setIsMuted: (isMuted: boolean) => void
}

export const useIsMutedStore = create<IsMutedStore>((set) => ({
  isMuted: false,
  setIsMuted: (isMuted) => set({ isMuted }),
}))

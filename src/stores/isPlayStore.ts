import { create } from "zustand"

export interface IsPlayStore {
  isPlay: boolean
  setIsPlay: (isPlay: boolean) => void
}

export const useIsPlayStore = create<IsPlayStore>((set) => ({
  isPlay: false,
  setIsPlay: (isPlay) => set({ isPlay }),
}))

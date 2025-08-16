import { create } from "zustand"

export interface IsRepeatOnceStore {
  isRepeatOnce: boolean
  setIsRepeatOnce: (isRepeatOnce: boolean) => void
}

export const useIsRepeatOnceStore = create<IsRepeatOnceStore>((set) => ({
  isRepeatOnce: false,
  setIsRepeatOnce: (isRepeatOnce) => set({ isRepeatOnce }),
}))

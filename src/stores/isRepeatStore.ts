import { create } from "zustand"

export interface IsRepeatStore {
  isRepeat: boolean
  setIsRepeat: (isRepeat: boolean) => void
}

export const useIsRepeatStore = create<IsRepeatStore>((set) => ({
  isRepeat: false,
  setIsRepeat: (isRepeat) => set({ isRepeat }),
}))

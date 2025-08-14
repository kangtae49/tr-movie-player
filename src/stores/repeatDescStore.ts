import { create } from "zustand"

export interface RepeatDescStore {
  repeatDesc: string
  setRepeatDesc: (repeatDesc: string) => void
}

export const useRepeatDescStore = create<RepeatDescStore>((set) => ({
  repeatDesc: '',
  setRepeatDesc: (repeatDesc) => set({ repeatDesc }),
}))

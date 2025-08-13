import { create } from "zustand"

export interface CheckedSubtitleStore {
  checkedSubtitle: boolean
  setCheckedSubtitle: (checkedSubtitle: boolean) => void
}

export const useCheckedSubtitleStore = create<CheckedSubtitleStore>((set) => ({
  checkedSubtitle: true,
  setCheckedSubtitle: (checkedSubtitle) => set({ checkedSubtitle }),
}))

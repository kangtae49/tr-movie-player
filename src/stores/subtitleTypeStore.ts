import { create } from "zustand"

export interface SubtitleTypeStore {
  subtitleType: string
  setSubtitleType: (subtitleType: string) => void
}

export const useSubtitleTypeStore = create<SubtitleTypeStore>((set) => ({
  subtitleType: "",
  setSubtitleType: (subtitleType) => set({ subtitleType }),
}))

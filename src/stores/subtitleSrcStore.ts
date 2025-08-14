import { create } from "zustand"

export interface SubtitleSrcStore {
  subtitleSrc: string | undefined
  setSubtitleSrc: (subtitleSrc: string | undefined) => void
}

export const useSubtitleSrcStore = create<SubtitleSrcStore>((set) => ({
  subtitleSrc: undefined,
  setSubtitleSrc: (subtitleSrc: string | undefined) => set({ subtitleSrc }),
}))

import { create } from "zustand"
import {Subtitle} from "@/bindings.ts";

export interface SubtitlesStore {
  subtitles: Subtitle []
  setSubtitles: (subtitles: Subtitle []) => void
}

export const useSubtitlesStore = create<SubtitlesStore>((set) => ({
  subtitles: [],
  setSubtitles: (subtitles: Subtitle []) => set({ subtitles }),
}))

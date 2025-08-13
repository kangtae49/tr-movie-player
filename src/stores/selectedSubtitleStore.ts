import { create } from "zustand"
import {Subtitle} from "@/bindings.ts";

export interface SelectedSubtitleStore {
  selectedSubtitle: Subtitle | undefined
  setSelectedSubtitle: (selectedSubtitle: Subtitle | undefined) => void
}

export const useSelectedSubtitleStore = create<SelectedSubtitleStore>((set) => ({
  selectedSubtitle: undefined,
  setSelectedSubtitle: (selectedSubtitle) => set({ selectedSubtitle }),
}))


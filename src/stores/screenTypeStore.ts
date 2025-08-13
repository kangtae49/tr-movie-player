import { create } from "zustand"


export type ScreenType = "cover" | "fill" | "contain"

export interface ScreenTypeStore {
  screenType: ScreenType
  setScreenType: (screenType: ScreenType) => void
}

export const useScreenTypeStore = create<ScreenTypeStore>((set) => ({
  screenType: "cover",
  setScreenType: (screenType) => set({ screenType }),
}))

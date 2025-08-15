import { create } from "zustand"


export type ScreenType = "cover" | "fill" | "contain" | "scale-down" | "none"

export interface ScreenTypeStore {
  screenType: ScreenType
  setScreenType: (screenType: ScreenType) => void
}

export const useScreenTypeStore = create<ScreenTypeStore>((set) => ({
  screenType: "contain",
  setScreenType: (screenType) => set({ screenType }),
}))

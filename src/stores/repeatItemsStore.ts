import { create } from "zustand"
import {RepeatItem} from "@/bindings.ts";

export interface RepeatItemsStore {
  repeatItems: RepeatItem []
  setRepeatItems: (repeatItems: RepeatItem []) => void
}

export const useRepeatItemsStore = create<RepeatItemsStore>((set) => ({
  repeatItems: [],
  setRepeatItems: (repeatItems) => set({ repeatItems }),
}))

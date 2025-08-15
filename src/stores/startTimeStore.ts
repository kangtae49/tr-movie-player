import { create } from "zustand"
import {round4} from "@/components/utils.ts";

export interface StartTimeStore {
  startTime: number
  setStartTime: (startTime: number) => void
}

export const useStartTimeStore = create<StartTimeStore>((set) => ({
  startTime: 0,
  setStartTime: (startTime) => set({ startTime: round4(startTime) }),
}))


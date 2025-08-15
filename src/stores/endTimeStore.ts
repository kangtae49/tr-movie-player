import { create } from "zustand"
import {round4} from "@/components/utils.ts";

export interface EndTimeStore {
  endTime: number
  setEndTime: (endTime: number) => void
}

export const useEndTimeStore = create<EndTimeStore>((set) => ({
  endTime: 0,
  setEndTime: (endTime) => set({ endTime: round4(endTime) }),
}))


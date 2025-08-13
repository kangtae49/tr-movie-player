import { create } from "zustand"
import {RepeatItem} from "@/bindings.ts";

export interface SelectedRepeatItemStore {
  selectedRepeatItem: RepeatItem | undefined
  setSelectedRepeatItem: (selectedRepeatItem: RepeatItem) => void
}

export const useSelectedRepeatItemStore = create<SelectedRepeatItemStore>((set) => ({
  selectedRepeatItem: undefined,
  setSelectedRepeatItem: (selectedRepeatItem) => set({ selectedRepeatItem }),
}))


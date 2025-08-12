import { create } from "zustand"
import {PlayItem} from "@/components/PlayListView.tsx";

export interface SelectedPlayItemStore {
  selectedPlayItem: PlayItem | undefined
  setSelectedPlayItem: (selectedPlayItem: PlayItem) => void
}

export const useSelectedPlayItemStore = create<SelectedPlayItemStore>((set) => ({
  selectedPlayItem: undefined,
  setSelectedPlayItem: (selectedPlayItem) => set({ selectedPlayItem }),
}))


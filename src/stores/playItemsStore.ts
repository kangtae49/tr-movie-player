import { create } from "zustand"
import {PlayItem} from "@/components/PlayListView.tsx";

export interface PlayItemsStore {
  playItems: PlayItem []
  setPlayItems: (playItems: PlayItem []) => void
}

export const usePlayItemsStore = create<PlayItemsStore>((set) => ({
  playItems: [],
  setPlayItems: (playItems) => set({ playItems }),
}))

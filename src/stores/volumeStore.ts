import { create } from "zustand"

export interface VolumeStore {
  volume: number
  setVolume: (volume: number) => void
}

export const useVolumeStore = create<VolumeStore>((set) => ({
  volume: 0.5,
  setVolume: (volume) => set({ volume }),
}))

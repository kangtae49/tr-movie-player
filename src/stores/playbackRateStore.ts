import { create } from "zustand"

export interface PlaybackRateStore {
  playbackRate: number
  setPlaybackRate: (playbackRate: number) => void
}

export const usePlaybackRateStore = create<PlaybackRateStore>((set) => ({
  playbackRate: 1,
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
}))

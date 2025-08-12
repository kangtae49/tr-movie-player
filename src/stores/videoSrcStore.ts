import { create } from "zustand"

export interface VideoSrcStore {
  videoSrc: string | undefined
  setVideoSrc: (videoSrc: string | undefined) => void
}

export const useVideoSrcStore = create<VideoSrcStore>((set) => ({
  videoSrc: undefined,
  setVideoSrc: (videoSrc: string | undefined) => set({ videoSrc }),
}))

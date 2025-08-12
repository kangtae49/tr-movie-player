import { create } from "zustand"
import {RefObject} from "react";

export interface VideoRefStore {
  videoRef: RefObject<HTMLVideoElement | null> | null
  setVideoRef: (videoRef: RefObject<HTMLVideoElement | null> | null) => void
}

export const useVideoRefStore = create<VideoRefStore>((set) => ({
  videoRef: null,
  setVideoRef: (videoRef) => set({ videoRef }),
}))

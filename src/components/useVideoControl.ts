import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useCallback} from "react";
import {useIsPlayStore} from "@/stores/isPlayStore.ts";
import {useIsMutedStore} from "@/stores/IsMutedStore.ts";
import {useVolumeStore} from "@/stores/volumeStore.ts";
import {useCurrentTimeStore} from "@/stores/currentTimeStore.ts";
import {usePlaybackRateStore} from "@/stores/playbackRateStore.ts";

interface UseVideoControls {
  togglePlay: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleFullScreen: () => Promise<void>;
  changeCurrentTime: (time: number) => void;
  changeVolume: (volume: number) => void;
  changePlaybackRate: (rate: number) => void;
}
function useVideoControl(): UseVideoControls {
  const videoRef = useVideoRefStore((state) => state.videoRef);
  const isPlay = useIsPlayStore((state) => state.isPlay);
  const setIsPlay = useIsPlayStore((state) => state.setIsPlay);
  const setIsMuted = useIsMutedStore((state) => state.setIsMuted);
  const setVolume = useVolumeStore((state) => state.setVolume);
  const setCurrentTime = useCurrentTimeStore((state) => state.setCurrentTime);
  const setPlaybackRate = usePlaybackRateStore((state) => state.setPlaybackRate);

  const togglePlay = useCallback( async () => {
    console.log('togglePlay', isPlay);
    console.log('togglePlay1', videoRef);
    if (!videoRef?.current) return;
    if (isPlay) {
      videoRef.current.pause();
      setIsPlay(false);
    } else {
      await videoRef.current.play();
      setIsPlay(true);
    }
  }, [isPlay, videoRef]);

  const toggleFullScreen = useCallback(async () => {
    if (document.fullscreenElement == null){
      await videoRef?.current?.requestFullscreen();
      console.log('isFullScreen', true, document.fullscreenElement);
    } else {
      await document.exitFullscreen();
      console.log('isFullScreen', false, document.fullscreenElement);
    }
  }, [videoRef]);

  const toggleMute = useCallback( async () => {
    if (!videoRef?.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [videoRef]);

  const changeCurrentTime = (time: number) => {
    if (!videoRef?.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeVolume = (volume: number) => {
    if (!videoRef?.current) return;
    videoRef.current.volume = volume;
    setVolume(volume);
  };

  const changePlaybackRate = (rate: number) => {
    if (!videoRef?.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);

  }

  return {
    togglePlay,
    toggleFullScreen,
    toggleMute,
    changeCurrentTime,
    changeVolume,
    changePlaybackRate
  }
}

export default useVideoControl;

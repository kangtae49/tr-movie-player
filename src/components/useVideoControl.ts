import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useCallback} from "react";
import {useIsPlayStore} from "@/stores/isPlayStore.ts";
import {useIsMutedStore} from "@/stores/isMutedStore.ts";
import {useVolumeStore} from "@/stores/volumeStore.ts";
import {useCurrentTimeStore} from "@/stores/currentTimeStore.ts";
import {usePlaybackRateStore} from "@/stores/playbackRateStore.ts";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";
import {useSelectedSubtitleStore} from "@/stores/selectedSubtitleStore.ts";
import {commands} from "@/bindings.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";
import {useSubtitlesStore} from "@/stores/subtitlesStore.ts";
import {useSubtitleTypeStore} from "@/stores/subtitleTypeStore.ts";
import {usePlayItemsStore} from "@/stores/playItemsStore.ts";
import {PlayItem} from "@/components/PlayListView.tsx";
import {useIsRepeatStore} from "@/stores/isRepeatStore.ts";
import {useStartTimeStore} from "@/stores/startTimeStore.ts";
import {useEndTimeStore} from "@/stores/endTimeStore.ts";

interface UseVideoControls {
  togglePlay: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleFullScreen: () => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  changePlayItem: () => Promise<void>;
  nextPlayItem: () => Promise<void>;
  prevPlayItem: () => Promise<void>;
  changeCurrentTime: (time: number) => void;
  changeVolume: (volume: number) => void;
  changePlaybackRate: (rate: number) => void;
  addPlayFiles: (files: string[]) => Promise<void>;

}
function useVideoControl(): UseVideoControls {
  const httpServer = useHttp();
  const videoRef = useVideoRefStore((state) => state.videoRef);
  const isPlay = useIsPlayStore((state) => state.isPlay);
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);
  const subtitleType = useSubtitleTypeStore((state) => state.subtitleType);
  const playItems = usePlayItemsStore((state) => state.playItems);

  const setIsPlay = useIsPlayStore((state) => state.setIsPlay);
  const setIsMuted = useIsMutedStore((state) => state.setIsMuted);
  const setVolume = useVolumeStore((state) => state.setVolume);
  const setCurrentTime = useCurrentTimeStore((state) => state.setCurrentTime);
  const setPlaybackRate = usePlaybackRateStore((state) => state.setPlaybackRate);
  const setSelectedSubtitle = useSelectedSubtitleStore((state) => state.setSelectedSubtitle);
  const setVideoSrc = useVideoSrcStore((state) => state.setVideoSrc);
  const setSubtitles = useSubtitlesStore((state) => state.setSubtitles);
  const setSelectedPlayItem = useSelectedPlayItemStore((state) => state.setSelectedPlayItem);
  const setPlayItems = usePlayItemsStore((state) => state.setPlayItems);
  const isRepeat = useIsRepeatStore((state) => state.isRepeat);
  const startTime = useStartTimeStore((state) => state.startTime);
  const setStartTime = useStartTimeStore((state) => state.setStartTime);
  const endTime = useEndTimeStore((state) => state.endTime);
  const setEndTime = useEndTimeStore((state) => state.setEndTime);


  const togglePlay = useCallback( async () => {
    console.log('togglePlay', isPlay);
    if (isPlay) {
      await pause();
    } else {
      await play();
    }
    setIsPlay(!isPlay);
  }, [isPlay]);

  const play = useCallback( async () => {
    console.log('play', isPlay);
    if (!videoRef?.current) return;
    await videoRef.current.play();
    setIsPlay(true);
  }, [videoRef]);

  const pause = useCallback( async () => {
    console.log('pause', isPlay);
    if (!videoRef?.current) return;
    videoRef.current.pause();
    setIsPlay(false);
  }, [videoRef]);

  const changePlayItem = useCallback( async () => {
    if (httpServer == undefined) return;
    if (selectedPlayItem == undefined) return;
    setSelectedSubtitle(undefined);

    await pause();
    console.log('selectedPlayItem:', selectedPlayItem);
    setVideoSrc(httpServer.getSrc(selectedPlayItem.path));
    commands.getSubtitleList(selectedPlayItem.path).then(res=>{
      if(res.status === 'ok') {
        const subtitles = res.data;
        setSubtitles(subtitles);
        if (subtitles.length > 0) {
          const [lang, ext] = subtitleType.split(".");
          const findSubtitle = subtitles.find((subtitle) => subtitle.ext == ext && subtitle.lang == lang);
          if(findSubtitle) {
            setSelectedSubtitle(findSubtitle);
          } else {
            setSelectedSubtitle(subtitles[0]);
          }
        }
      }
      play();
    })
  }, [httpServer, videoRef, selectedPlayItem]);

  const nextPlayItem = useCallback( async () => {
    if (playItems.length == 0) return;
    if (selectedPlayItem == undefined) return;
    const idx = playItems.findIndex((item) => item.id == selectedPlayItem.id);
    if (idx >= 0 && idx < playItems.length-1) {
      setSelectedPlayItem(playItems[idx+1])
    }
  }, [playItems, selectedPlayItem])

  const prevPlayItem = useCallback( async () => {
    if (playItems.length == 0) return;
    if (selectedPlayItem == undefined) return;
    const idx = playItems.findIndex((item) => item.id == selectedPlayItem.id);
    if (idx >= 1) {
      setSelectedPlayItem(playItems[idx-1])
    }
  }, [playItems, selectedPlayItem])


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

  const changeCurrentTime = useCallback((time: number) => {
    if (!videoRef?.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  }, [videoRef]);

  const changeVolume = useCallback((volume: number) => {
    if (!videoRef?.current) return;
    videoRef.current.volume = volume;
    setVolume(volume);
  }, [videoRef]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef?.current) return;
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
  }, [videoRef]);

  const addPlayFiles = useCallback(async (files: string []) => {
    const items = files
      .filter(path => path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mkv') || path.endsWith('.ogg'))
      .map((path: string) => {
        return {
          id: path,
          path: path,
        } as PlayItem;
      }) || [];
    const merged = [...playItems, ...items];
    const uniqueList = Array.from(
      new Map(merged.map(item => [item.path, item])).values()
    );
    setPlayItems(uniqueList);
    if (selectedPlayItem === undefined) {
      setSelectedPlayItem(uniqueList[0]);
    }

  }, [playItems]);



  return {
    togglePlay,
    toggleFullScreen,
    toggleMute,
    changeCurrentTime,
    changeVolume,
    changePlaybackRate,
    play,
    pause,
    changePlayItem,
    prevPlayItem,
    nextPlayItem,
    addPlayFiles,
  }
}

export default useVideoControl;

import React, {useCallback, useEffect, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faCirclePlay, faCirclePause, faMaximize, faVolumeMute, faVolumeHigh, faVolumeXmark} from '@fortawesome/free-solid-svg-icons'
import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";
import {useSubtitleSrcStore} from "@/stores/subtitleSrcStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useIsPlayStore} from "@/stores/isPlayStore.ts";

function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}


function MovieControlView() {
  const httpServer = useHttp();
  const videoRef = useVideoRefStore((state) => state.videoRef);
  const setVideoSrc = useVideoSrcStore((state) => state.setVideoSrc);
  const setSubtitleSrc = useSubtitleSrcStore((state) => state.setSubtitleSrc);
  // const isPlay = useIsPlayStore((state) => state.isPlay);
  // const setIsPlay = useIsPlayStore((state) => state.setIsPlay);
  const [isPlay, setIsPlay] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const clickFullScreen = async () => {
    if (document.fullscreenElement == null){
      await videoRef?.current?.requestFullscreen();
      console.log('isFullScreen', true, document.fullscreenElement);
    } else {
      await document.exitFullscreen();
      console.log('isFullScreen', false, document.fullscreenElement);
    }
  }

  const keyDownHandler = async (e: KeyboardEvent) => {
    if (e.key === " ") {

    } else if (e.key === "F11") {
      e.preventDefault();
      await clickFullScreen();
    }

  };



  const load = () => {
    if (httpServer === undefined) return;

    console.log('MoviePlayerView:', httpServer?.servInfo)
    const mp4 = 'C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4';
    const vtt = 'C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].ko.vtt';
    setVideoSrc(httpServer.getSrc(mp4));
    httpServer.getSrcBlobUrl(vtt).then(setSubtitleSrc);

  }
  const togglePlay = useCallback( async () => {
    if (httpServer === undefined) return;
    if (!videoRef?.current) return;
    if (isPlay) {
      videoRef.current.pause();
      setIsPlay(false);
    } else {
      await videoRef.current.play();
      setIsPlay(true);
    }
  }, [isPlay, videoRef, httpServer]);

  const toggleMuted = useCallback( async () => {
    if (httpServer === undefined) return;
    if (!videoRef?.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  }, [videoRef, httpServer])

  const onPlay = () => {
    setIsPlay(true);
  }
  const onPause = () => {
    setIsPlay(false);
  }

  const onRateChange = () => {
    if (!videoRef?.current) return;
    setPlaybackRate(videoRef.current.playbackRate)
  }

  const onloadedMetaData = () => {
    if (!videoRef?.current) return;
    setDuration(videoRef.current.duration);
  }
  const onTimeUpdate = () => {
    if (!videoRef?.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }

  const onVolumeChange = () => {
    if (!videoRef?.current) return;
    setVolume(videoRef.current.volume);
    setIsMuted(videoRef.current.muted);
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef?.current) return;
    const time = Number(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef?.current) return;
    const vol = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setVolume(vol);
  };

  useEffect(() => {
    if (!videoRef?.current) return;
    videoRef.current.volume = 0.5;

    videoRef.current.addEventListener("loadedmetadata", onloadedMetaData);
    videoRef.current.addEventListener("timeupdate", onTimeUpdate);
    videoRef.current.addEventListener("volumechange", onVolumeChange);
    videoRef.current.addEventListener("play", onPlay);
    videoRef.current.addEventListener("pause", onPause);
    videoRef.current.addEventListener("ratechange", onRateChange);

    window.addEventListener("keydown", keyDownHandler, { capture: true });
    return () => {
      videoRef?.current?.removeEventListener("loadedmetadata", onloadedMetaData);
      videoRef?.current?.removeEventListener("timeupdate", onTimeUpdate);
      videoRef.current?.removeEventListener("volumechange", onVolumeChange);
      videoRef.current?.removeEventListener("play", onPlay);
      videoRef.current?.removeEventListener("pause", onPause);
      videoRef.current?.removeEventListener("ratechange", onRateChange);
      window.removeEventListener("keydown", keyDownHandler, { capture: true });
    };
  }, [videoRef])



  return (
    <div className={`control-pane ${document.fullscreenElement == null ? null : 'fullscreen'}`} >
      <div onClick={() => load()}>load</div>
      <div>
        <Icon icon={isPlay ? faCirclePause : faCirclePlay} onClick={() => togglePlay()}/>
      </div>
      <div>
        <Icon icon={faMaximize} onClick={() => clickFullScreen()} />
      </div>
      <div>
        <Icon icon={isMuted ? faVolumeXmark : faVolumeHigh} onClick={() => toggleMuted()} />
      </div>
      <div>
        {formatSeconds(currentTime)} / {formatSeconds(duration)}
      </div>
      <div>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleTimeChange}
        />
      </div>
      <div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
      <div>
        {playbackRate}
      </div>
    </div>
  )

}

export default MovieControlView;

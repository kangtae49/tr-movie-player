import React, {useCallback, useEffect, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faCirclePlay, faCirclePause, faMaximize, faVolumeHigh, faVolumeXmark, faRepeat} from '@fortawesome/free-solid-svg-icons'
import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {SplitPane} from "@rexxars/react-split-pane";
import PlayListView from "@/components/PlayListView.tsx";
import RepeatListView from "@/components/RepeatListView.tsx";
import {useSubtitlesStore} from "@/stores/subtitlesStore.ts";
import {useSelectedSubtitleStore} from "@/stores/selectedSubtitleStore.ts";
import {useCheckedSubtitleStore} from "@/stores/checkedSubtitleStore.ts";
import {useIsPlayStore} from "@/stores/isPlayStore.ts";
import useVideoControl from "@/components/useVideoControl.ts";
import {useCurrentTimeStore} from "@/stores/currentTimeStore.ts";
import {useVolumeStore} from "@/stores/volumeStore.ts";
import {useIsMutedStore} from "@/stores/isMutedStore.ts";
import {useDurationStore} from "@/stores/durationStore.ts";
import {usePlaybackRateStore} from "@/stores/playbackRateStore.ts";
import {useSubtitleTypeStore} from "@/stores/subtitleTypeStore.ts";
import {ScreenType, useScreenTypeStore} from "@/stores/screenTypeStore.ts";
import {formatSeconds, round4} from "@/components/utils.ts";
import {useIsRepeatStore} from "@/stores/isRepeatStore.ts";
import {useStartTimeStore} from "@/stores/startTimeStore.ts";
import {useEndTimeStore} from "@/stores/endTimeStore.ts";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";

const getRepeatClassName = (isRepeat: boolean, startTime: number, endTime: number) => {
  if (isRepeat) {
    if (endTime - startTime >= 1) {
      return ""
    } else {
      return "inactive"
    }
  } else {
    return "off"
  }
}

function MovieControlView() {
  const videoRef = useVideoRefStore((state) => state.videoRef);
  const subtitles = useSubtitlesStore((state) => state.subtitles);
  const selectedSubtitle = useSelectedSubtitleStore((state) => state.selectedSubtitle);
  const setSelectedSubtitle = useSelectedSubtitleStore((state) => state.setSelectedSubtitle);
  const checkedSubtitle = useCheckedSubtitleStore((state) => state.checkedSubtitle);
  const setCheckedSubtitle = useCheckedSubtitleStore((state) => state.setCheckedSubtitle);
  const setSubtitleType = useSubtitleTypeStore((state) => state.setSubtitleType);
  const isPlay = useIsPlayStore((state) => state.isPlay);
  const setIsPlay = useIsPlayStore((state) => state.setIsPlay);
  const currentTime = useCurrentTimeStore((state) => state.currentTime);
  const setCurrentTime = useCurrentTimeStore((state) => state.setCurrentTime);
  const volume = useVolumeStore((state) => state.volume);
  const setVolume = useVolumeStore((state) => state.setVolume);
  const isMuted = useIsMutedStore((state) => state.isMuted);
  const setIsMuted = useIsMutedStore((state) => state.setIsMuted);
  const duration = useDurationStore((state) => state.duration);
  const setDuration = useDurationStore((state) => state.setDuration);
  const playbackRate = usePlaybackRateStore((state) => state.playbackRate);
  const setPlaybackRate = usePlaybackRateStore((state) => state.setPlaybackRate);
  const screenType = useScreenTypeStore((state) => state.screenType);
  const setScreenType = useScreenTypeStore((state) => state.setScreenType);
  const isRepeat = useIsRepeatStore((state) => state.isRepeat);
  const setIsRepeat = useIsRepeatStore((state) => state.setIsRepeat);
  const startTime = useStartTimeStore((state) => state.startTime);
  const setStartTime = useStartTimeStore((state) => state.setStartTime);
  const endTime = useEndTimeStore((state) => state.endTime);
  const setEndTime = useEndTimeStore((state) => state.setEndTime);
  const videoSrc = useVideoSrcStore((state) => state.videoSrc);
  const [isResizing, setIsResizing] = useState(false);

  const videoControl = useVideoControl();

  // const keyDownHandler = async (e: KeyboardEvent) => {
  //   if (e.key === " ") {
  //
  //   } else if (e.key === "F11") {
  //     e.preventDefault();
  //     await videoControl.toggleFullScreen();
  //   }
  // };

  const keyDownHandler = useCallback(async (e: KeyboardEvent) => {
    const delta = 0.2;
    if (e.key === "F11") {
      e.preventDefault();
      await videoControl.toggleFullScreen();
    } else if (e.key === " " || e.key === "Space") {
      console.log("Space");
      e.preventDefault();
      await videoControl.togglePlay();
    } else if (e.ctrlKey && e.key === "ArrowLeft") {
      console.log("Ctrl + ←");
      e.preventDefault();
      let tm = startTime - delta;
      console.log(startTime, tm);
      tm = Math.max(0, tm);
      // videoControl.changeCurrentTime(tm);
      setStartTime(tm);
    } else if (e.ctrlKey && e.key === "ArrowRight") {
      console.log("Ctrl + →");
      e.preventDefault();
      let tm = startTime + delta;
      console.log(startTime, tm);
      tm = Math.min(duration, tm);
      // videoControl.changeCurrentTime(tm);
      setStartTime(tm);
    } else if (e.altKey && e.key === "ArrowLeft") {
      console.log("Alt + ←");
      e.preventDefault();
      let tm = endTime - delta;
      console.log(endTime, tm);
      tm = Math.max(0, tm);
      setEndTime(tm);
    } else if (e.altKey && e.key === "ArrowRight") {
      console.log("Alt + →");
      e.preventDefault();
      let tm = endTime + delta;
      console.log(endTime, tm);
      tm = Math.min(duration, tm);
      setEndTime(tm);
    }
  }, [startTime, endTime, videoRef]);

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
  const onTimeSliderFocus = () => {
    setIsRepeat(false);
  }

  const onVolumeChange = () => {
    if (!videoRef?.current) return;
    setVolume(videoRef.current.volume);
    setIsMuted(videoRef.current.muted);
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    videoControl.changeCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    videoControl.changeVolume(vol);
  };

  const onChangeSubtitle = useCallback((path: string) => {
    const subtitle = subtitles.find((subtitle) => subtitle.path === path);
    setSelectedSubtitle(subtitle);
    setSubtitleType(`${subtitle?.lang || ""}.${subtitle?.ext || ""}`);
  }, [subtitles]);



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

  useEffect(() => {
    if (getRepeatClassName(isRepeat, startTime, endTime) !== "") return;
    if (currentTime >= endTime) {
      videoControl.changeCurrentTime(startTime);
    }
  }, [currentTime, startTime, endTime, isRepeat])

  // useEffect(() => {
  //   window.addEventListener("keydown", handleKeyDown, { capture: true });
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown, { capture: true });
  //   };
  // }, [currentTime, startTime, endTime, isPlay, isRepeat])

  return (
    <div className={`control-pane ${document.fullscreenElement == null ? '' : 'fullscreen'}`} >
      <div className="time-control">
        <input
          type="range"
          min={0}
          max={duration}
          step={0.1}
          value={currentTime}
          onChange={handleTimeChange}
          onFocus={onTimeSliderFocus}
        />
      </div>
      <div className="etc-control">
        <div className="left-control">
          <div className="current-time">
            <div>{formatSeconds(currentTime)} / {formatSeconds(duration)}</div>
            <div>{round4(currentTime)}</div>
          </div>
          <div className="checked-subtitle">
            <input type="checkbox"
                   checked={checkedSubtitle}
                   onChange={(e) => {setCheckedSubtitle(e.target.checked)}}
            />
          </div>
          <div className="select-subtitle">
            <select
              value={selectedSubtitle?.path || ""}
              onChange={(e) => {onChangeSubtitle(e.target.value)}}>
              {subtitles.map((subtitle) => (
                <option key={subtitle.path} value={subtitle.path}>{subtitle.lang || ""}.{subtitle.ext}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="center-control">
          <div className="repeat">
            <Icon icon={faRepeat} className={getRepeatClassName(isRepeat, startTime, endTime)} onClick={()=> setIsRepeat(!isRepeat)} />
          </div>
          <div>
            <Icon className="large" icon={isPlay ? faCirclePause : faCirclePlay} onClick={() => videoControl.togglePlay()}/>
          </div>
          {playbackRate != 1 && (
          <div>
            x{playbackRate}
          </div>
          )}
        </div>
        <div className="right-control">
          <div>
            <select value={playbackRate} onChange={(e)=>videoControl.changePlaybackRate(Number(e.target.value))}>
              <option value="0.25">x0.25</option>
              <option value="0.5">x0.5</option>
              <option value="0.75">x0.75</option>
              <option value="1">x1</option>
              <option value="1.25">x1.25</option>
              <option value="1.5">x1.5</option>
              <option value="1.75">x1.75</option>
              <option value="2">x2</option>
            </select>
          </div>
          <div>
            <select value={screenType} onChange={(e)=>setScreenType(e.target.value as ScreenType)}>
              <option value="contain">contain</option>
              <option value="fill">fill</option>
              <option value="cover">cover</option>
              <option value="scale-down">scale-down</option>
              <option value="none">none</option>
            </select>
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
            <Icon icon={isMuted ? faVolumeXmark : faVolumeHigh} onClick={() => videoControl.toggleMute()} />
          </div>
          <div>
            <Icon icon={faMaximize} onClick={() => videoControl.toggleFullScreen()} />
          </div>
        </div>
      </div>
      <div className="list-control">
        <SplitPane
          className="v-split-pane"
          split="vertical"
          primary="second"
          defaultSize={400}
          style={{
            height: 'calc(100% - 74px)',
          }}
          onDragStarted={() => setIsResizing(true)}
          onDragFinished={() => setIsResizing(false)}
        >
          <RepeatListView />
          <PlayListView />
          {(isResizing) && <div className="iframe-overlay2" />}
        </SplitPane>
      </div>
    </div>
  )

}

export default MovieControlView;

import React, {useCallback, useEffect, useRef} from "react";
import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";
import {useSubtitleSrcStore} from "@/stores/subtitleSrcStore.ts";
import {useSelectedSubtitleStore} from "@/stores/selectedSubtitleStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useCheckedSubtitleStore} from "@/stores/checkedSubtitleStore.ts";
import {useIsPlayStore} from "@/stores/isPlayStore.ts";
import {commands} from "@/bindings.ts";

/*
TODO:
play/pause
fullscreen
subtitle on/off select
time slider (total time/current time)
sound slider mute on/off
speed select
play list (drag and drop?)
srt->vtt convert
 */


function MoviePlayerView() {
  const httpServer = useHttp();
  const vRef = useRef<HTMLVideoElement>(null);  const videoRef = useVideoRefStore((state) => state.videoRef);
  const setVideoRef = useVideoRefStore((state) => state.setVideoRef);
  const videoSrc = useVideoSrcStore((state) => state.videoSrc);
  const subtitleSrc = useSubtitleSrcStore((state) => state.subtitleSrc);
  const selectedSubtitle = useSelectedSubtitleStore((state) => state.selectedSubtitle);
  const setSubtitleSrc = useSubtitleSrcStore((state) => state.setSubtitleSrc);
  const checkedSubtitle = useCheckedSubtitleStore((state) => state.checkedSubtitle);
  const isPlay = useIsPlayStore((state) => state.isPlay);
  const setIsPlay = useIsPlayStore((state) => state.setIsPlay);

  const screenTogglePlay = useCallback( async () => {
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

  useEffect(() => {
    console.log('videoRef:', videoRef);
    setVideoRef(vRef);
  }, [videoRef]);

  useEffect(() => {
    if (httpServer === undefined) return;
    if (selectedSubtitle === undefined) return;
    if (selectedSubtitle.ext == 'vtt') {
      httpServer.getSrcBlobUrl(selectedSubtitle.path).then(setSubtitleSrc);
    } else if (selectedSubtitle.ext == 'srt') {
      commands.convertSrtToVtt(selectedSubtitle.path).then(res => {
        if(res.status == 'ok') {
          const vtt = res.data;
          const blob = new Blob([vtt], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          setSubtitleSrc(url);
        }
      })
    }

  }, [selectedSubtitle, httpServer]);

  console.log('videoSrc:', videoSrc);
  return (
    <div className="movie-pane">
      <div className="video">
        <video
          ref={vRef}
          src={videoSrc}
          controls={false}
          autoPlay={false}
          onClick={()=> screenTogglePlay()}
          style={{
            // objectFit: 'fill',
            // objectFit: 'contain',
            objectFit: 'cover',
          }}
        >
          {/*{videoSrc && (<source src={videoSrc} type="video/mp4" />)}*/}
          <source src={videoSrc} />
          {(checkedSubtitle && subtitleSrc) && (
            <track src={subtitleSrc}
                   kind="subtitles"
                   srcLang="ko"
                   label="Korean"
                   default
            />
          )}
        </video>
      </div>
    </div>
  )
}

export default MoviePlayerView;
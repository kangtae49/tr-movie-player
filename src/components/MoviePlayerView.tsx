import React, {useEffect, useRef} from "react";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import useVideoControl from "@/components/useVideoControl.ts";
import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";
import {useSubtitleSrcStore} from "@/stores/subtitleSrcStore.ts";
import {useSelectedSubtitleStore} from "@/stores/selectedSubtitleStore.ts";
import {useCheckedSubtitleStore} from "@/stores/checkedSubtitleStore.ts";
import {commands} from "@/bindings.ts";
import {useScreenTypeStore} from "@/stores/screenTypeStore.ts";


function MoviePlayerView() {
  const httpServer = useHttp();
  const vRef = useRef<HTMLVideoElement>(null);
  const setVideoRef = useVideoRefStore((state) => state.setVideoRef);
  const videoRef = useVideoRefStore((state) => state.videoRef);
  const videoSrc = useVideoSrcStore((state) => state.videoSrc);
  const subtitleSrc = useSubtitleSrcStore((state) => state.subtitleSrc);
  const selectedSubtitle = useSelectedSubtitleStore((state) => state.selectedSubtitle);
  const setSubtitleSrc = useSubtitleSrcStore((state) => state.setSubtitleSrc);
  const checkedSubtitle = useCheckedSubtitleStore((state) => state.checkedSubtitle);
  const screenType = useScreenTypeStore((state) => state.screenType);
  const videoControl = useVideoControl();

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    await videoControl.togglePlay();
  }

  useEffect(() => {
    if (httpServer === undefined) return;
    if (selectedSubtitle === undefined) {
      setSubtitleSrc(undefined);
    } else if (selectedSubtitle.ext == 'vtt') {
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

  useEffect(() => {
    setVideoRef(vRef);
  }, [vRef]);

  return (
    <div className="movie-pane">
      {videoSrc === undefined && (
        <div className="no-video">
          <img src="/tr-movie-player.svg" alt="Open Video File" onClick={() => videoControl.openPlayDialog()}/>
        </div>
      )}
      {videoRef && <div className="video">
        <video
          ref={vRef}
          src={videoSrc}
          controls={false}
          autoPlay={false}
          onClick={togglePlay}
          style={{
            objectFit: screenType,
          }}
        >
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
      }
    </div>
  )
}

export default MoviePlayerView;
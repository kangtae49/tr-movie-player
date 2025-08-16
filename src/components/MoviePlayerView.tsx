import React, {useEffect, useRef, useState} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faArrowRightRotate} from '@fortawesome/free-solid-svg-icons'

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
  // const videoRef = useVideoRefStore((state) => state.videoRef);
  const videoSrc = useVideoSrcStore((state) => state.videoSrc);
  const subtitleSrc = useSubtitleSrcStore((state) => state.subtitleSrc);
  const selectedSubtitle = useSelectedSubtitleStore((state) => state.selectedSubtitle);
  const setSubtitleSrc = useSubtitleSrcStore((state) => state.setSubtitleSrc);
  const checkedSubtitle = useCheckedSubtitleStore((state) => state.checkedSubtitle);
  const screenType = useScreenTypeStore((state) => state.screenType);
  const videoControl = useVideoControl();

  const [isHealth, setIsHealth] = useState(false);

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    await videoControl.togglePlay();
  }

  const clickReload = () => {
    window.location.reload();
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
    if (vRef === null) return;
    setVideoRef(vRef);
  }, [videoSrc]);

  useEffect(() => {
    if (httpServer === undefined) return;
    if (isHealth) return;
    httpServer?.healthCheck()
      .then((res) => {
        console.log(res.status, httpServer.servInfo);
        if (res.status == 200) {
          setIsHealth(true);
        } else {
          setIsHealth(false);
        }
      })
      .catch((_e) => {
        setIsHealth(false);
      })
    ;
  }, [httpServer, isHealth]);

  if (httpServer === undefined) return null;
  if (!isHealth) return (
    <div className="reload" onClick={clickReload}><Icon icon={faArrowRightRotate}/></div>
  );

  return (
    <div className="movie-pane">
      {videoSrc === undefined && (
        <div className="no-video">
          <div className="logo">
            <img src="/tr-movie-player.svg" alt="Open Video File" onClick={() => videoControl.openPlayDialog()}/>
          </div>
          <div className="message">
            <div>
              <b>Keyboard Shortcuts</b>
            </div>
            <div className="row">
              <div className="label">Ctrl  + ← → </div><div>Add 0.2 seconds to `Start Time`</div>
            </div>
            <div className="row">
              <div className="label">Shift + ← → </div><div>Add 0.2 seconds to `End Time`</div>
            </div>
            <div className="row">
              <div className="label">Ctrl  + ↓   </div><div>Set `Start Time` to the current time. </div>
            </div>
            <div className="row">
              <div className="label">Shift + ↓   </div><div>Set `End Time` to the current time. </div>
            </div>
            <div className="row">
              <div className="label">Ctrl  + Space </div><div>Play the video from `Start Time`</div>
            </div>
            <div className="row">
              <div className="label">Shift + Space </div><div>Play the video from (`End Time` - 2s)</div>
            </div>
          </div>

        </div>
      )}
      {videoSrc && <div className="video">
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
import {useHttp} from "@/components/HttpServerProvider.tsx";
import React, {useEffect, useRef, useState} from "react";
import {getAllWindows} from "@tauri-apps/api/window";

/*
TODO:
play/pause
fullscreen
subtitle on/off select
time slider
sound slider mute on/off
speed select
play list (drag and drop?)
 */


function MoviePlayerView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | undefined>(undefined);
  const [mp4, setMp4] = useState<string | undefined>(undefined);
  const httpServer = useHttp();


  const play = () => {
    console.log('MoviePlayerView:', httpServer?.servInfo)
    const mp4 = 'C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4';
    const vtt = 'C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].ko.vtt';
    // const vttString = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nSeverus Snape and the Marauders';

    setMp4(mp4);
    fetch(`http://localhost:${httpServer?.servInfo.port}/get_file?path=${vtt}`).then(res => {
      return res.text()
    }).then(text => {
      const blob = new Blob([text], {type: 'text/vtt'});
      const blobUrl = URL.createObjectURL(blob);
      setBlobUrl(blobUrl);
    });
  }



  useEffect(() => {
    const handleKeydown = async (e: KeyboardEvent) => {

      if (e.key === "F11") {
        e.preventDefault();
        const windows = await getAllWindows();
        const mainWindow = windows[0];
        if (!document.fullscreenElement){
          await videoRef.current?.requestFullscreen();
          await mainWindow.setFullscreen(true);
          setIsFullscreen(true);
        } else {
          await document.exitFullscreen();
          await mainWindow.setFullscreen(false);
          setIsFullscreen(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeydown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeydown, { capture: true });
    };
  }, [])

  return (
    <div className="movie-pane">
      {mp4 && (
        <div className="video">
          <video
            ref={videoRef}
            controls={true}
            style={{
              // objectFit: 'fill',
              // objectFit: 'contain',
              objectFit: 'cover',
            }}
          >
            <source src={`http://localhost:${httpServer?.servInfo.port}/get_file?path=${mp4}`} type="video/mp4" />
            {blobUrl && (
              <track src={blobUrl}
                     kind="subtitles"
                     srcLang="ko"
                     label="Korean"
                     default
              />
            )}
          </video>
        </div>
      )}
      {!isFullscreen && (
        <div className="control-pane">
          isFullscreen: {isFullscreen}
          <div onClick={() => play()}>play</div>
        </div>
      )}
    </div>
  )
}

export default MoviePlayerView;
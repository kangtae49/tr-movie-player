import React, {useEffect, useRef} from "react";
import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";
import {useSubtitleSrcStore} from "@/stores/subtitleSrcStore.ts";

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
  const vRef = useRef<HTMLVideoElement>(null);  const videoRef = useVideoRefStore((state) => state.videoRef);
  const setVideoRef = useVideoRefStore((state) => state.setVideoRef);
  const videoSrc = useVideoSrcStore((state) => state.videoSrc);
  const subtitleSrc = useSubtitleSrcStore((state) => state.subtitleSrc);

  useEffect(() => {
    console.log('videoRef:', videoRef);
    setVideoRef(vRef);
  }, [videoRef]);
  console.log('videoSrc:', videoSrc);
  return (
    <div className="movie-pane">
      <div className="video">
        <video
          ref={vRef}
          src={videoSrc}
          controls={false}
          autoPlay={false}
          style={{
            // objectFit: 'fill',
            // objectFit: 'contain',
            objectFit: 'cover',
          }}
        >
          {/*{videoSrc && (<source src={videoSrc} type="video/mp4" />)}*/}
          <source src={videoSrc} />
          {subtitleSrc && (
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
import {useHttp} from "@/components/HttpServerProvider.tsx";
import TestView from "@/components/TestView.tsx";
import {useState} from "react";

function MoviePlayerView() {
  const [vttString, setVttString] = useState('');
  const httpServer = useHttp();
  console.log('MoviePlayerView:', httpServer?.servInfo)
  const mp4 = 'C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].mp4';
  const vtt = 'C:/Users/kkt/Downloads/Severus Snape and the Marauders ｜ Harry Potter Prequel [EmsntGGjxiw].ko.vtt';
  // const vttString = 'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nSeverus Snape and the Marauders';
  const blob = new Blob([vttString], {type: 'text/vtt'});
  const blobUrl = URL.createObjectURL(blob);

  fetch(`http://localhost:${httpServer?.servInfo.port}/get_file?path=${vtt}`).then(res => {
    return res.text()
  }).then(text => {
    setVttString(text);
  });

  return (
    <div className="movie-pane">
      <div>{httpServer?.servInfo.port}</div>
      <div className="video">
        <video controls>
          <source src={`http://localhost:${httpServer?.servInfo.port}/get_file?path=${mp4}`} type="video/mp4" />
          {/*<track src={`http://localhost:${httpServer?.servInfo.port}/get_file?path=${vtt}`}*/}
          <track src={blobUrl}
                 kind="subtitles"
                 srcLang="ko"
                 label="Korean"
                 default
          />
        </video>
      </div>
    </div>
  )
}

export default MoviePlayerView;
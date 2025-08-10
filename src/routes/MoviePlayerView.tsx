import {commands} from "@/bindings.ts";
import {useState} from "react";

function MoviePlayerView() {
  const [port, setPort] = useState<string>("0");
  const clickStart = async () => {
    commands.runHttpServer({
      id: port,
      ip: '0.0.0.0',
      port: 0,
      path: '',
    }).then(console.log)
      .catch(console.error);
  }

  const clickShutdown = async () => {
    console.log('shutdown');
    commands.shutdownHttpServer(port).then(console.log)
      .catch(console.error);
  }
  return (
    <div>
      <div><input type="text" value={port} onChange={(e) => setPort(e.target.value)} /> </div>
      <div onClick={() => clickStart()}>start</div>
      <div onClick={() => clickShutdown()}>shutdown</div>
    </div>
  )
}

export default MoviePlayerView;
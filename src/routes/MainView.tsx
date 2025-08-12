import MoviePlayerView from "@/components/MoviePlayerView.tsx";
import {SplitPane} from "@rexxars/react-split-pane";
import {useState} from "react";
import MovieControlView from "@/components/MovieControlView.tsx";

function MainView() {
  const [isResizing, setIsResizing] = useState(false);
  return (
    <div className="main-pane">
      <SplitPane
        className="split-pane"
        split="horizontal"
        primary="first"
        defaultSize={200}
        onDragStarted={() => setIsResizing(true)}
        onDragFinished={() => setIsResizing(false)}
      >
        <MoviePlayerView />
        <MovieControlView />
        {(isResizing) && <div className="iframe-overlay" />}
      </SplitPane>
    </div>
  )
}

export default MainView;

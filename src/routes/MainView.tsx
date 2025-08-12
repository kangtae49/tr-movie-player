import MoviePlayerView from "@/routes/MoviePlayerView.tsx";
import {SplitPane} from "@rexxars/react-split-pane";
import {useState} from "react";
import MovieControlView from "@/routes/MovieControlView.tsx";

function MainView() {
  const [isResizing, setIsResizing] = useState(false);
  return (
    <div className="main-pane">
      <SplitPane
        className="split-pane"
        split="horizontal"
        primary="second"
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

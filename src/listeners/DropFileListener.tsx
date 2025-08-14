import {useEffect} from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import {usePlayItemsStore} from "@/stores/playItemsStore.ts";
import useVideoControl from "@/components/useVideoControl.ts";

function DropFileListener() {
  const videoControl = useVideoControl();
  const playItems = usePlayItemsStore((state) => state.playItems);

  useEffect(() => {
    let unlistenPromise: Promise<() => void> | null = null;

    const init = async () => {
      const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        if (event.payload.type === 'over') {
          console.log('User hovering', event.payload.position);
        } else if (event.payload.type === 'drop') {
          // console.log('User dropped', event.payload.paths);
          const paths = event.payload.paths;
          videoControl.addPlayFiles(paths);

        } else {
          console.log('File drop cancelled');
        }
      });
      unlistenPromise = Promise.resolve(unlisten);
    };

    init().then(() => {});

    // cleanup
    return () => {
      if (unlistenPromise) {
        unlistenPromise.then((unlisten) => unlisten());
      }
    };
  }, [playItems]);

  return null;
}

export default DropFileListener;
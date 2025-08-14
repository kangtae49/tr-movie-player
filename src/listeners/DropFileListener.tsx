import {useEffect} from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import {PlayItem} from "@/components/PlayListView.tsx";
import {usePlayItemsStore} from "@/stores/playItemsStore.ts";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";
// import {commands} from "@/bindings";

function DropFileListener() {
  const playItems = usePlayItemsStore((state) => state.playItems);
  const setPlayItems = usePlayItemsStore((state) => state.setPlayItems);
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);
  const setSelectedPlayItem = useSelectedPlayItemStore((state) => state.setSelectedPlayItem);

  useEffect(() => {
    let unlistenPromise: Promise<() => void> | null = null;

    const init = async () => {
      const unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        if (event.payload.type === 'over') {
          console.log('User hovering', event.payload.position);
        } else if (event.payload.type === 'drop') {
          // console.log('User dropped', event.payload.paths);
          const paths = event.payload.paths;

          const items = paths
            .filter(path => path.endsWith('.mp4') || path.endsWith('.webm') || path.endsWith('.mkv') || path.endsWith('.ogg'))
            .map((path: string) => {
              return {
                id: path,
                path: path,
              } as PlayItem;
            }) || [];
            const merged = [...playItems, ...items];
            const uniqueList = Array.from(
              new Map(merged.map(item => [item.path, item])).values()
            );
            setPlayItems(uniqueList);
            if (selectedPlayItem === undefined) {
              setSelectedPlayItem(uniqueList[0]);
            }
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
import {useEffect} from "react";
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faForwardStep, faBackwardStep, faCircleMinus, faFolder} from '@fortawesome/free-solid-svg-icons'
import {DndContext, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";

import {useHttp} from "@/components/HttpServerProvider.tsx";
import useVideoControl from "@/components/useVideoControl.ts";

import SortableContainer from "@/components/SortableContainer.tsx";
import PlayItemView from "@/components/PlayItemView.tsx";
import {usePlayItemsStore} from "@/stores/playItemsStore.ts";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";
import {useIsRepeatStore} from "@/stores/isRepeatStore.ts";

export type PlayItem = {
  id: string,
  path: string,
}
function PlayListView() {
  const httpServer = useHttp();
  const videoControl = useVideoControl();
  const playItems = usePlayItemsStore((state) => state.playItems);
  const setPlayItems = usePlayItemsStore((state) => state.setPlayItems);
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);
  const setSelectedPlayItem = useSelectedPlayItemStore((state) => state.setSelectedPlayItem);
  const setIsRepeat = useIsRepeatStore((state) => state.setIsRepeat);

  const clickPlayItem = (playItem: PlayItem) => {
    setSelectedPlayItem(playItem);
    setIsRepeat(false);
  }

  const removePlayItem = (playItem: PlayItem) => {
    if (playItems === undefined) return;
    setPlayItems(playItems.filter((item: PlayItem) => item.id !== playItem.id));
  }

  function getPlayItemId (playItem: PlayItem) {
    return playItem.id;
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.id === "source") {
      return;
    }

    const findItem = playItems?.find((c) => c.id == event.active.id);
    if (findItem) {
      console.log('findItem:', findItem);
    }

  }

  function handleDragEnd(event: DragEndEvent) {
    if (playItems === undefined) return;
    const { active, over } = event;

    if (!over) {
      return;
    }

    let activeId = active.id.toString();
    let overId = over.id.toString();

    if (activeId == "source" && selectedPlayItem !== undefined) {
      if (!playItems.find((c) => c.id == getPlayItemId(selectedPlayItem))) {
        playItems.push(selectedPlayItem);
        activeId = getPlayItemId(selectedPlayItem);
      }
    }
    if (overId == 'target-play') {
      const last = playItems.slice(-1);
      if (last.length > 0) {
        overId = last[0].id;
      }
    }
    const activeIndex = playItems.findIndex((item) => item.id === activeId);
    const overIndex = playItems.findIndex((item) => item.id === overId);
    if (activeIndex !== -1 && overIndex !== -1) {
      const sortedItem = arrayMove<PlayItem>(playItems || [], activeIndex, overIndex);
      setPlayItems(sortedItem);
    }

  }

  useEffect(() => {
    videoControl.changePlayItem().then();
  }, [selectedPlayItem, httpServer])

  return (
    <div className="play-list">
      <div className="list-header">
        <Icon icon={faFolder} className="middle" onClick={() => videoControl.openPlayDialog()} />
        <Icon icon={faCircleMinus} onClick={()=>setPlayItems([])} />
        <Icon icon={faBackwardStep} onClick={() => videoControl.prevPlayItem()} />
        <Icon icon={faForwardStep} onClick={() => videoControl.nextPlayItem()} />
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContainer id="target-play">
        {(playItems != undefined) && (
        <SortableContext items={playItems} strategy={horizontalListSortingStrategy}>
          {(playItems).map((playItem, _index: number) => {
            return (
              <PlayItemView key={playItem.id} playItem={playItem} removePlayItem={removePlayItem} clickPlayItem={clickPlayItem} />
            )
          })}
        </SortableContext>
        )}
        </SortableContainer>
      </DndContext>
    </div>
  )
}

export default PlayListView;

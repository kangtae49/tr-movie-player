import {open} from "@tauri-apps/plugin-dialog"
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faForwardStep, faBackwardStep, faCirclePlus, faCircleMinus} from '@fortawesome/free-solid-svg-icons'
import {useEffect} from "react";
import {DndContext, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import SortableContainer from "@/components/SortableContainer.tsx";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import PlayItemView from "@/components/PlayItemView.tsx";
import {usePlayItemsStore} from "@/stores/playItemsStore.ts";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";
import {useHttp} from "@/components/HttpServerProvider.tsx";
import {useVideoSrcStore} from "@/stores/videoSrcStore.ts";
import {commands} from "@/bindings.ts";
import {useSubtitlesStore} from "@/stores/subtitlesStore.ts";
import {useSelectedSubtitleStore} from "@/stores/selectedSubtitleStore.ts";
import {useSubtitleTypeStore} from "@/stores/subtitleTypeStore.ts";

export type PlayItem = {
  id: string,
  path: string,
}
function PlayListView() {
  const httpServer = useHttp();
  const playItems = usePlayItemsStore((state) => state.playItems);
  const setPlayItems = usePlayItemsStore((state) => state.setPlayItems);
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);
  const setSelectedPlayItem = useSelectedPlayItemStore((state) => state.setSelectedPlayItem);
  const setVideoSrc = useVideoSrcStore((state) => state.setVideoSrc);
  const setSubtitles = useSubtitlesStore((state) => state.setSubtitles);
  const setSelectedSubtitle = useSelectedSubtitleStore((state) => state.setSelectedSubtitle);
  const subtitleType = useSubtitleTypeStore((state) => state.subtitleType);

  const openPlayList = () => {
    open({
      directory: false,
      multiple: true,
      filters: [
        { name: 'Video', extensions: ['mp4', 'webm', 'mkv', 'ogg'] },
        { name: 'All Files', extensions: ['*'] },
      ]
    }).then(res => {
      if (res == null) {
        return;
      }
      console.log('hi');
      const items = res.map((path: string) => {
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
    })
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
    if (selectedPlayItem === undefined) return;
    console.log('selectedPlayItem:1 ', selectedPlayItem);
    // get movie file
    // get subtitles file
    // load movie
    if (httpServer === undefined) return;
    // if (!videoRef?.current) return;
    console.log('selectedPlayItem:', selectedPlayItem);

    console.log('MoviePlayerView:', httpServer?.servInfo)
    setVideoSrc(httpServer.getSrc(selectedPlayItem.path));
    commands.getSubtitleList(selectedPlayItem.path).then(res=>{
      if(res.status === 'ok') {
        const subtitles = res.data;
        setSubtitles(subtitles);
        if (subtitles.length > 0) {
          const [lang, ext] = subtitleType.split(".");
          const findSubtitle = subtitles.find((subtitle) => subtitle.ext == ext && subtitle.lang == lang);
          if(findSubtitle) {
            setSelectedSubtitle(findSubtitle);
          } else {
            setSelectedSubtitle(subtitles[0]);
          }

        }
      }
    })

    // httpServer.getSrcBlobUrl(vtt).then(setSubtitleSrc);

    // videoRef.current.src = selectedPlayItem.path;
  }, [selectedPlayItem, httpServer])

  return (
    <div className="play-list">
      <div className="list-header">
        <Icon icon={faCirclePlus} onClick={openPlayList} />
        <Icon icon={faCircleMinus} onClick={()=>setPlayItems([])} />
        <Icon icon={faBackwardStep} />
        <Icon icon={faForwardStep} />
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContainer id="target-play">
        {(playItems != undefined) && (
        <SortableContext items={playItems} strategy={horizontalListSortingStrategy}>
          {(playItems).map((playItem, _index: number) => {
            return (
              <PlayItemView key={playItem.id} playItem={playItem} removePlayItem={removePlayItem} />
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

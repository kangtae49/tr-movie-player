import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faCirclePlus, faLandMineOn, faRepeat} from "@fortawesome/free-solid-svg-icons";
import {useRepeatItemsStore} from "@/stores/repeatItemsStore.ts";
import {useSelectedRepeatItemStore} from "@/stores/selectedRepeatItemStore.ts";
import {DndContext, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {commands, RepeatItem, RepeatJson} from "@/bindings.ts";
import SortableContainer from "@/components/SortableContainer.tsx";
import RepeatItemView from "@/components/RepeatItemView.tsx";
import {useCallback, useEffect} from "react";
import {useCurrentTimeStore} from "@/stores/currentTimeStore.ts";
import useVideoControl from "@/components/useVideoControl.ts";
import {useVideoRefStore} from "@/stores/videoRefStore.ts";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";
import {changeExtension} from "@/components/utils.ts";
import {useStartTimeStore} from "@/stores/startTimeStore.ts";
import {useEndTimeStore} from "@/stores/endTimeStore.ts";
import {useIsRepeatStore} from "@/stores/isRepeatStore.ts";
import {useRepeatDescStore} from "@/stores/repeatDescStore.ts";
import {useDurationStore} from "@/stores/durationStore.ts";


const getRepeatClassName = (startTime: number, endTime: number) => {
  if (endTime - startTime >= 1) {
    return ""
  } else {
    return "inactive"
  }
}

function RepeatListView() {
  const repeatItems = useRepeatItemsStore((state) => state.repeatItems);
  const setRepeatItems = useRepeatItemsStore((state) => state.setRepeatItems);
  const selectedRepeatItem = useSelectedRepeatItemStore((state) => state.selectedRepeatItem);
  const setSelectedRepeatItem = useSelectedRepeatItemStore((state) => state.setSelectedRepeatItem);
  const currentTime = useCurrentTimeStore((state) => state.currentTime);
  const videoRef = useVideoRefStore((state) => state.videoRef);
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);
  const startTime = useStartTimeStore((state) => state.startTime);
  const setStartTime = useStartTimeStore((state) => state.setStartTime);
  const endTime = useEndTimeStore((state) => state.endTime);
  const setEndTime = useEndTimeStore((state) => state.setEndTime);
  const setIsRepeat = useIsRepeatStore((state) => state.setIsRepeat);
  const repeatDesc = useRepeatDescStore((state) => state.repeatDesc);
  const setRepeatDesc = useRepeatDescStore((state) => state.setRepeatDesc);
  const duration = useDurationStore((state) => state.duration);

  const videoControl = useVideoControl();

  const clickStartGetCurrentTime = () => {
    setStartTime(currentTime);
  }

  const clickEndGetCurrentTime = () => {
    setEndTime(currentTime);
  }

  const clickGetCurrentSubtitle = () => {
    if (!videoRef?.current) {
      return;
    }
    const tracks = videoRef.current.textTracks;
    if (tracks?.length > 0) {
      const activeCues = tracks[0].activeCues;
      if (activeCues != null && activeCues.length > 0) {
        const cue = activeCues[0] as VTTCue;
        setRepeatDesc(cue.text);
      }
    }
  }

  const clickRepeatItem = (repeatItem: RepeatItem) => {
    if (repeatItems === undefined) return;
    if (selectedPlayItem == undefined) return;
    setSelectedRepeatItem(repeatItem);
    setStartTime(repeatItem.start);
    setEndTime(repeatItem.end);
    setRepeatDesc(repeatItem.desc || '');
  }

  const clickCurRepeatItem = () => {
    const repeatItem: RepeatItem = {
      id: `${startTime}-${endTime}`,
      start: startTime,
      end: endTime,
      desc: repeatDesc
    };
    setSelectedRepeatItem(repeatItem);
    setStartTime(repeatItem.start);
    setEndTime(repeatItem.end);
    setRepeatDesc(repeatItem.desc || '');
  }

  const clickAddRepeatItem = () => {
    if (repeatItems === undefined) return;
    if (selectedPlayItem == undefined) return;
    if (getRepeatClassName(startTime, endTime) == "inactive") {
      return;
    }
    const id = `${startTime}-${endTime}`;
    const start = startTime;
    const end = endTime;
    const desc = repeatDesc;
    const items = [...repeatItems, {id, start, end, desc}];
    const uniqueList = Array.from(
      new Map(items.map(item => [item.id, item])).values()
    );
    setRepeatItems(uniqueList);
    saveRepeatJson(uniqueList);
  }

  const onFocusStartTime = useCallback(async () => {
    console.log('onFocusStartTime:', startTime);
    const v = startTime;
    if (!isNaN(v)) {
      setIsRepeat(false);
      videoControl.changeCurrentTime(v);
      await videoControl.pause();
    }
  }, [startTime]);

  const onFocusEndTime = useCallback(async () => {
    console.log('onFocusEndTime:', endTime);
    let v = endTime;
    if (!isNaN(v)) {
      setIsRepeat(false);
      videoControl.changeCurrentTime(v);
      await videoControl.pause();
    }
  }, [endTime]);


  const onChangeStartTime = useCallback((value: string) => {
    const v = Number(value);
    if (!isNaN(v)) {
      videoControl.changeCurrentTime(v);
      setStartTime(v);
    }
  }, []);

  const onChangeEndTime = useCallback((value: string) => {
    const v = Number(value);
    if (!isNaN(v)) {
      videoControl.changeCurrentTime(v);
      setEndTime(v);
    }
  }, []);


  const removeRepeatItem = (repeatItem: RepeatItem) => {
    if (repeatItems === undefined) return;
    if (selectedPlayItem == undefined) return;
    const new_items = repeatItems.filter((item: RepeatItem) => item.id !== repeatItem.id);
    setRepeatItems(new_items);
    saveRepeatJson(new_items);
  }

  const saveRepeatJson = (items: RepeatItem[]) => {
    if (repeatItems === undefined) return;
    if (selectedPlayItem == undefined) return;
    const jsonPath = changeExtension(selectedPlayItem.path, "json");
    const json = {
      items
    } as RepeatJson;

    commands.writeRepeatJson(
      jsonPath,
      json
    ).then(res => {
      if (res.status === 'ok') {
        console.log('writeRepeatJson success');
      } else {
        console.log('writeRepeatJson fail');
      }
    })
  }

  function getRepeatItemId (repeatItem: RepeatItem) {
    return repeatItem.id;
  }

  function handleDragStart(event: DragStartEvent) {
    if (event.active.id === "source") {
      return;
    }

    const findItem = repeatItems?.find((c) => c.id == event.active.id);
    if (findItem) {
      console.log('findItem:', findItem);
    }

  }

  function handleDragEnd(event: DragEndEvent) {
    if (repeatItems === undefined) return;
    const { active, over } = event;

    if (!over) {
      return;
    }

    let activeId = active.id.toString();
    let overId = over.id.toString();

    if (activeId == "source" && selectedRepeatItem !== undefined) {
      if (!repeatItems.find((c) => c.id == getRepeatItemId(selectedRepeatItem))) {
        repeatItems.push(selectedRepeatItem);
        activeId = getRepeatItemId(selectedRepeatItem);
      }
    }
    if (overId == 'target') {
      const last = repeatItems.slice(-1);
      if (last.length > 0) {
        overId = last[0].id;
      }
    }
    const activeIndex = repeatItems.findIndex((item) => item.id === activeId);
    const overIndex = repeatItems.findIndex((item) => item.id === overId);
    if (activeIndex !== -1 && overIndex !== -1) {
      const sortedItem = arrayMove<RepeatItem>(repeatItems || [], activeIndex, overIndex);
      setRepeatItems(sortedItem);
    }
  }

  useEffect(() => {
    if (selectedPlayItem === undefined) return;

    const jsonPath = changeExtension(selectedPlayItem.path, "json");
    commands.readRepeatJson(jsonPath).then(res => {
      if (res.status === 'ok') {
        const items = res.data.items;
        setRepeatItems(items);
      } else {
        setRepeatItems([]);
      }
    })

  }, [selectedPlayItem]);

  useEffect(() => {
    if (selectedPlayItem === undefined) return;
    videoControl.changeCurrentTime(startTime);
    if (getRepeatClassName(startTime, endTime) !== "inactive") {
      setIsRepeat(true);
      videoControl.play().then();
    }
  }, [selectedRepeatItem, startTime]);

  return (
    <div className="repeat-list">
      <div className="list-header">
        <Icon icon={faLandMineOn} onClick={()=>clickStartGetCurrentTime()} />
        <div className="sec" title="Ctrl + ← →">
          <input type="number" value={startTime} step="any"
                 onFocus={(_e) => onFocusStartTime()}
                 onChange={(e)=> onChangeStartTime(e.target.value)}/>
        </div>
        <Icon icon={faLandMineOn} onClick={()=>clickEndGetCurrentTime()} />
        <div className="sec" title="Alt + ← →">
          <input type="number" value={endTime} step="any"
                 onFocus={(_e)=> onFocusEndTime()}
                 onChange={(e)=> onChangeEndTime(e.target.value)}/>
        </div>
        <Icon icon={faLandMineOn} onClick={()=>clickGetCurrentSubtitle()} />
        <div className="desc">
          <input type="text" value={repeatDesc} onChange={(e) => setRepeatDesc(e.target.value)}/>
        </div>
        <Icon icon={faRepeat} className={`${getRepeatClassName(startTime, endTime)}`} onClick={() => clickCurRepeatItem()} />
        <Icon icon={faCirclePlus} className={`middle ${getRepeatClassName(startTime, endTime)}`} onClick={()=> clickAddRepeatItem()}/>
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContainer id="target-repeat">
          {(repeatItems != undefined) && (
            <SortableContext items={repeatItems} strategy={horizontalListSortingStrategy}>
              {(repeatItems).map((repeatItem, _index: number) => {
                return (
                  <RepeatItemView key={repeatItem.id} repeatItem={repeatItem} clickRepeatItem={clickRepeatItem} removeRepeatItem={removeRepeatItem} />
                )
              })}
            </SortableContext>
          )}
        </SortableContainer>
      </DndContext>

    </div>
  )
}

export default RepeatListView;

import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome'
import {faCirclePlus} from "@fortawesome/free-solid-svg-icons";
import {useRepeatItemsStore} from "@/stores/repeatItemsStore.ts";
import {useSelectedRepeatItemStore} from "@/stores/selectedRepeatItemStore.ts";
import {DndContext, DragEndEvent, DragStartEvent} from "@dnd-kit/core";
import {arrayMove, horizontalListSortingStrategy, SortableContext} from "@dnd-kit/sortable";
import {RepeatItem} from "@/bindings.ts";
import SortableContainer from "@/components/SortableContainer.tsx";
import PlayItemView from "@/components/PlayItemView.tsx";
import RepeatItemView from "@/components/RepeatItemView.tsx";
import {PlayItem} from "@/components/PlayListView.tsx";

function RepeatListView() {
  const repeatItems = useRepeatItemsStore((state) => state.repeatItems);
  const setRepeatItems = useRepeatItemsStore((state) => state.setRepeatItems);
  const selectedRepeatItem = useSelectedRepeatItemStore((state) => state.selectedRepeatItem);
  const setSelectedRepeatItem = useSelectedRepeatItemStore((state) => state.setSelectedRepeatItem);

  const removeRepeatItem = (repeatItem: RepeatItem) => {
    if (repeatItems === undefined) return;
    setRepeatItems(repeatItems.filter((item: RepeatItem) => item.id !== repeatItem.id));
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

  return (
    <div className="repeat-list">
      <div className="list-header">
        <Icon icon={faCirclePlus} />
      </div>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContainer id="target-repeat">
          {(repeatItems != undefined) && (
            <SortableContext items={repeatItems} strategy={horizontalListSortingStrategy}>
              {(repeatItems).map((repeatItem, _index: number) => {
                return (
                  <RepeatItemView key={repeatItem.id} repeatItem={repeatItem} removeRepeatItem={removeRepeatItem} />
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

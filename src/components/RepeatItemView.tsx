import {RepeatItem} from "@/bindings.ts";
import {useSelectedRepeatItemStore} from "@/stores/selectedRepeatItemStore.ts";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faCircleXmark, faRepeat} from "@fortawesome/free-solid-svg-icons";
import {useStartTimeStore} from "@/stores/startTimeStore.ts";
import {useEndTimeStore} from "@/stores/endTimeStore.ts";

type Props = {
  repeatItem: RepeatItem
  clickRepeatItem: (repeatItem: RepeatItem) => void
  removeRepeatItem: (repeatItem: RepeatItem) => void
}

const getRepeatClassName = (startTime: number, endTime: number) => {
  if (endTime - startTime >= 1.0) {
    return ""
  } else {
    return "inactive"
  }
}

function RepeatItemView({repeatItem, clickRepeatItem, removeRepeatItem}: Props) {
  const selectedRepeatItem = useSelectedRepeatItemStore((state) => state.selectedRepeatItem);
  const setSelectedRepeatItem = useSelectedRepeatItemStore((state) => state.setSelectedRepeatItem);
  const startTime = useStartTimeStore((state) => state.startTime);
  const endTime = useEndTimeStore((state) => state.endTime);

  const sortable = useSortable({
    id: repeatItem.id,
  });
  const mergedProps = {
    ...sortable.attributes,
    ...sortable.listeners,
  };

  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString(sortable.transform),
  };

  return (
    <div className={`item ${selectedRepeatItem?.id === repeatItem.id ? 'selected' : ''}`}
         ref={(node) => {
           sortable.setNodeRef(node);
         }}
         style={style}
    >
      <div className="item-icon" onClick={() => clickRepeatItem(repeatItem)}>
        <Icon className={getRepeatClassName(repeatItem.start, repeatItem.end)} icon={faRepeat} />
      </div>
      <div className="item-start"
           {...mergedProps}
      >
        {repeatItem.start}
      </div>
      <div className="item-end"
           {...mergedProps}
      >
        {repeatItem.end}
      </div>
      <div className="item-desc"
           {...mergedProps}
      >
        {repeatItem.desc}
      </div>
      <div className="close" onClick={() => removeRepeatItem(repeatItem)}><Icon icon={faCircleXmark} /></div>
    </div>

  )
}

export default RepeatItemView;

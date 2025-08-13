import {PlayItem} from "@/components/PlayListView.tsx";
import {RepeatItem} from "@/bindings.ts";
import {useSelectedRepeatItemStore} from "@/stores/selectedRepeatItemStore.ts";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faCirclePlay, faCircleXmark} from "@fortawesome/free-solid-svg-icons";

type Props = {
  repeatItem: RepeatItem
  removeRepeatItem: (repeatItem: RepeatItem) => void
}

function RepeatItemView({repeatItem, removeRepeatItem}: Props) {
  const selectedRepeatItem = useSelectedRepeatItemStore((state) => state.selectedRepeatItem);
  const setSelectedRepeatItem = useSelectedRepeatItemStore((state) => state.setSelectedRepeatItem);

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
      <div className="item-icon" onClick={() => setSelectedRepeatItem(repeatItem)}><Icon className="small" icon={faCirclePlay} /></div>
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

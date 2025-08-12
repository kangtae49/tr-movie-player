import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faCirclePlay, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {PlayItem} from "@/components/PlayListView.tsx";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";

type Props = {
  playItem: PlayItem
  removePlayItem: (PlayItem: PlayItem) => void
}
function PlayItemView({playItem, removePlayItem}: Props) {
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);
  const setSelectedPlayItem = useSelectedPlayItemStore((state) => state.setSelectedPlayItem);

  const sortable = useSortable({
    id: playItem.id,
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
    <div className={`play-item ${selectedPlayItem?.id === playItem.id ? 'selected' : ''}`}
         ref={(node) => {
           sortable.setNodeRef(node);
         }}
         style={style}
    >
      <div className="item-icon" onClick={() => setSelectedPlayItem(playItem)}><Icon className="small" icon={faCirclePlay} /></div>

      <div className="item-path"
           {...mergedProps}
      >
        {playItem.path}
      </div>
      <div className="play-close" onClick={() => removePlayItem(playItem)}><Icon icon={faCircleXmark} /></div>
    </div>
  )
}

export default PlayItemView;


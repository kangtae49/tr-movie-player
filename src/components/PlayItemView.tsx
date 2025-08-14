import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {faCirclePlay, faCircleXmark} from "@fortawesome/free-solid-svg-icons";
import {useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {PlayItem} from "@/components/PlayListView.tsx";
import {useSelectedPlayItemStore} from "@/stores/selectedPlayItemStore.ts";
import {useSelectedSubtitleStore} from "@/stores/selectedSubtitleStore.ts";
import {useIsPlayStore} from "@/stores/isPlayStore.ts";

type Props = {
  playItem: PlayItem
  clickPlayItem: (playItem: PlayItem) => void
  removePlayItem: (playItem: PlayItem) => void
}
function PlayItemView({playItem, clickPlayItem, removePlayItem}: Props) {
  const selectedPlayItem = useSelectedPlayItemStore((state) => state.selectedPlayItem);

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
    <div className={`item ${selectedPlayItem?.id === playItem.id ? 'selected' : ''}`}
         ref={(node) => {
           sortable.setNodeRef(node);
         }}
         style={style}
    >
      <div className="item-icon" onClick={() => clickPlayItem(playItem)}><Icon className="small" icon={faCirclePlay} /></div>

      <div className="item-path"
           {...mergedProps}
      >
        {playItem.path}
      </div>
      <div className="close" onClick={() => removePlayItem(playItem)}><Icon icon={faCircleXmark} /></div>
    </div>
  )
}

export default PlayItemView;


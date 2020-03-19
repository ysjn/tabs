import React, { useCallback, useEffect } from "react";
import { useGlobal } from "./GlobalContext";
import { css, cx } from "emotion";
import { useDrag } from "react-dnd";
import DropZone from "./DropZone";

import TabListItemMenu from "./TabListItemMenu";
import TabListItemFavIcon from "./TabListItemFavIcon";

const POPUP_URL = window.chrome.runtime.getURL("index.html");
let POPUP_WINDOW_ID = 0;
window.chrome.tabs.query({ url: POPUP_URL }, tab => {
  POPUP_WINDOW_ID = tab[0].windowId;
});
let lastFocusedWinId = 0;

const styles = {
  default: css`
    position: relative;
    display: block;
    padding: 0 41px;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    list-style: none;

    &:hover {
      background-color: var(--hover);
    }
  `,
  title: css`
    padding: 10px 0 23px;
  `,
  url: css`
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 0 41px 8px;
    color: var(--secondary);
    font-size: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-sizing: border-box;
    overflow: hidden;
    pointer-events: none;
  `
};

interface Props extends chrome.tabs.Tab {
  // active: true
  // audible: false
  // autoDiscardable: true
  // discarded: false
  // favIconUrl: "https://www.google.com/favicon.ico"
  // height: 766
  // highlighted: true
  // id: 566
  // incognito: false
  // index: 9
  // mutedInfo: {muted: false}
  // openerTabId: 16
  // pinned: false
  // selected: true
  // status: "complete"
  // title: "Google"
  // url: "https://www.google.com/"
  // width: 1031
  // windowId: 12
}

const TabListItem: React.FC<Props> = props => {
  const { globalState, setGlobalState } = useGlobal();

  const [{ isDragging, draggingId }, dragRef] = useDrag({
    item: { type: "tab", windowId: props.windowId, tabId: props.id },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      draggingId: props.id
    })
  });

  useEffect(() => {
    setGlobalState({ isDragging, draggingId });
  }, [isDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const isDraggingOther = globalState.isDragging && globalState.draggingId !== props.id;
  const dropZoneProps = { windowId: props.windowId, tabIndex: props.index };

  const style = cx(
    styles.default,
    css`
      ${props.selected ? "background-color: var(--active);" : ""}
      ${isDragging ? "cursor: grabbing;" : ""}
    `
  );

  // show tab on hover
  const onMouseEnter = useCallback(() => {
    if (!props.id) {
      return;
    }
    window.chrome.tabs.update(props.id, { active: true });

    // if the window has not been focused on last update,
    // focus window again to bring to front
    if (lastFocusedWinId === props.windowId) {
      return;
    }

    window.chrome.windows.update(props.windowId, { focused: true }, () => {
      window.chrome.windows.update(POPUP_WINDOW_ID, { focused: true });
      lastFocusedWinId = props.windowId;
    });
  }, [props]);

  // TODO: reActivate original tab onMouseLeave
  // const onMouseLeave = useCallback(() => {
  // }, [props]);

  // make clicked tab active
  const onClick = useCallback(() => {
    window.chrome.windows.get(props.windowId, win => {
      if (win.focused) {
        return false;
      }
      window.chrome.windows.update(props.windowId, { focused: true });
    });
    setTimeout(() => window.close(), 0);
  }, [props]);

  // do not include popup window as tab
  if (props.url && props.url.match(POPUP_URL)) {
    return null;
  }

  return (
    <li className={style} onMouseEnter={onMouseEnter} ref={dragRef}>
      {isDraggingOther && <DropZone top {...dropZoneProps} />}
      <div onClick={onClick}>
        <TabListItemFavIcon
          favIconUrl={props.favIconUrl}
          title={props.title}
          status={props.status}
        />
        <p className={styles.title}>{props.title}</p>
        <p className={styles.url}>{props.url}</p>
      </div>
      <TabListItemMenu id={props.id} pinned={props.pinned} status={props.status} />
      {isDraggingOther && <DropZone bottom {...dropZoneProps} />}
    </li>
  );
};

export default TabListItem;

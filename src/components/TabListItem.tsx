import { css, cx } from "emotion";
import { useObserver } from "mobx-react";
import React, { useCallback, useContext, useEffect } from "react";
import { useDrag } from "react-dnd";
import { browser } from "webextension-polyfill-ts";

import { StoreContext } from "../StoreContext";

import DropZone from "./DropZone";
import TabListItemFavIcon from "./TabListItemFavIcon";
import TabListItemMenu from "./TabListItemMenu";

const POPUP_URL = browser.runtime.getURL("index.html");
let POPUP_WINDOW_ID = 0;
browser.tabs.query({ url: POPUP_URL }).then(tab => {
  POPUP_WINDOW_ID = tab[0].windowId as number;
});
let lastFocusedWinId = 0;

const styles = {
  default: css`
    position: relative;
    display: block;
    padding: 0 40px;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    list-style: none;

    &:hover {
      background-color: var(--hover);
    }
  `,
  title: css`
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    margin-bottom: 23px;
    padding: 10px 5px 0;
    overflow: hidden;
  `,
  url: css`
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    padding: 0 45px 8px;
    color: var(--secondary);
    font-size: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
    box-sizing: border-box;
    overflow: hidden;
  `
};

const TabListItem: React.FC<chrome.tabs.Tab> = props => {
  const store = useContext(StoreContext);

  const [{ isDragging, draggingId }, dragRef] = useDrag({
    item: { type: "tab", windowId: props.windowId, tabId: props.id, tabIndex: props.index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      draggingId: props.id
    })
  });

  useEffect(() => {
    if (draggingId !== undefined) {
      store.setDraggingId(draggingId);
    }
    store.setIsDragging(isDragging);
  }, [isDragging]); // eslint-disable-line react-hooks/exhaustive-deps

  const dropZoneProps = { tabId: props.id, windowId: props.windowId, tabIndex: props.index };

  const style = cx(
    styles.default,
    css`
      ${props.active || props.highlighted ? "background-color: var(--active);" : ""}
      ${isDragging ? "cursor: grabbing;" : ""}
    `
  );

  // show tab on hover
  const onMouseEnter = useCallback(() => {
    if (!props.id || store.isHighlighting || store.isShiftPressed) {
      return;
    }

    browser.tabs.update(props.id, { active: true });

    // if the window has not been focused on last update,
    // focus window again to bring to front
    if (
      (lastFocusedWinId === 0 && store.lastActiveWindowId === props.windowId) ||
      lastFocusedWinId === props.windowId
    ) {
      return;
    }

    browser.windows.update(props.windowId, { focused: true }).then(() => {
      browser.windows.update(POPUP_WINDOW_ID, { focused: true });
      lastFocusedWinId = props.windowId;
    });
  }, [props]);

  // make clicked tab active
  const onClick = useCallback(() => {
    // toggle highlight
    if (store.isShiftPressed && props.id) {
      browser.tabs.update(props.id, { highlighted: !props.highlighted });
      return;
    }

    // focus window and close popup
    browser.windows.get(props.windowId).then(win => {
      if (win.focused) {
        return false;
      }
      browser.windows.update(props.windowId, { focused: true });
    });
    setTimeout(window.close, 0);
  }, [props]);

  return useObserver(() => {
    const isDraggingOther = store.isDragging && store.draggingId !== props.id;

    return props.url && props.url.match(POPUP_URL) ? null : (
      <li className={style} onMouseEnter={onMouseEnter} ref={dragRef}>
        {isDraggingOther && <DropZone top {...dropZoneProps} />}
        <div onClick={onClick}>
          <TabListItemFavIcon
            favIconUrl={props.favIconUrl}
            title={props.title}
            status={props.status}
          />
          <p className={styles.title} title={props.title}>
            {props.title}
          </p>
          <p className={styles.url} title={props.url}>
            {props.url}
          </p>
        </div>
        <TabListItemMenu id={props.id} pinned={props.pinned} status={props.status} />
        {isDraggingOther && <DropZone bottom {...dropZoneProps} />}
      </li>
    );
  });
};

export default TabListItem;

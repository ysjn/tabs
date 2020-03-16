import React, { useCallback } from "react";
import { css, cx } from "emotion";

// Icons
import "css.gg/icons/close.css";
import "css.gg/icons/pin-alt.css";
import "css.gg/icons/pin-bottom.css";
import "css.gg/icons/file.css";

const POPUP_URL = window.chrome.runtime.getURL("index.html");

const styles = {
  default: css`
    position: relative;
    display: block;
    max-width: 700px;
    padding: 0 41px;
    border-bottom: 1px solid var(--divider);
    cursor: pointer;
    list-style: none;

    &:hover {
      background-color: var(--hover);
    }
  `,
  isPinned: css`
    opacity: 0.5;
  `,
  favicon: css`
    width: 16px;
    height: 16px;
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
  `,
  column: css`
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 41px;
    height: 100%;
  `,
  columnLeft: "",
  columnRight: ""
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
  const style = cx(
    styles.default,
    css`
      ${props.selected ? "background-color: var(--active)" : ""}
    `,
    { [styles.isPinned]: props.pinned }
  );
  styles.columnLeft = cx(
    styles.column,
    css`
      left: 0;
    `
  );
  styles.columnRight = cx(
    styles.column,
    css`
      right: 0;

      ${!props.pinned
        ? `
        &:hover {
          background-color: var(--bg);
          color: #f77;
        }`
        : ".gg-pin-alt { top: 5px; }"}
    `
  );

  // show tab on hover
  const onHover = useCallback(() => {
    if (!props.id) {
      return;
    }
    window.chrome.tabs.update(props.id, { active: true });
    // window.chrome.windows.update(props.extensionTab.windowId, {focused: true});
  }, []);

  // make clicked tab active
  const onClick = useCallback(() => {
    window.chrome.windows.get(props.windowId, win => {
      if (win.focused) {
        return false;
      }
      window.chrome.windows.update(props.windowId, { focused: true });
    });
    setTimeout(() => window.close(), 0);
  }, []);

  // close tab
  const handleClose = useCallback(() => {
    if (!props.id) {
      return;
    }
    window.chrome.tabs.remove(props.id);
  }, []);

  // do not include popup window as tab
  if (props.url && props.url.match(POPUP_URL)) {
    return null;
  }

  return (
    <li className={style} onMouseEnter={onHover}>
      <div onClick={onClick}>
        <div className={styles.columnLeft}>
          {props.favIconUrl ? (
            <img
              className={styles.favicon}
              src={props.favIconUrl}
              alt={`favicon for ${props.title}`}
            />
          ) : (
            <i className="gg-file" />
          )}
        </div>
        <p className={styles.title}>{props.title}</p>
        <p className={styles.url}>{props.url}</p>
      </div>
      <div
        className={styles.columnRight}
        onClick={props.pinned ? undefined : handleClose}
      >
        <i className={props.pinned ? "gg-pin-alt" : "gg-close"} />
      </div>
    </li>
  );
};

export default TabListItem;

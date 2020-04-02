import { css, cx } from "emotion";
import React, { useContext } from "react";
import { DragObjectWithType, useDrop } from "react-dnd";
import { browser } from "webextension-polyfill-ts";

import { StoreContext } from "../StoreContext";

const styles = {
  default: css`
    position: absolute;
    left: 0;
    right: 0;
    height: 50%;
    z-index: 100;
  `,
  top: css`
    top: 0;
  `,
  topActive: css`
    box-shadow: 0 -1px var(--primary), 0 1px var(--primary) inset;
  `,
  bottom: css`
    bottom: 0;
  `,
  bottomActive: css`
    box-shadow: 0 1px var(--primary), 0 -1px var(--primary) inset;
  `
};

interface Props {
  tabId?: number;
  tabIndex: number;
  windowId: number;
  top?: boolean;
  bottom?: boolean;
}

interface DragObject extends DragObjectWithType {
  windowId: number;
  tabId: number;
  tabIndex: number;
}

const DropZone: React.FC<Props> = props => {
  const store = useContext(StoreContext);
  const [{ isOver }, drop] = useDrop({
    accept: "tab",
    drop: (item: DragObject) => {
      if (
        (props.top && item.tabIndex - props.tabIndex === -1) ||
        (props.bottom && item.tabIndex - props.tabIndex === 1)
      ) {
        return;
      }

      if (store.isHighlighting) {
        browser.windows
          .get(item.windowId, { populate: true })
          .then(window => {
            if (window.tabs === undefined || window.tabs.length === 0) {
              return;
            }
            return window.tabs.filter(tab => tab.highlighted).map(tab => tab.id);
          })
          .then(tabIds => {
            // browser.tabs.move(tabIds as number[], {
            //   windowId: props.windowId,
            //   index: props.tabIndex
            // });
            if (tabIds === undefined || tabIds.length === 0) {
              return;
            }
            tabIds.map(id =>
              browser.tabs.move(id as number, {
                windowId: props.windowId,
                index: props.tabIndex
              })
            );
          });
      } else {
        browser.tabs.move(item.tabId, {
          windowId: props.windowId,
          index: props.tabIndex
        });
      }
    },
    collect: monitor => ({ isOver: monitor.isOver() })
  });

  const style = cx(
    styles.default,
    { [styles.top]: props.top },
    { [styles.topActive]: props.top && isOver },
    { [styles.bottom]: props.bottom },
    { [styles.bottomActive]: props.bottom && isOver }
  );
  return <div className={style} ref={drop} />;
};

export default DropZone;

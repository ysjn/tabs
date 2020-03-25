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
  tabIndex: number;
  windowId: number;
  top?: boolean;
  bottom?: boolean;
}

interface DragObject extends DragObjectWithType {
  tabId: number;
}

const DropZone: React.FC<Props> = props => {
  const store = useContext(StoreContext);
  const [{ isOver }, drop] = useDrop({
    accept: "tab",
    drop: (item: DragObject) => {
      if (store.isHighlighting) {
        browser.tabs
          .query({
            highlighted: true,
            windowType: "normal"
          })
          .then(tabs =>
            browser.tabs.move(tabs.map(tab => tab.id) as number[], {
              windowId: props.windowId,
              index: props.tabIndex
            })
          );
      } else {
        browser.tabs.move(item.tabId, {
          windowId: props.windowId,
          index: props.tabIndex
        });
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver()
    })
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

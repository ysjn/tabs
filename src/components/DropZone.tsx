import React from "react";
import { css, cx } from "emotion";
import { useDrop, DragObjectWithType } from "react-dnd";

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
  const [{ isOver }, drop] = useDrop({
    accept: "tab",
    drop: (item: DragObject) => {
      window.chrome.tabs.move(item.tabId, {
        windowId: props.windowId,
        index: props.tabIndex
      });
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

// Icons
import "css.gg/icons/close.css";
import "css.gg/icons/pin-alt.css";
import "css.gg/icons/pin-bottom.css";
import { css } from "emotion";
import React, { useCallback, useEffect, useState } from "react";

type Props = Pick<chrome.tabs.Tab, "id" | "pinned" | "status">;

const style = css`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 41px;
  height: 100%;
  color: var(--secondary);
  z-index: 200;

  &:hover {
    background-color: var(--bg);
    color: #f77;
  }

  .gg-pin-bottom {
    top: 4px;
  }
`;

const TabListItemMenu: React.FC<Props> = props => {
  // close tab
  const handleClose = useCallback(() => {
    if (!props.id) {
      return;
    }
    chrome.tabs.remove(props.id);
  }, [props]);

  // close unpin
  const handleUnpin = useCallback(() => {
    if (!props.id) {
      return;
    }
    chrome.tabs.update(props.id, { pinned: false });
  }, [props]);

  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => {
    if (!props.pinned) {
      return;
    }
    setIsHovered(true);
  }, [props]);

  const onMouseLeave = useCallback(() => {
    if (!props.pinned) {
      return;
    }
    setIsHovered(false);
  }, [props]);

  const [icon, setIcon] = useState("gg-close");

  useEffect(() => {
    if (props.pinned && isHovered) {
      setIcon("gg-pin-alt");
    } else if (props.pinned) {
      setIcon("gg-pin-bottom");
    } else {
      setIcon("gg-close");
    }
  }, [props, isHovered]);

  return (
    <div
      className={style}
      onClick={props.pinned ? handleUnpin : handleClose}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <i className={icon} />
    </div>
  );
};

export default TabListItemMenu;

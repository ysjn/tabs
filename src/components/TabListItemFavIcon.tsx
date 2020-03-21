import React, { useState, useCallback } from "react";
import { css } from "emotion";

// Icons
import "css.gg/icons/file.css";
import "css.gg/icons/spinner.css";

type Props = Pick<chrome.tabs.Tab, "favIconUrl" | "title" | "status">;

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 41px;
  height: 100%;
`;
const favIconStyle = css`
  width: 16px;
  height: 16px;
  text-indent: 100%;
  white-space: nowrap;
  overflow: hidden;
`;

const TabListItemFavIcon: React.FC<Props> = props => {
  const [isFavIconAvailable, setIsFavIconAvailable] = useState(true);
  const favIconNotAvailable = useCallback(() => setIsFavIconAvailable(false), [
    setIsFavIconAvailable
  ]);

  return (
    <div className={style}>
      {props.status === "complete" && props.favIconUrl && isFavIconAvailable ? (
        <img
          className={favIconStyle}
          src={props.favIconUrl}
          alt={`favicon for ${props.title}`}
          onError={favIconNotAvailable}
        />
      ) : (
        <i className={props.status === "loading" ? "gg-spinner" : "gg-file"} />
      )}
    </div>
  );
};

export default TabListItemFavIcon;

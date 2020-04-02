import "css.gg/icons/close.css";
import "css.gg/icons/display-grid.css";
import "css.gg/icons/options.css";
import "css.gg/icons/search.css";
import { css, cx } from "emotion";
import React from "react";

const styles = {
  default: css`
    flex: 0 0 auto;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 30px;
    padding: 10px 5px;
    color: var(--secondary);

    i {
      z-index: 2;
    }

    :after {
      display: none;
      position: absolute;
      top: 10px;
      left: 0;
      width: 30px;
      height: 30px;
      background-color: var(--hover);
      border-radius: 50%;
      content: "";
    }

    :hover {
      cursor: pointer;
      color: #f77;
      :after {
        display: block;
      }
    }
  `
};

interface Props {
  iconName: string;
  title?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const Icon: React.FC<Props> = props => {
  const isActive = css`
    ${props.isActive ? "color: var(--primary); :hover{color: var(--primary);}" : ""}
  `;
  return (
    <div className={cx(styles.default, isActive)} title={props.title} onClick={props.onClick}>
      <i className={`gg-${props.iconName}`} />
    </div>
  );
};

export default Icon;

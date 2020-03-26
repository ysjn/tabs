import { css } from "emotion";
import React from "react";

const style = css`
  display: flex;
  border-bottom: 1px solid var(--divider);
`;

const Header: React.FC = props => <header className={style}>{props.children}</header>;

export default Header;

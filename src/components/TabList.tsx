import React from "react";
import { css } from "emotion";
import TabListItem from "./TabListItem";

interface Props {
  tabs: chrome.tabs.Tab[];
}

const style = css`
  display: inline-block;
  width: 100%;
`;

const TabList: React.FC<Props> = props => {
  return (
    <div className={style}>
      <ul className="">
        {props.tabs.map((tab, index) => (
          <TabListItem {...tab} key={index} />
        ))}
      </ul>
    </div>
  );
};

export default TabList;

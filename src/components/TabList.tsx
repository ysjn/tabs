import React from "react";

import TabListItem from "./TabListItem";

interface Props {
  tabs: chrome.tabs.Tab[];
}

const TabList: React.FC<Props> = props => (
  <ul className="">
    {props.tabs.map((tab, index) => (
      <TabListItem {...tab} key={index} />
    ))}
  </ul>
);

export default TabList;

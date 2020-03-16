import React, { useState, useEffect, useCallback } from "react";
import { css } from "emotion";
import TabList from "./components/TabList";

const style = css`
  font-family: "Mplus 1p", HelveticaNeue, Arial, sans-serif;
  font-size: 13px;
  line-height: 1.4;
  overflow: auto;
`;

const App: React.FC = () => {
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);

  const getTabs = useCallback(() => {
    window.chrome.tabs.query({}, tabs => setTabs(tabs));
  }, []);

  useEffect(() => {
    getTabs();
    window.chrome.tabs.onCreated.addListener(getTabs);
    window.chrome.tabs.onUpdated.addListener(getTabs);
    window.chrome.tabs.onMoved.addListener(getTabs);
    window.chrome.tabs.onSelectionChanged.addListener(getTabs);
    window.chrome.tabs.onActiveChanged.addListener(getTabs);
    window.chrome.tabs.onActivated.addListener(getTabs);
    window.chrome.tabs.onHighlightChanged.addListener(getTabs);
    window.chrome.tabs.onHighlighted.addListener(getTabs);
    window.chrome.tabs.onRemoved.addListener(getTabs);
  }, []);

  return (
    <div className={style}>{tabs.length > 0 && <TabList tabs={tabs} />}</div>
  );
};

export default App;

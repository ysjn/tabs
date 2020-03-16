import React, { useState, useEffect, useCallback } from "react";
import { css } from "emotion";
import TabList from "./components/TabList";

const styles = {
  app: css`
    font-family: "Mplus 1p", HelveticaNeue, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    overflow: auto;
  `,
  windowIndex: css`
    padding: 10px;
    background-color: var(--divider);
  `
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<chrome.windows.Window[]>([]);

  const getTabs = useCallback(() => {
    window.chrome.windows.getAll(
      { populate: true, windowTypes: ["normal"] },
      windowsArray => setWindows(windowsArray)
    );
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
    <div className={styles.app}>
      {windows.length > 0 &&
        windows.map((window, index) => {
          if (window.tabs === undefined) {
            return null;
          }

          if (windows.length === 1) {
            return <TabList tabs={window.tabs} />;
          }

          return (
            <React.Fragment>
              <p className={styles.windowIndex}>Window {index + 1}</p>
              <TabList tabs={window.tabs} />
            </React.Fragment>
          );
        })}
    </div>
  );
};

export default App;

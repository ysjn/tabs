import React, { useState, useEffect, useCallback } from "react";
import { GlobalContext, initialGlobalState } from "./components/GlobalContext";
import { css } from "emotion";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

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

const events = [
  "onCreated",
  "onUpdated",
  "onMoved",
  "onSelectionChanged",
  "onActiveChanged",
  "onActivated",
  "onHighlightChanged",
  "onHighlighted",
  "onRemoved"
];

interface IIndexable {
  [key: string]: any;
}

const App: React.FC = () => {
  const [state, setState] = useState(initialGlobalState);
  const [windows, setWindows] = useState<chrome.windows.Window[]>([]);

  const getTabs = useCallback(() => {
    window.chrome.windows.getAll({ populate: true, windowTypes: ["normal"] }, windowsArray =>
      setWindows(windowsArray)
    );
  }, [setWindows]);

  const focusLastActiveTab = useCallback(event => {
    event = event ? event : window.event;
    const from = event.relatedTarget || event.toElement;
    if (!from || from.nodeName == "HTML") {
      window.chrome.storage.local.get("lastActiveTab", result => {
        window.chrome.tabs.update(result.lastActiveTab.id, { active: true });
      });
    }
  }, []);

  useEffect(() => {
    getTabs();

    events.map(event => (window.chrome.tabs as IIndexable)[event].addListener(getTabs));
    window.chrome.windows.onRemoved.addListener(getTabs);
    window.document.addEventListener("mouseout", focusLastActiveTab);

    return () => {
      events.map(event => (window.chrome.tabs as IIndexable)[event].removeListener(getTabs));
      window.chrome.windows.onRemoved.removeListener(getTabs);
      window.document.removeEventListener("mouseout", focusLastActiveTab);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <GlobalContext.Provider value={[state, setState]}>
      <div className={styles.app}>
        <DndProvider backend={Backend}>
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
        </DndProvider>
      </div>
    </GlobalContext.Provider>
  );
};

export default App;

import { css } from "emotion";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";

import TabList from "./components/TabList";
import { StoreContext } from "./StoreContext";

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

const chromeTabEvents = [
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
  const [windows, setWindows] = useState<chrome.windows.Window[]>([]);

  const getTabs = useCallback(() => {
    chrome.windows.getAll({ populate: true, windowTypes: ["normal"] }, windowsArray =>
      setWindows(windowsArray)
    );
  }, [setWindows]);

  const store = useContext(StoreContext);

  const focusLastActiveTab = useCallback(
    (event: MouseEvent) => {
      if (store.isHighlighting) {
        return;
      }

      if (!event.relatedTarget) {
        chrome.storage.local.get("lastActiveTab", result => {
          chrome.tabs.update(result.lastActiveTab.id, { active: true });
        });
      }
    },
    [store]
  );

  const handleKeyDown = useCallback(
    event => {
      if (event.shiftKey) {
        store.setIsShiftPressed(true);
      }
      if (event.altKey) {
        store.setIsAltPressed(true);
      }
    },
    [store]
  );

  const handleKeyUp = useCallback(() => {
    store.setIsShiftPressed(false);
    store.setIsAltPressed(false);
  }, [store]);

  const handleBlur = useCallback(() => {
    if (!store.isHighlighting) {
      return false;
    }

    chrome.storage.local.get("lastActiveTab", result => {
      chrome.tabs.update(result.lastActiveTab.id, { active: true });
      store.setIsHighlighting(false);
    });
  }, [store]);

  const windowEvents = useMemo(
    () => ({
      mouseout: focusLastActiveTab,
      keydown: handleKeyDown,
      keyup: handleKeyUp,
      blur: handleBlur
    }),
    [focusLastActiveTab, handleKeyDown, handleKeyUp, handleBlur]
  );

  useEffect(() => {
    getTabs();

    chromeTabEvents.map(event => (chrome.tabs as IIndexable)[event].addListener(getTabs));
    chrome.windows.onRemoved.addListener(getTabs);
    for (let k in windowEvents) {
      window.addEventListener(k, (windowEvents as IIndexable)[k]);
    }

    return () => {
      chromeTabEvents.map(event => (chrome.tabs as IIndexable)[event].removeListener(getTabs));
      chrome.windows.onRemoved.removeListener(getTabs);
      for (let k in windowEvents) {
        window.removeEventListener(k, (windowEvents as IIndexable)[k]);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.app}>
      <DndProvider backend={Backend}>
        {windows.length > 0 &&
          windows.map((window, index) => {
            if (window.tabs === undefined) {
              return null;
            }

            if (windows.length === 1) {
              return <TabList windows={windows} tabs={window.tabs} />;
            }

            return (
              <React.Fragment>
                <p className={styles.windowIndex}>Window {index + 1}</p>
                <TabList windows={windows} tabs={window.tabs} />
              </React.Fragment>
            );
          })}
      </DndProvider>
    </div>
  );
};

export default App;

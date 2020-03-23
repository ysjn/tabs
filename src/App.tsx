import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useGlobal } from "./components/GlobalContext";
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
    window.chrome.windows.getAll({ populate: true, windowTypes: ["normal"] }, windowsArray =>
      setWindows(windowsArray)
    );
  }, [setWindows]);

  const { globalState, setGlobalState } = useGlobal();

  const focusLastActiveTab = useCallback(
    (event: MouseEvent) => {
      if (globalState.isHighlighting) {
        return;
      }

      if (!event.relatedTarget) {
        window.chrome.storage.local.get("lastActiveTab", result => {
          window.chrome.tabs.update(result.lastActiveTab.id, { active: true });
          setGlobalState({ isHighlighting: false });
        });
      }
    },
    [globalState, setGlobalState]
  );

  const handleKeyDown = useCallback(
    event => {
      if (event.shiftKey) {
        setGlobalState({ isShiftPressed: true });
      } else if (event.altKey) {
        setGlobalState({ isAltPressed: true });
      }
    },
    [globalState, setGlobalState]
  );

  const handleBlur = useCallback(() => {
    if (!globalState.isHighlighting) {
      return false;
    }
    window.chrome.storage.local.get("lastActiveTab", result => {
      window.chrome.tabs.update(result.lastActiveTab.id, { active: true });
      setGlobalState({ isHighlighting: false });
    });
  }, [globalState, setGlobalState]);

  const handleKeyUp = useCallback(() => {
    setGlobalState({ isShiftPressed: false, isAltPressed: false });
  }, [globalState, setGlobalState]);

  const windowEvents = useMemo(
    () => ({
      mouseout: focusLastActiveTab,
      keydown: handleKeyDown,
      keyup: handleKeyUp,
      blur: handleBlur
    }),
    [focusLastActiveTab, handleKeyDown, handleKeyUp]
  );

  useEffect(() => {
    getTabs();

    chromeTabEvents.map(event => (window.chrome.tabs as IIndexable)[event].addListener(getTabs));
    window.chrome.windows.onRemoved.addListener(getTabs);
    for (let k in windowEvents) {
      window.addEventListener(k, (windowEvents as IIndexable)[k]);
    }

    return () => {
      chromeTabEvents.map(event =>
        (window.chrome.tabs as IIndexable)[event].removeListener(getTabs)
      );
      window.chrome.windows.onRemoved.removeListener(getTabs);
      for (let k in windowEvents) {
        window.removeEventListener(k, (windowEvents as IIndexable)[k]);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect(() => {
  //   console.log(globalState);
  // }, [globalState.isHighlighting]);
  console.log("render");

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

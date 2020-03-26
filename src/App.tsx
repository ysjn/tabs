import { css } from "emotion";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { browser } from "webextension-polyfill-ts";

import FilterInput from "./components/FilterInput";
import Header from "./components/Header";
import TabList from "./components/TabList";
import { StoreContext } from "./StoreContext";

const styles = {
  app: css`
    font-family: "Mplus 1p", HelveticaNeue, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    display: flex;
    flex-direction: column;
    min-width: 150px;
    height: 100vh;
    overflow: auto;
    word-break: break-word;
  `,
  windowIndex: css`
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    padding: 10px;
    background-color: var(--divider);
    font-size: 13px;
    z-index: 300;
  `
};

const browserTabEvents = [
  "onCreated",
  "onUpdated",
  "onMoved",
  "onActivated",
  "onHighlighted",
  "onRemoved"
];

interface IIndexable {
  [key: string]: any;
}

let renderTimer: NodeJS.Timer;

const App: React.FC = () => {
  const [windows, setWindows] = useState<chrome.windows.Window[]>([]);

  const getWindows = useCallback(
    (timeout: number = 100) => {
      const get = () => {
        browser.windows
          .getAll({ populate: true, windowTypes: ["normal"] })
          .then(windowsArray => setWindows(windowsArray as chrome.windows.Window[]));
      };
      clearTimeout(renderTimer);
      renderTimer = setTimeout(get, timeout);
    },
    [setWindows]
  );

  const store = useContext(StoreContext);

  const focusLastActiveTab = useCallback(
    (event: MouseEvent) => {
      if (!store.isHighlighting && !event.relatedTarget) {
        browser.tabs.update(store.lastActiveTabId, { active: true });
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
      return;
    }

    store.setIsHighlighting(false);

    browser.tabs
      .query({ highlighted: true, windowType: "normal" })
      .then(tabs => tabs.map(tab => browser.tabs.update(tab.id, { highlighted: false })));

    browser.storage.local
      .get("lastActiveTab")
      .then(result => browser.tabs.update(result.lastActiveTab.id, { active: true }));
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

  // ComponentDidMount
  useEffect(() => {
    getWindows(0);

    browser.storage.local.get(["lastActiveWindowId", "lastActiveTabId"]).then(result => {
      store.setLastActiveWindowId(result.lastActiveWindowId);
      store.setLastActiveTabId(result.lastActiveTabId);
    });

    browserTabEvents.map(event => (browser.tabs as IIndexable)[event].addListener(getWindows));
    browser.windows.onRemoved.addListener(getWindows);
    for (let k in windowEvents) {
      window.addEventListener(k, (windowEvents as IIndexable)[k]);
    }

    return () => {
      browserTabEvents.map(event => (browser.tabs as IIndexable)[event].removeListener(getWindows));
      browser.windows.onRemoved.removeListener(getWindows);
      for (let k in windowEvents) {
        window.removeEventListener(k, (windowEvents as IIndexable)[k]);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const isHighlighting = windows.some(
      window => window.tabs && window.tabs.filter(tab => tab.highlighted).length >= 2
    );
    store.setIsHighlighting(isHighlighting);
  }, [windows]);

  return (
    <div className={styles.app}>
      <Header>
        <FilterInput />
      </Header>
      <DndProvider backend={Backend}>
        {windows.map((window, index) =>
          window.tabs === undefined ? null : (
            <section key={index}>
              {windows.length >= 2 && <h1 className={styles.windowIndex}>Window {index + 1}</h1>}
              <TabList tabs={window.tabs} key={index} />
            </section>
          )
        )}
      </DndProvider>
    </div>
  );
};

export default App;

import { css } from "emotion";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import Backend from "react-dnd-html5-backend";
import { browser } from "webextension-polyfill-ts";

import FilterInput from "./components/FilterInput";
import Header from "./components/Header";
import Icon from "./components/Icon";
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
    padding: 8px 10px;
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

interface windowMetrics {
  id: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

let renderTimer: NodeJS.Timer;
let previousWindowMetrics: windowMetrics[] = [];

const App: React.FC = () => {
  const [windows, setWindows] = useState<chrome.windows.Window[]>([]);

  const [isTileActive, setIsTileActive] = useState(false);
  const [isOptionsActive, setIsOptionsActive] = useState(false);

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

  const saveWindowPositions = () => {
    previousWindowMetrics = [];
    return browser.windows.getAll({ windowTypes: ["normal"] }).then(windows =>
      windows.map(browserWindow =>
        previousWindowMetrics.push({
          id: browserWindow.id!,
          top: browserWindow.top!,
          left: browserWindow.left!,
          width: browserWindow.width!,
          height: browserWindow.height!
        })
      )
    );
  };

  const restoreWindowPositions = () => {
    previousWindowMetrics.map((browserWindow, index) => {
      if (!browser.windows.get(browserWindow.id)) {
        return;
      }
      const { top, left, width, height } = previousWindowMetrics[index];
      browser.windows.update(browserWindow.id, { top, left, width, height });
    });
  };

  const tileWindows = () => {
    browser.windows.getAll({ windowTypes: ["normal"] }).then(windows => {
      let width = Math.round(window.screen.width / windows.length);
      const isGrid = width <= 500;
      width = isGrid ? 500 : width;
      let height = Math.round(window.screen.height);
      const column = Math.floor(window.screen.width / width);
      const row = Math.round(windows.length / column);
      width = Math.round(window.screen.width / column);
      height = isGrid ? Math.round(height / row) : height;

      let currentCol = 0;
      let currentRow = 0;
      for (const browserWindow of windows) {
        if (browserWindow.id === undefined) {
          continue;
        }

        browser.windows.update(browserWindow.id, {
          top: height * currentRow,
          left: width * currentCol,
          width,
          height
        });
        if (currentCol + 1 === column) {
          currentCol = 0;
          currentRow++;
        } else {
          currentCol++;
        }
      }
    });
  };

  const tileButtonHandler = useCallback(() => {
    if (!isTileActive) {
      if (previousWindowMetrics.length === 0) {
        saveWindowPositions().then(() => tileWindows());
      } else {
        tileWindows();
      }
      setIsTileActive(true);
    } else {
      restoreWindowPositions();
      setIsTileActive(false);
    }
  }, [windows, isTileActive, setIsTileActive]);

  const handleOnWindowRemove = useCallback(() => {
    if (!isTileActive) {
      return;
    }
    if (windows.length <= 2) {
      restoreWindowPositions();
      setIsTileActive(false);
    } else {
      tileWindows();
    }
  }, [restoreWindowPositions, isTileActive, setIsTileActive, tileWindows]);

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
    for (const k in windowEvents) {
      window.addEventListener(k, (windowEvents as IIndexable)[k]);
    }

    return () => {
      browserTabEvents.map(event => (browser.tabs as IIndexable)[event].removeListener(getWindows));
      browser.windows.onRemoved.removeListener(getWindows);
      for (const k in windowEvents) {
        window.removeEventListener(k, (windowEvents as IIndexable)[k]);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    browser.windows.onRemoved.addListener(handleOnWindowRemove);
    return () => browser.windows.onRemoved.removeListener(handleOnWindowRemove);
  }, [windows, isTileActive, setIsTileActive]);

  useEffect(() => {
    const isHighlighting = windows.some(
      window => window.tabs && window.tabs.filter(tab => tab.highlighted).length >= 2
    );
    store.setIsHighlighting(isHighlighting);
  }, [windows, store]);

  return (
    <div className={styles.app}>
      <Header>
        <FilterInput />
        {windows.length >= 2 && (
          <Icon
            iconName="display-grid"
            title="temporary tile windows"
            isActive={isTileActive}
            onClick={tileButtonHandler}
          />
        )}
        {/*
        <Icon
          iconName="options"
          title="options"
          isActive={isOptionsActive}
          onClick={() => setIsOptionsActive(!isOptionsActive)}
        />
        */}
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

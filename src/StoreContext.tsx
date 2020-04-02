import { useLocalStore } from "mobx-react";
import React from "react";

const createStore = () => ({
  lastActiveWindowId: 0,
  lastActiveTabId: 0,
  filterString: "",
  draggingId: 0,
  isDragging: false,
  isHighlighting: false,
  isShiftPressed: false,
  isAltPressed: false,
  setLastActiveWindowId(num: number) {
    this.lastActiveWindowId = num;
  },
  setLastActiveTabId(num: number) {
    this.lastActiveTabId = num;
  },
  setFilterString(str: string) {
    this.filterString = str;
  },
  setDraggingId(num: number) {
    this.draggingId = num;
  },
  setIsDragging(bool: boolean) {
    this.isDragging = bool;
  },
  setIsHighlighting(bool: boolean) {
    this.isHighlighting = bool;
  },
  setIsShiftPressed(bool: boolean) {
    this.isShiftPressed = bool;
  },
  setIsAltPressed(bool: boolean) {
    this.isAltPressed = bool;
  }
});

type TStore = ReturnType<typeof createStore>;

export const StoreContext = React.createContext<TStore>(createStore());

export const StoreProvider: React.FC = props => {
  const store = useLocalStore(createStore);
  return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
};

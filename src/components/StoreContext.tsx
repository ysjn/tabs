import React from "react";
import { useLocalStore } from "mobx-react";

const createStore = () => ({
  draggingId: 0,
  isDragging: false,
  isHighlighting: false,
  isShiftPressed: false,
  isAltPressed: false,
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

import React from "react";

interface State {
  isShiftPressed: boolean;
  isAltPressed: boolean;
  isHighlighting: boolean;
  isDragging: boolean;
  draggingId: number;
}

export const initialGlobalState = {
  isShiftPressed: false,
  isAltPressed: false,
  isHighlighting: false,
  isDragging: false,
  draggingId: 0
};

export const GlobalContext = React.createContext<[State, (state: State) => void]>([
  initialGlobalState,
  () => {}
]);

export const useGlobal = () => {
  const [globalState, setState] = React.useContext(GlobalContext);

  return {
    globalState,
    setGlobalState(state: {}) {
      const newGlobalState = Object.assign(globalState, state);
      setState(newGlobalState);
    }
  };
};

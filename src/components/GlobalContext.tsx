import React from "react";

interface State {
  isDragging: boolean;
  draggingId: number;
}

export const initialGlobalState = {
  isDragging: false,
  draggingId: 0
};

export const GlobalContext = React.createContext<
  [State, (state: State) => void]
>([initialGlobalState, () => {}]);

export const useGlobal = () => {
  const [globalState, setState] = React.useContext(GlobalContext);

  return {
    globalState,
    setGlobalState(state: {}) {
      const newGlobalState = { ...globalState, ...state };
      setState(newGlobalState);
    }
  };
};

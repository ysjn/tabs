import React, { useState } from "react";
import ReactDOM from "react-dom";
import "modern-css-reset/dist/reset.min.css";
import { GlobalContext, initialGlobalState } from "./components/GlobalContext";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

const Root = () => {
  const [state, setState] = useState(initialGlobalState);
  return (
    <GlobalContext.Provider value={[state, setState]}>
      <App />
    </GlobalContext.Provider>
  );
};

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

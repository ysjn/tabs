import "modern-css-reset/dist/reset.min.css";
import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { StoreProvider } from "./StoreContext";

const Root: React.FC = () => (
  <StoreProvider>
    <App />
  </StoreProvider>
);

ReactDOM.render(<Root />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

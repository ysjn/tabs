import React from "react";
import ReactDOM from "react-dom";
import "modern-css-reset/dist/reset.min.css";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

// window.chrome.windows.getCurrent({ windowTypes: ["normal"] }, win =>
//   console.log("getCurrentWin: ", win)
// );
// window.chrome.windows.getLastFocused({ windowTypes: ["normal"] }, win =>
//   console.log("getLastFocusedWin: ", win)
// );
// window.chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
//   console.log("from index! currentWindow: ", tabs[0]);
// });
// window.chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
//   console.log("from index! lastFocusedWindow: ", tabs[0]);
// });

ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

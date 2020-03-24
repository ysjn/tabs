// "chrome-extension://coalkcnpihjehhikfkdnmamfcbbigcli/index.html";
const POPUP_URL = chrome.runtime.getURL("index.html");

chrome.browserAction.onClicked.addListener(() => {
  // panelが既に開いていないかチェック
  chrome.tabs.query({ url: POPUP_URL }, tabs => {
    // 開いていたら手前に持ってくる
    if (tabs.length > 0) {
      chrome.windows.update(tabs[0].windowId, { focused: true });
      return;
    }

    // 開いていなければ新たに開く
    chrome.windows.getCurrent(win => {
      if (win.left === undefined || win.width === undefined) {
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.storage.local.set({
          lastActiveWindowId: tabs[0].windowId,
          lastActiveTabId: tabs[0].id
        });
      });

      const createData = {
        url: "index.html",
        type: "popup",
        top: 85,
        left: Math.round(win.left + win.width),
        width: 400,
        get height() { return Math.round(screen.height - this.top * 2); },
      };

      chrome.windows.create(createData);
    });
  });
});

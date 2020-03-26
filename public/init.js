// "chrome-extension://coalkcnpihjehhikfkdnmamfcbbigcli/index.html";
const POPUP_URL = browser.runtime.getURL("index.html");

browser.browserAction.onClicked.addListener(() => {
  // panelが既に開いていないかチェック
  browser.tabs
    .query({ url: POPUP_URL })
    .then(tabs => {
      // 開いていたら手前に持ってくる
      if (tabs.length > 0) {
        browser.windows.update(tabs[0].windowId, { focused: true });
        return;
      }

      // 開いていなければ新たに開く
      browser.windows
        .getCurrent()
        .then(win => {
          if (win.left === undefined || win.width === undefined) {
            return;
          }

          browser.tabs
            .query({ active: true, currentWindow: true })
            .then(tabs => {
              browser.storage.local.set({
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

          browser.windows.create(createData);
        });
    });
});

// "chrome-extension://coalkcnpihjehhikfkdnmamfcbbigcli/index.html";
const POPUP_URL = window.chrome.runtime.getURL("index.html");

window.chrome.browserAction.onClicked.addListener(() => {
  // panelが既に開いていないかチェック
  window.chrome.tabs.query({ url: POPUP_URL }, tabs => {
    // 開いていたら手前に持ってくる
    if (tabs.length > 0) {
      window.chrome.windows.update(tabs[0].windowId, { focused: true });
      return;
    }

    // 開いていなければ新たに開く
    window.chrome.windows.getCurrent(win => {
      if (win.left === undefined || win.width === undefined) {
        return;
      }

      window.chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        window.chrome.storage.local.set({ lastActiveTab: tabs[0] });
      });

      const createData = {
        url: "index.html",
        type: "popup",
        top: 85,
        left: Math.round(win.left + win.width),
        width: 400,
        get height() { return Math.round(screen.height - this.top * 2); },
      };

      window.chrome.windows.create(createData);
    });
  });
});

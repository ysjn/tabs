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

      const popupWidth = 400;
      const left = win.left + win.width;
      const top = 85;
      const popupHeight = screen.height - top * 2;

      window.chrome.windows.create({
        url: "index.html",
        type: "popup",
        width: popupWidth,
        height: popupHeight,
        left: Math.round(left),
        top: Math.round(top)
      });

      // let popupWidth = screen.width;
      // let popupHeight = 100;
      // window.chrome.windows.create({
      //   'url': 'index.html',
      //   'type': 'popup',
      //   'width': popupWidth,
      //   'height': popupHeight,
      //   'left': 0,
      //   'top': 0
      // });
    });
  });
});

const PopupIcon = {
  set: (path) => browser.browserAction.setIcon({ path }),
  off: () => PopupIcon.set('icons/icon96-disabled.png'),
  on: () => PopupIcon.set('icons/icon96.png'),
};

export default PopupIcon;

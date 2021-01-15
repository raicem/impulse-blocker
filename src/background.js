import ImpulseBlocker from './ImpulseBlocker';
import MessageTypes from './enums/messages';
import ExtensionStatus from './enums/extensionStatus';
import SettingTypes from './enums/settings';
import getCurrentWebsiteDomain from './utils/tabs';
import storageHandler from './storage/StorageHandler';

const blocker = new ImpulseBlocker(storageHandler);

blocker.boot();

const messageHandlers = {
  [MessageTypes.GET_CURRENT_DOMAIN]: getCurrentWebsiteDomain,
  [MessageTypes.IS_DOMAIN_BLOCKED]: (req) => blocker.isDomainBlocked(req.domain),
  [MessageTypes.GET_EXTENSION_STATUS]: blocker.getState,
  [MessageTypes.UPDATE_EXTENSION_STATUS]: (req) => blocker.updateStatus(req.parameter),
  [MessageTypes.START_BLOCKING_DOMAIN]: (req) => blocker.addToBlockList(req.domain),
  [MessageTypes.START_ALLOWING_DOMAIN]: (req) => blocker.removeFromBlockList(req.domain),
  [MessageTypes.PAUSE_BLOCKER]: (req) => blocker.pause(req.duration),
  [MessageTypes.UNPAUSE_BLOCKER]: blocker.start,
  [MessageTypes.UPDATE_EXTENSION_SETTING]: (req) => blocker.updateSetting(req.key, req.value),
  [MessageTypes.GET_BLOCKED_DOMAINS_LIST]: blocker.getBlockedDomains,

  default: (req) => {
    throw new Error('Message type not recognized: ', req.type);
  },
};

browser.runtime.onMessage.addListener((req) => (messageHandlers[req.type] || messageHandlers.default)(req));

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get('sites').then((storage) => {
    // if the user is installed the extension first time
    // we should create the sites key in the storage
    if (!Array.isArray(storage.sites)) {
      return browser.storage.local.set({ sites: [] });
    }
  });

  browser.storage.local.get('extensionSettings').then((storage) => {
    if (!Array.isArray(storage.extensionSettings)) {
      return browser.storage.local.set({
        extensionSettings: [
          {
            key: SettingTypes.SHOW_ON_OFF_BUTTONS_IN_POPUP,
            value: SettingTypes.ON,
          },
          {
            key: SettingTypes.SHOW_PAUSE_BUTTONS_IN_POPUP,
            value: SettingTypes.ON,
          },
        ],
      });
    }
  });

  browser.storage.local.get('status').then((storage) => {
    if (!storage.status) {
      return browser.storage.local.set({ status: ExtensionStatus.ON });
    }
  });
});

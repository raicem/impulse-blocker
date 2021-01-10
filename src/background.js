import dayjs from 'dayjs';
import ImpulseBlocker from './ImpulseBlocker';

import MessageTypes from './enums/messages';
import ExtensionStatus from './enums/extensionStatus';
import SettingTypes from './enums/settings';
import StorageHandler from './storage/StorageHandler';
import Website from './storage/Website';
import DomainParser from './utils/DomainParser';
import { backgroundResponse } from './utils/functions';

const blocker = new ImpulseBlocker();

StorageHandler.getExtensionStatus().then(storage => {
  if (storage.status === ExtensionStatus.ON) {
    blocker.start();

    return;
  }

  if (storage.status === ExtensionStatus.PAUSED) {
    StorageHandler.getPausedUntil().then(data => {
      const pausedUntilISO = data.pausedUntil;

      if (!pausedUntilISO) {
        blocker.start();

        return;
      }

      const pausedUntil = dayjs(pausedUntilISO);

      const differenceFromNow = pausedUntil.diff(dayjs(), 'second');

      if (differenceFromNow > 0) {
        blocker.pause(differenceFromNow);

        return;
      }

      blocker.start();
    });

    return;
  }

  if (storage.status === ExtensionStatus.OFF) {
    blocker.stop();

    return;
  }

  // If no status from storage matches our definitions we start the blocker
  blocker.start();
});

const messageHandlers = {
  [MessageTypes.GET_CURRENT_DOMAIN]: () => DomainParser.getCurrentDomain(),

  [MessageTypes.IS_DOMAIN_BLOCKED]: req =>
    StorageHandler.isDomainBlocked(req.domain),

  [MessageTypes.GET_EXTENSION_STATUS]: () =>
    Promise.all([blocker.getStatus(), blocker.getSettings()]).then(values => ({
      extensionStatus: values[0].status,
      extensionSettings: values[1].extensionSettings,
      pausedUntil: blocker.getPausedUntil(),
    })),

  [MessageTypes.UPDATE_EXTENSION_STATUS]: req =>
    blocker[req.parameter === ExtensionStatus.ON ? 'start' : 'stop'](),

  [MessageTypes.START_BLOCKING_DOMAIN]: req =>
    StorageHandler.addWebsite(req.domain.replace(/.*www\./, '')),

  [MessageTypes.START_ALLOWING_DOMAIN]: req =>
    StorageHandler.removeWebsite(req.domain.replace(/.*www\./, '')),

  [MessageTypes.GET_BLOCKED_DOMAINS_LIST]: () =>
    backgroundResponse(StorageHandler.getWebsiteDomains()),

  [MessageTypes.PAUSE_BLOCKER]: req => blocker.pause(req.duration),

  [MessageTypes.UNPAUSE_BLOCKER]: req => blocker.unpause(req.duration),

  [MessageTypes.UPDATE_EXTENSION_SETTING]: req =>
    blocker.updateSettings(req.key, req.value),

  default: req => {
    throw new Error('Message type not recognized: ', req.type);
  },
};

browser.runtime.onMessage.addListener(req =>
  (messageHandlers[req.type] || messageHandlers.default)(req),
);

/**
 * In versions before 1.0, the blocked website domains were stored as array of strings
 * like ["example.com", "example2.com"]. To contain metadata about the blocked
 * websites we should convert the old structure to be array ob objects.
 * Website model represents that object in storage.
 */
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get('sites').then(storage => {
    if (Array.isArray(storage.sites)) {
      const updatedSitesArray = storage.sites.map(url => {
        if (typeof url === 'string') {
          return Website.create(url);
        }

        return url;
      });

      return browser.storage.local.set({
        sites: updatedSitesArray,
      });
    }

    // if the user is installed the extension first time, we should create the sites key in the storage
    if (!Array.isArray(storage.sites)) {
      return browser.storage.local.set({ sites: [] });
    }
  });

  browser.storage.local.get('extensionSettings').then(storage => {
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

  browser.storage.local.get('status').then(storage => {
    if (!storage.status) {
      return browser.storage.local.set({ status: ExtensionStatus.ON });
    }
  });
});

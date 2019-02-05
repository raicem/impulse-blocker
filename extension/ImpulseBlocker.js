import dayjs from 'dayjs';

import ExtensionStatus from './enums/extensionStatus';
import StorageHandler from './storage/StorageHandler';
import { redirectToBlockedPage } from './utils/functions';

export default class ImpulseBlocker {
  constructor() {
    this.pausedUntil = null;
  }

  async getStatus() {
    return StorageHandler.getExtensionStatus();
  }

  async setStatus(status) {
    return StorageHandler.setExtensionStatus(status);
  }

  async getSettings() {
    return StorageHandler.getExtensionSettings();
  }

  start() {
    this.addStorageChangeListener();
    this.startBlocker();
  }

  pause(duration = 60 * 5) {
    this.stop();
    this.setStatus(ExtensionStatus.PAUSED);
    this.setPausedUntil(dayjs().add(duration, 'seconds'));

    setTimeout(() => {
      this.start();
    }, 1000 * duration);
  }

  setPausedUntil(datetime) {
    this.pausedUntil = datetime;
  }

  getPausedUntil() {
    if (this.getStatus() === ExtensionStatus.PAUSED) {
      return this.pausedUntil.format();
    }

    return null;
  }

  unpause() {
    this.startBlocker();
    this.setPausedUntil(null);
  }

  addStorageChangeListener() {
    browser.storage.onChanged.addListener(() => {
      // if the extension is off we should not start the extension with the new list
      if (this.getStatus() === ExtensionStatus.ON) {
        this.startBlocker();
      }
    });
  }

  async startBlocker() {
    const websites = await StorageHandler.getWebsiteDomainsAsMatchPatterns();

    browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);

    if (websites.length > 0) {
      browser.webRequest.onBeforeRequest.addListener(
        redirectToBlockedPage,
        { urls: websites, types: ['main_frame'] },
        ['blocking'],
      );
    }

    this.setStatus(ExtensionStatus.ON);
  }

  stop() {
    browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);
    this.setStatus(ExtensionStatus.OFF);
  }

  static addWebsite(url) {
    StorageHandler.addWebsite(url);
  }

  static removeWebsite(url) {
    StorageHandler.removeWebsite(url);
  }
}

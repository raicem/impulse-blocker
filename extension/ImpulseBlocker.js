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

  async updateSettings(key, value) {
    return StorageHandler.updateExtensionSettings(key, value);
  }

  start() {
    this.setStatus(ExtensionStatus.ON);
    this.addStorageChangeListener();
    this.startBlocker();
  }

  pause(duration = 60 * 5) {
    browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);
    this.setStatus(ExtensionStatus.PAUSED);
    this.setPausedUntil(dayjs().add(duration, 'seconds'));

    setTimeout(() => {
      this.start();
    }, 1000 * duration);
  }

  unpause() {
    this.start();
    this.setPausedUntil(null);
  }

  setPausedUntil(datetime) {
    this.pausedUntil = datetime;
  }

  getPausedUntil() {
    if (this.pausedUntil === null) {
      return null;
    }

    return this.pausedUntil.format();
  }

  addStorageChangeListener() {
    browser.storage.onChanged.addListener(async () => {
      // if the extension is off we should not start the extension with the new list
      const { status } = await this.getStatus();

      if (status === ExtensionStatus.ON) {
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

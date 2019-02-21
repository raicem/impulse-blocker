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
    this.addStorageChangeListener();
    this.startBlocker();
    this.setIcon('icons/icon96.png');
    return this.setStatus(ExtensionStatus.ON);
  }

  pause(duration = 60 * 5) {
    browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);
    this.setPausedUntil(dayjs().add(duration, 'seconds'));
    this.setIcon('icons/icon96-disabled.png');

    setTimeout(() => {
      this.start();
    }, 1000 * duration);

    return this.setStatus(ExtensionStatus.PAUSED);
  }

  unpause() {
    this.setPausedUntil(null);
    return this.start();
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
    const websites = await this.getDomainsToBlock();

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
    this.setIcon('icons/icon96-disabled.png');
    return this.setStatus(ExtensionStatus.OFF);
  }

  getDomainsToBlock() {
    return StorageHandler.getWebsiteDomainsAsMatchPatterns();
  }

  setIcon(path) {
    browser.browserAction.setIcon({
      path,
    });
  }
}

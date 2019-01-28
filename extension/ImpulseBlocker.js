import ExtensionStatus from './enums/extensionStatus';
import StorageHandler from './storage/StorageHandler';
import { redirectToBlockedPage } from './utils/functions';

export default class ImpulseBlocker {
  constructor() {
    this.status = ExtensionStatus.OFF;
  }

  getStatus() {
    return this.status;
  }

  setStatus(status) {
    this.status = status;
  }

  start() {
    this.addStorageChangeListener();
    this.startBlocker();
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

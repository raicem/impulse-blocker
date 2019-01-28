import MessageTypes from './enums/messages';
import ExtensionStatus from './enums/extensionStatus';

import StorageHandler from './storage/StorageHandler';
import Website from './storage/Website';

import { redirectToBlockedPage } from './utils/functions';
import DomainParser from './utils/DomainParser';

class ImpulseBlocker {
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

  // TODO: Refactor this to the StorageHandler
  static addWebsite(url) {
    browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = [...storage.sites, Website.create(url)];

      browser.storage.local.set({ sites: updatedWebsites });
    });
  }

  static removeWebsite(url) {
    browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = storage.sites.filter(
        website => website.domain !== url,
      );

      browser.storage.local.set({ sites: updatedWebsites });
    });
  }
}

const blocker = new ImpulseBlocker();
blocker.start();

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === MessageTypes.GET_CURRENT_DOMAIN) {
    // TODO: Figure out what to return sendResponse does not really return anyting.
    // But eslint expects something to be returned from the callback function
    return sendResponse(DomainParser.getCurrentDomain());
  }

  if (request.type === MessageTypes.IS_DOMAIN_BLOCKED) {
    return sendResponse(StorageHandler.isDomainBlocked(request.domain));
  }

  if (request.type === MessageTypes.GET_EXTENSION_STATUS) {
    return sendResponse(blocker.getStatus());
  }

  if (request.type === MessageTypes.UPDATE_EXTENSION_STATUS) {
    if (request.parameter === ExtensionStatus.ON) {
      // TODO: Return true or false according to the setBlocker function. If it fails to turn on (for example listener can not be added)
      // it should return false
      blocker.setStatus(ExtensionStatus.ON);
      return sendResponse(true);
    }

    if (request.parameter === ExtensionStatus.OFF) {
      // TODO: Return true or false according to the setBlocker function. If it fails to turn off
      // (for example listener can not be removed) it should return false
      blocker.stop();
      return sendResponse(true);
    }
  }

  if (request.type === MessageTypes.START_BLOCKING_DOMAIN) {
    ImpulseBlocker.addWebsite(request.domain.replace(/^www\./, ''));
    return sendResponse(true);
  }

  if (request.type === MessageTypes.START_ALLOWING_DOMAIN) {
    ImpulseBlocker.removeWebsite(request.domain.replace(/^www\./, ''));
    return sendResponse(true);
  }

  if (request.type === MessageTypes.GET_BLOCKED_DOMAINS_LIST) {
    return sendResponse(StorageHandler.getWebsiteDomains());
  }

  throw new Error('Message type not recognized');
});

/**
 * In versions before 1.0, the blocked website domains were stores as array of strings
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
});

import DomainParser from './DomainParser';
import MessageTypes from './enums/messages';
import ExtensionStatus from './enums/extensionStatus';
import getActiveTab from './utils/getActiveTab';
import StorageHandler from './StorageHandler';
import Website from './Website';

const ImpulseBlocker = {
  extStatus: ExtensionStatus.OFF,

  /**
   * Starts the blocker. Adds a listener so that if new websites is added
   * to the blocked list the listener is refreshed.
   */
  init: () => {
    browser.storage.onChanged.addListener(() => {
      // if the extension off we should not be bothered by restarting with new list
      if (ImpulseBlocker.getStatus() === ExtensionStatus.ON) {
        ImpulseBlocker.setBlocker();
      }
    });

    ImpulseBlocker.setBlocker();
  },

  /**
   * Redirects the tab to local "You have been blocked" page.
   */
  redirect: requestDetails => {
    const original = encodeURIComponent(requestDetails.url);
    const interceptPage = `/resources/redirect.html?target=${original}`;
    browser.tabs.update(requestDetails.tabId, { url: interceptPage });
  },

  /**
   * Returns the current status of the extension.
   */
  getStatus: () => ImpulseBlocker.extStatus,

  /**
   * Sets the current status of the extension.
   * @param string status
   */
  setStatus: status => {
    ImpulseBlocker.extStatus = status;
    let icon = 'icons/icon96.png';
    if (ImpulseBlocker.extStatus !== ExtensionStatus.ON) {
      icon = 'icons/icon96-disabled.png';
    }

    browser.browserAction.setIcon({
      path: icon,
    });
  },

  /**
   * Fetches blocked websites lists, attaches them to the listener provided
   * by the WebExtensions API.
   */
  setBlocker: async () => {
    console.log('setting blocker');
    const websites = await StorageHandler.getWebsiteDomainsAsMatchPatterns();

    browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);

    if (websites.length > 0) {
      browser.webRequest.onBeforeRequest.addListener(
        ImpulseBlocker.redirect,
        { urls: websites, types: ['main_frame'] },
        ['blocking'],
      );
    }

    ImpulseBlocker.setStatus(ExtensionStatus.ON);
  },

  /**
   * Removes the web request listener and turns the extension off.
   */
  disableBlocker: () => {
    browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);
    ImpulseBlocker.setStatus(ExtensionStatus.OFF);
  },

  /**
   * Add a website to the blocked list
   * @param  {string} url Url to add to the list
   */
  addSite: url => {
    browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = [...storage.sites, Website.create(url)];

      browser.storage.local.set({
        sites: updatedWebsites,
      });
    });
  },

  /**
   * Add a website to the blocked list
   * @param  {string} url Url to remove to the list
   */
  removeSite: url => {
    browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = storage.sites.filter(
        website => website.domain !== url,
      );

      browser.storage.local.set({
        sites: updatedWebsites,
      });
    });
  },
};

ImpulseBlocker.init();

// Helper functions to access object literal from menubar.js file. These funcitons are
// easily accessible from the getBackgroundPage instance.
function getStatus() {
  return ImpulseBlocker.getStatus();
}

function disableBlocker() {
  ImpulseBlocker.disableBlocker();
}

function setBlocker() {
  ImpulseBlocker.setBlocker();
}

async function getDomain() {
  const activeTab = await getActiveTab();

  return DomainParser.parse(activeTab.url);
}

function getSites() {
  return StorageHandler.getWebsiteDomains();
}

function addDomainToTheBlockedList(url) {
  return ImpulseBlocker.addSite(url.replace(/^www\./, ''));
}

function removeDomainToTheBlockedList(url) {
  return ImpulseBlocker.removeSite(url.replace(/^www\./, ''));
}

async function isDomainBlocked(urlToMatch) {
  const websites = await StorageHandler.getWebsiteDomains();
  return websites.includes(urlToMatch);
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === MessageTypes.GET_CURRENT_DOMAIN) {
    // TODO: Figure out what to return sendResponse does not really return anyting.
    // But eslint expects something to be returned from the callback function
    return sendResponse(getDomain());
  }

  if (request.type === MessageTypes.IS_DOMAIN_BLOCKED) {
    return sendResponse(isDomainBlocked(request.domain));
  }

  if (request.type === MessageTypes.GET_EXTENSION_STATUS) {
    return sendResponse(getStatus());
  }

  if (request.type === MessageTypes.UPDATE_EXTENSION_STATUS) {
    if (request.parameter === ExtensionStatus.ON) {
      // TODO: Return true or false according to the setBlocker function. If it fails to turn on (for example listener can not be added)
      // it should return false
      setBlocker();
      return sendResponse(true);
    }

    if (request.parameter === ExtensionStatus.OFF) {
      // TODO: Return true or false according to the setBlocker function. If it fails to turn off
      // (for example listener can not be removed) it should return false
      disableBlocker();
      return sendResponse(true);
    }
  }

  if (request.type === MessageTypes.START_BLOCKING_DOMAIN) {
    addDomainToTheBlockedList(request.domain);
    return sendResponse(true);
  }

  if (request.type === MessageTypes.START_ALLOWING_DOMAIN) {
    removeDomainToTheBlockedList(request.domain);
    return sendResponse(true);
  }

  if (request.type === MessageTypes.GET_BLOCKED_DOMAINS_LIST) {
    return sendResponse(getSites());
  }

  console.log(request.type);
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

import DomainParser from './DomainParser';
import MessageTypes from './enums/messages';
import ExtensionStatusEnum from './enums/extensionStatus';
import getActiveTab from './utils/getActiveTab';

const ImpulseBlocker = {
  extStatus: ExtensionStatusEnum.OFF,

  /**
   * Starts the blocker. Adds a listener so that if new websites is added
   * to the blocked list the listener is refreshed.
   */
  init: () => {
    const handlingStorage = browser.storage.local.get('sites').then(storage => {
      if (typeof storage.sites === 'undefined') {
        return browser.storage.local.set({
          sites: [],
        });
      }
    });

    handlingStorage.then(ImpulseBlocker.setBlocker);
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
    if (ImpulseBlocker.extStatus !== 'on') {
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
  setBlocker: () => {
    browser.storage.local.get('sites').then(storage => {
      console.log(storage);
      const pattern = storage.sites.map(item => {
        if (item instanceof Object) {
          return `*://*.${item.domain}/*`;
        }

        return `*://*.${item}/*`;
      });

      console.log(pattern);

      // remove the old listener with the old list of websites.
      browser.webRequest.onBeforeRequest.removeListener(
        ImpulseBlocker.redirect,
      );

      // if there are websites to block add the new blocklist to the listener
      if (pattern.length > 0) {
        browser.webRequest.onBeforeRequest.addListener(
          ImpulseBlocker.redirect,
          { urls: pattern, types: ['main_frame'] },
          ['blocking'],
        );
      }
    });

    browser.storage.onChanged.addListener(() => {
      // if the extension off we should not be bothered by restarting with new list
      if (ImpulseBlocker.getStatus() === 'on') {
        ImpulseBlocker.setBlocker();
      }
    });

    ImpulseBlocker.setStatus('on');
  },

  /**
   * Removes the web request listener and turns the extension off.
   */
  disableBlocker: () => {
    browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);
    ImpulseBlocker.setStatus('off');
  },

  /**
   * Add a website to the blocked list
   * @param  {string} url Url to add to the list
   */
  addSite: url => {
    browser.storage.local.get('sites').then(storage => {
      const record = {
        domain: url,
        timesBlocked: 0,
        isActive: true,
        added: '2018-09-21',
      };
      storage.sites.push(record);
      browser.storage.local.set({
        sites: storage.sites,
      });
    });
  },

  /**
   * Add a website to the blocked list
   * @param  {string} url Url to remove to the list
   */
  removeSite: url => {
    browser.storage.local.get('sites').then(storage => {
      const i = storage.sites.indexOf(url);
      if (i !== -1) {
        storage.sites.splice(i, 1);
      }
      browser.storage.local.set({
        sites: storage.sites,
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

async function getSites() {
  const storage = await browser.storage.local.get('sites');
  return storage.sites.map(item => {
    if (item instanceof Object) {
      return `*://*.${item.domain}/*`;
    }

    return `*://*.${item}/*`;
  });
}

function addDomainToTheBlockedList(url) {
  return ImpulseBlocker.addSite(url.replace(/^www\./, ''));
}

function removeDomainToTheBlockedList(url) {
  return ImpulseBlocker.removeSite(url.replace(/^www\./, ''));
}

async function isDomainBlocked(urlToMatch) {
  const storage = await getSites();
  return storage.sites.includes(urlToMatch);
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
    if (request.parameter === ExtensionStatusEnum.ON) {
      // TODO: Return true or false according to the setBlocker function. If it fails to turn on (for example listener can not be added)
      // it should return false
      setBlocker();
      return sendResponse(true);
    }

    if (request.parameter === ExtensionStatusEnum.OFF) {
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

  throw new Error('Message type not recognized');
});

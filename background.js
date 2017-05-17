const ImpulseBlocker = {
  extStatus: 'on',

  /**
   * Starts the blocker. Adds a listener so that if new websites is added
   * to the blocked list the listener is refreshed.
   */
  init: () => {
    ImpulseBlocker.setBlocker();
    browser.storage.onChanged.addListener(ImpulseBlocker.setBlocker);
  },

  /**
   * Redirects the tab to local "You have been blocked" page.
   */
  redirect: () => {
    browser.tabs.update({ url: '/resources/redirect.html' });
  },

  /**
   * Returns the current status of the extension.
   */
  getStatus: () => ImpulseBlocker.extStatus,

  /**
   * Sets the current status of the extension.
   * @param string status
   */
  setStatus: (status) => {
    ImpulseBlocker.extStatus = status;
  },

  /**
   * Fetches blocked websites lists, attaches them to the listener provided
   * by the WebExtensions API.
   */
  setBlocker: () => {
    browser.storage.local.get('sites').then((storage) => {
      const pattern = storage.sites.map(item => `*://*.${item}/*`);

      browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);
      browser.webRequest.onBeforeRequest.addListener(
        ImpulseBlocker.redirect,
        { urls: pattern, types: ['main_frame'] },
        ['blocking'],
      );
    }).catch(() => {
      browser.storage.local.set({
        sites: [],
      });
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
};

ImpulseBlocker.init();


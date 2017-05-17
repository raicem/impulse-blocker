const ImpulseBlocker = {
  extStatus: 'on',

  init: () => {
    ImpulseBlocker.setBlocker();
    browser.storage.onChanged.addListener(ImpulseBlocker.setBlocker);
  },

  redirect: () => {
    browser.tabs.update({ url: '/resources/redirect.html' });
  },

  getStatus: () => ImpulseBlocker.extStatus,

  setStatus: (status) => {
    ImpulseBlocker.extStatus = status;
  },

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

  disableBlocker: () => {
    browser.webRequest.onBeforeRequest.removeListener(ImpulseBlocker.redirect);
    ImpulseBlocker.setStatus('off');
  },
};

ImpulseBlocker.init();


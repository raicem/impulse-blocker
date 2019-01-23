export default {
  getArrayOfWebsiteDomains: () =>
    browser.storage.local.get('sites').then(storage => {
      const pattern = storage.sites.map(item => {
        if (item instanceof Object) {
          return `*://*.${item.domain}/*`;
        }

        return `*://*.${item}/*`;
      });

      return pattern;
    }),
};

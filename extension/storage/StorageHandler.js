import Website from './Website';

export default class StorageHandler {
  static async getWebsiteDomainsAsMatchPatterns() {
    const { sites } = await StorageHandler.getBlockedWebsites();

    return new Promise((resolve, reject) => {
      const mappedWebsites = sites.map(website => `*://*.${website.domain}/*`);

      resolve(mappedWebsites);
    });
  }

  static async getWebsiteDomains() {
    const { sites } = await StorageHandler.getBlockedWebsites();

    return new Promise((resolve, reject) => {
      const mappedWebsites = sites.map(website => website.domain);

      resolve(mappedWebsites);
    });
  }

  static getBlockedWebsites() {
    return browser.storage.local.get('sites');
  }

  static async isDomainBlocked(urlToMatch) {
    const websites = await StorageHandler.getWebsiteDomains();
    return websites.includes(urlToMatch);
  }

  static addWebsite(url) {
    browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = [...storage.sites, Website.create(url)];

      browser.storage.local.set({
        sites: updatedWebsites,
      });
    });
  }

  static removeWebsite(url) {
    browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = storage.sites.filter(
        website => website.domain !== url,
      );

      browser.storage.local.set({
        sites: updatedWebsites,
      });
    });
  }
}

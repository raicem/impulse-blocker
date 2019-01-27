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
}

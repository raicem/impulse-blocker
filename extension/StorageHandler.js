export default class StorageHandler {
  static async getArrayOfWebsiteDomainsWithMatchPatterns() {
    const { sites } = await StorageHandler.getBlockedWebsites();

    return new Promise((resolve, reject) => {
      const mappedWebsites = sites.map(website => {
        if (website instanceof Object) {
          return `*://*.${website.domain}/*`;
        }

        return `*://*.${website}/*`;
      });

      resolve(mappedWebsites);
    });
  }

  static async getArrayOfWebsiteDomains() {
    const { sites } = await StorageHandler.getBlockedWebsites();

    return new Promise((resolve, reject) => {
      const mappedWebsites = sites.map(website => {
        if (website instanceof Object) {
          return website.domain;
        }

        return website;
      });

      resolve(mappedWebsites);
    });
  }

  static getBlockedWebsites() {
    return browser.storage.local.get('sites');
  }
}

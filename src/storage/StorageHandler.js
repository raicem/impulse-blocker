import Website from './Website';

export default class StorageHandler {
  static async getWebsiteDomainsAsMatchPatterns() {
    const { sites } = await StorageHandler.getBlockedWebsites();

    return new Promise(resolve => {
      const mappedWebsites = sites.map(website => `*://*.${website.domain}/*`);

      resolve(mappedWebsites);
    })
  }

  static async getWebsiteDomains() {
    const { sites } = await StorageHandler.getBlockedWebsites();
    return sites.map(website => website.domain);
  }

  static getBlockedWebsites() {
    return browser.storage.local.get('sites');
  }

  static async isDomainBlocked(urlToMatch) {
    const websites = await StorageHandler.getWebsiteDomains();
    return websites.includes(urlToMatch);
  }

  static addWebsite(url) {
    return browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = [...storage.sites, Website.create(url)];

      return browser.storage.local.set({
        sites: updatedWebsites,
      });
    });
  }

  static removeWebsite(url) {
    return browser.storage.local.get('sites').then(storage => {
      const updatedWebsites = storage.sites.filter(
        website => website.domain !== url,
      );

      return browser.storage.local.set({
        sites: updatedWebsites,
      });
    });
  }

  static getExtensionStatus() {
    return browser.storage.local.get('status');
  }

  static async setExtensionStatus(status) {
    return browser.storage.local.set({
      status,
    });
  }

  static async setPausedUntil(datetime) {
    console.log('setting paused until');
    console.log(datetime.toISOString());
    return browser.storage.local.set({
      pausedUntil: datetime.toISOString(),
    });
  }

  static async getPausedUntil() {
    return browser.storage.local.get('pausedUntil');
  }

  static getExtensionSettings() {
    return browser.storage.local.get('extensionSettings');
  }

  static updateExtensionSettings(key, value) {
    return browser.storage.local.get('extensionSettings').then(storage => {
      const updatedSettings = storage.extensionSettings.filter(
        setting => setting.key !== key,
      );
      updatedSettings.push({ key, value });

      browser.storage.local.set({
        extensionSettings: updatedSettings,
      });

      return updatedSettings;
    });
  }
}

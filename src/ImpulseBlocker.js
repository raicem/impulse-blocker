import dayjs from 'dayjs';

import extensionStatus from './enums/extensionStatus';
import Website from './storage/Website';
import PopupIcon from './PopupIcon';
import { createMatchPatterns, redirectToBlockedPage } from './utils/functions';

class ImpulseBlocker {
  constructor(storageHandler) {
    this.storageHandler = storageHandler;

    this.boot = this.boot.bind(this);
    this.onPermissionsUpdated = this.onPermissionsUpdated.bind(this);
    this.onStorageUpdated = this.onStorageUpdated.bind(this);
    this.getState = this.getState.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.getBlockedDomains = this.getBlockedDomains.bind(this);
  }

  boot() {
    // browser.permissions.contains({
    //   permissions: ["history"]
    // }).then((response) => {
    //   if (!response) {
    //     this.requestPermissions(["history"]);
    //   }
    // });
    browser.storage.onChanged.addListener(this.onStorageUpdated);
    browser.permissions.onAdded.addListener(this.onPermissionsUpdated);
    browser.permissions.onRemoved.addListener(this.onPermissionsUpdated);

    return this.storageHandler.getStatus().then(async ({ status }) => {
      if (status === extensionStatus.ON) {
        return this.start(false);
      }

      if (status === extensionStatus.OFF) {
        return this.stop(false);
      }

      if (status === extensionStatus.PAUSED) {
        /* pausedUntil format is 2021-01-10T11:52:32.067Z */
        return this.storageHandler.getPausedUntil().then(({ pausedUntil }) => {
          if (!pausedUntil) {
            return this.start(false);
          }

          const pausedUntilParsed = dayjs(pausedUntil);

          const differenceFromNow = pausedUntilParsed.diff(dayjs(), 'second');

          if (differenceFromNow < 0) {
            return this.start(false);
          }

          return this.pause(differenceFromNow, false);
        });
      }

      return this.start(false);
    });
  }

  onPermissionsUpdated(permissions) {
    console.log("update:" + permissions.permissions);
    this.updateSetting("permissions", permissions.permissions);
  }

  attachWebRequestListener() {
    return this.storageHandler.getBlockedWebsites().then(({ sites }) => {
      const domainsToBlock = createMatchPatterns(sites);
      browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);

      if (domainsToBlock.length > 0) {
        browser.webRequest.onBeforeRequest.addListener(
          redirectToBlockedPage,
          { urls: domainsToBlock, types: ['main_frame'] },
          ['blocking'],
        );
      }

      return true;
    });
  }

  onStorageUpdated(changes) {
    if (changes.sites === undefined) {
      return Promise.resolve('No need for action');
    }

    return this.storageHandler.getStatus().then(({ status }) => {
      if (status === extensionStatus.ON) {
        return this.attachWebRequestListener();
      }

      return Promise.resolve('No need for action');
    });
  }

  async stop(setStatus = true) {
    if (setStatus) {
      await this.storageHandler.setStatus(extensionStatus.OFF);
    }

    await browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);
    await PopupIcon.off();
  }

  async start(setStatus = true) {
    if (setStatus) {
      await this.storageHandler.setStatus(extensionStatus.ON);
    }

    await this.attachWebRequestListener();
    await PopupIcon.on();
  }

  async pause(duration = 60 * 5, setStatus = true) {
    browser.webRequest.onBeforeRequest.removeListener(redirectToBlockedPage);

    const pausedUntil = dayjs().add(duration, 'seconds');

    if (setStatus) {
      await this.storageHandler.setStatus(extensionStatus.PAUSED);
    }

    await this.storageHandler.setPausedUntil(pausedUntil);
    await PopupIcon.off();

    setTimeout(() => {
      this.start();
    }, 1000 * duration);
  }

  isDomainBlocked(domainToCheck) {
    return this.storageHandler.getBlockedWebsites().then(({ sites }) => {
      const domains = sites.map((site) => site.domain);

      return domains.includes(domainToCheck);
    });
  }

  getBlockedDomains() {
    return this.storageHandler.getBlockedWebsites()
      .then((storage) => storage.sites.map((website) => website.domain));
  }

  getState() {
    const promises = [
      this.storageHandler.getStatus(),
      this.storageHandler.getSettings(),
      this.storageHandler.getPausedUntil(),
    ];

    return Promise.all(promises).then((results) => ({
      extensionStatus: results[0].status,
      extensionSettings: results[1].extensionSettings,
      pausedUntil: results[2].pausedUntil,
    }));
  }

  updateStatus(newStatus) {
    if (newStatus === extensionStatus.OFF) {
      return this.stop();
    }

    if (newStatus === extensionStatus.ON) {
      return this.start();
    }

    return Promise.reject(new Error(`Unknown status: ${newStatus}`));
  }

  addToBlockList(domain) {
    const domainToBlock = domain.replace(/.*www\./, '');

    return this.storageHandler.getBlockedWebsites().then(({ sites }) => {
      const updatedWebsites = [...sites, Website.create(domainToBlock)];

      return this.storageHandler.setBlockedWebsites(updatedWebsites);
    });
  }

  removeFromBlockList(domain) {
    const domainToRemove = domain.replace(/.*www\./, '');

    return this.storageHandler.getBlockedWebsites().then((storage) => {
      const updatedWebsites = storage.sites.filter(
        (website) => website.domain !== domainToRemove,
      );

      return this.storageHandler.setBlockedWebsites(updatedWebsites);
    });
  }

  updateSetting(key, value) {
    return this.storageHandler.updateSetting(key, value);
  }
}

export default ImpulseBlocker;

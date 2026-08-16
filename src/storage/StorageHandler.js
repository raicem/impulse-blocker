const StorageHandler = {
  getStatus: () => browser.storage.local.get('status'),

  setStatus: (status) => browser.storage.local.set({
    status,
  }),

  getSettings: () => browser.storage.local.get('extensionSettings'),

  getBlockedWebsites: () => browser.storage.local.get('sites'),

  setBlockedWebsites: (sites) => browser.storage.local.set({
    sites,
  }),

  setPausedUntil: (datetime) => browser.storage.local.set({
    pausedUntil: datetime.toISOString(),
  }),

  getPausedUntil: () => browser.storage.local.get('pausedUntil'),

  getPauseCount: () => browser.storage.local.get(['pauseCount', 'pauseCountDate']),

  setPauseCount: (count, date) => browser.storage.local.set({
    pauseCount: count,
    pauseCountDate: date,
  }),

  updateSetting: (key, value) => StorageHandler.getSettings().then((storage) => {
    const updatedSettings = storage.extensionSettings.filter(
      (setting) => setting.key !== key,
    );
    updatedSettings.push({ key, value });

    browser.storage.local.set({
      extensionSettings: updatedSettings,
    });

    return updatedSettings;
  }),
};

export default StorageHandler;

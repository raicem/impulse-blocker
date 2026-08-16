import storageHandler from '../StorageHandler';

global.browser = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

beforeEach(() => {
  global.browser.storage.local.get.mockClear();
  global.browser.storage.local.set.mockClear();
});

test('it can update extension settings', () => {
  const extensionSettings = [{ key: 'key1', value: 'value1' }];

  global.browser.storage.local.get = jest.fn().mockResolvedValue({ extensionSettings });

  return storageHandler.updateSetting('key2', 'value2').then((newSettings) => {
    const expectedNewSettings = [{ key: 'key1', value: 'value1' }, { key: 'key2', value: 'value2' }];
    expect(newSettings).toStrictEqual(expectedNewSettings);

    expect(global.browser.storage.local.set).toHaveBeenCalledTimes(1);
  });
});

test('it can read the daily pause count', () => {
  global.browser.storage.local.get = jest.fn().mockResolvedValue({
    pauseCount: 2,
    pauseCountDate: '2026-08-16',
  });

  return storageHandler.getPauseCount().then((result) => {
    expect(result).toStrictEqual({
      pauseCount: 2,
      pauseCountDate: '2026-08-16',
    });
    expect(global.browser.storage.local.get).toHaveBeenCalledWith(['pauseCount', 'pauseCountDate']);
  });
});

test('it can store the daily pause count', () => {
  global.browser.storage.local.set = jest.fn().mockResolvedValue(true);

  return storageHandler.setPauseCount(2, '2026-08-16').then(() => {
    expect(global.browser.storage.local.set).toHaveBeenCalledWith({
      pauseCount: 2,
      pauseCountDate: '2026-08-16',
    });
  });
});

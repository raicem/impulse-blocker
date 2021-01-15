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

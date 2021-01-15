import dayjs from 'dayjs';
import extensionStatus from '../enums/extensionStatus';
import ImpulseBlocker from '../ImpulseBlocker';
import storageHandler from '../storage/StorageHandler';
import Website from '../storage/Website';

jest.mock('../storage/StorageHandler');

global.browser = {
  storage: {
    onChanged: {
      addListener: jest.fn(),
    },
  },
  webRequest: {
    onBeforeRequest: {
      removeListener: jest.fn(),
      addListener: jest.fn(),
    },
  },
  browserAction: {
    setIcon: jest.fn(),
  },
};

beforeEach(() => {
  global.browser.storage.onChanged.addListener.mockClear();
  global.browser.webRequest.onBeforeRequest.removeListener.mockClear();
  global.browser.webRequest.onBeforeRequest.addListener.mockClear();
  global.browser.browserAction.setIcon.mockClear();
});

test('it boots with paused status', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.PAUSED });

  const fiveMinutesLater = dayjs().add(5, 'minutes');

  storageHandler.getPausedUntil = jest.fn().mockResolvedValue({ pausedUntil: fiveMinutesLater });

  const impulseBlocker = new ImpulseBlocker(storageHandler);
  impulseBlocker.pause = jest.fn();
  impulseBlocker.start = jest.fn();

  return impulseBlocker.boot().then(() => {
    expect(storageHandler.getStatus).toHaveBeenCalledTimes(1);
    expect(storageHandler.getPausedUntil).toHaveBeenCalledTimes(1);

    expect(impulseBlocker.pause).toHaveBeenCalledTimes(1);
    expect(impulseBlocker.start).toHaveBeenCalledTimes(0);
  });
});

test('it boots with blocker on when pausedUntil is expired', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.PAUSED });

  const fiveMinutesBefore = dayjs().subtract(5, 'minute');

  storageHandler.getPausedUntil = jest.fn().mockResolvedValue({ pausedUntil: fiveMinutesBefore });

  const impulseBlocker = new ImpulseBlocker(storageHandler);
  impulseBlocker.pause = jest.fn();
  impulseBlocker.start = jest.fn();

  return impulseBlocker.boot().then(() => {
    expect(storageHandler.getStatus).toHaveBeenCalledTimes(1);
    expect(storageHandler.getPausedUntil).toHaveBeenCalledTimes(1);

    expect(impulseBlocker.pause).toHaveBeenCalledTimes(0);
    expect(impulseBlocker.start).toHaveBeenCalledTimes(1);
  });
});

test('test blocker can be stopped', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.ON });
  storageHandler.setStatus = jest.fn().mockResolvedValue(true);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.stop().then(() => {
    expect(storageHandler.setStatus).toHaveBeenCalledTimes(1);
    expect(storageHandler.setStatus).toHaveBeenCalledWith(extensionStatus.OFF);

    expect(global.browser.webRequest.onBeforeRequest.removeListener).toHaveBeenCalledTimes(1);

    expect(global.browser.browserAction.setIcon).toHaveBeenCalledTimes(1);
    expect(global.browser.browserAction.setIcon).toHaveBeenCalledWith({ path: 'icons/icon96-disabled.png' });
  });
});

test('blocker can be started', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.OFF });
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: [Website.create('example.com')] });
  storageHandler.setStatus = jest.fn().mockResolvedValue(true);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.start().then(() => {
    expect(storageHandler.setStatus).toHaveBeenCalledTimes(1);
    expect(storageHandler.setStatus).toHaveBeenCalledWith(extensionStatus.ON);

    expect(global.browser.webRequest.onBeforeRequest.removeListener).toHaveBeenCalledTimes(1);
    expect(global.browser.webRequest.onBeforeRequest.addListener).toHaveBeenCalledTimes(1);

    expect(global.browser.browserAction.setIcon).toHaveBeenCalledTimes(1);
    expect(global.browser.browserAction.setIcon).toHaveBeenCalledWith({ path: 'icons/icon96.png' });
  });
});

test('it can check if domain is blocked or not', () => {
  const blockedDomain = 'example.com';
  const notBlockedDomain = 'test.com';
  storageHandler.getBlockedWebsites = jest.fn()
    .mockResolvedValue({ sites: [Website.create(blockedDomain)] });

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return Promise.all([
    impulseBlocker.isDomainBlocked(blockedDomain),
    impulseBlocker.isDomainBlocked(notBlockedDomain),
  ]).then((results) => {
    expect(results[0]).toBeTruthy();
    expect(results[1]).toBeFalsy();
  });
});

test('it can return the current state containing status, settings and paused until', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.ON });
  storageHandler.getSettings = jest.fn().mockResolvedValue({ extensionSettings: {} });
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: [] });

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.getState().then((result) => {
    expect(result.extensionStatus).toBe(extensionStatus.ON);
    expect(result.extensionSettings).toStrictEqual({});
  });
});

test('it can add new websites to the block list', () => {
  const currentBlockList = [Website.create('example.com')];

  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: currentBlockList });
  storageHandler.setBlockedWebsites = jest.fn().mockResolvedValue();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  const newWebsiteToBlock = 'www.example.com';

  return impulseBlocker.addToBlockList(newWebsiteToBlock).then(() => {
    expect(storageHandler.getBlockedWebsites).toHaveBeenCalledTimes(1);
    expect(storageHandler.setBlockedWebsites).toHaveBeenCalledTimes(1);
  });
});

test('it can remove websites from the block list', () => {
  const exampleCom = Website.create('example.com');
  const testCom = Website.create('test.com');

  const currentBlockList = [exampleCom, testCom];

  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: currentBlockList });
  storageHandler.setBlockedWebsites = jest.fn().mockResolvedValue();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  const websiteToRemove = 'www.example.com';

  return impulseBlocker.removeFromBlockList(websiteToRemove).then(() => {
    expect(storageHandler.getBlockedWebsites).toHaveBeenCalledTimes(1);

    expect(storageHandler.setBlockedWebsites).toHaveBeenCalledTimes(1);
    expect(storageHandler.setBlockedWebsites).toHaveBeenCalledWith([testCom]);
  });
});

test('it returns list of blocked domains', () => {
  const currentBlockList = [Website.create('example.com'), Website.create('test.com')];
  const currentBlockedDomains = currentBlockList.map((website) => website.domain);

  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: currentBlockList });

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.getBlockedDomains().then((domains) => {
    expect(domains).toStrictEqual(currentBlockedDomains);
  });
});

test('it can re-attach webrequest listener when blocked list is updated', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.ON });

  const impulseBlocker = new ImpulseBlocker(storageHandler);
  impulseBlocker.attachWebRequestListener = jest.fn();

  const changes = { sites: { oldValue: [], newValue: [Website.create('example.com')] } };

  return impulseBlocker.onStorageUpdated(changes).then(() => {
    expect(impulseBlocker.attachWebRequestListener).toHaveBeenCalledTimes(1);
  });
});

test('it does not re-attach listener when other storage items are updated', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.ON });

  const impulseBlocker = new ImpulseBlocker(storageHandler);
  impulseBlocker.attachWebRequestListener = jest.fn();

  const changes = { extensionSettings: { oldValue: 'test1', newValue: 'test2' } };

  return impulseBlocker.onStorageUpdated(changes).then(() => {
    expect(impulseBlocker.attachWebRequestListener).toHaveBeenCalledTimes(0);
  });
});

test('it does not reattach listener when status if not on', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.OFF });

  const impulseBlocker = new ImpulseBlocker(storageHandler);
  impulseBlocker.attachWebRequestListener = jest.fn();

  const changes = { sites: { oldValue: [], newValue: [Website.create('example.com')] } };

  return impulseBlocker.onStorageUpdated(changes).then(() => {
    expect(impulseBlocker.attachWebRequestListener).toHaveBeenCalledTimes(0);
  });
});

test('it can call storage handler update settings', () => {
  storageHandler.getSettings = jest.fn().mockResolvedValue([{ setting1: 'value' }]);
  storageHandler.updateSetting = jest.fn().mockResolvedValue();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.updateSetting('setting2', 'value2').then(() => {
    expect(storageHandler.updateSetting).toHaveBeenCalledTimes(1);
    expect(storageHandler.updateSetting).toHaveBeenLastCalledWith('setting2', 'value2');
  });
});

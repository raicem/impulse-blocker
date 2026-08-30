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
  tabs: {
    query: jest.fn().mockResolvedValue([]),
    reload: jest.fn(),
    update: jest.fn(),
  },
};

beforeEach(() => {
  jest.useRealTimers();
  global.browser.storage.onChanged.addListener.mockClear();
  global.browser.webRequest.onBeforeRequest.removeListener.mockClear();
  global.browser.webRequest.onBeforeRequest.addListener.mockClear();
  global.browser.browserAction.setIcon.mockClear();
  global.browser.tabs.query.mockClear();
  global.browser.tabs.reload.mockClear();
  global.browser.tabs.update.mockClear();
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
    expect(impulseBlocker.start).toHaveBeenCalledWith();
  });
});

test('it boots with blocker on when paused status has no pausedUntil', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.PAUSED });
  storageHandler.getPausedUntil = jest.fn().mockResolvedValue({});

  const impulseBlocker = new ImpulseBlocker(storageHandler);
  impulseBlocker.pause = jest.fn();
  impulseBlocker.start = jest.fn();

  return impulseBlocker.boot().then(() => {
    expect(storageHandler.getStatus).toHaveBeenCalledTimes(1);
    expect(storageHandler.getPausedUntil).toHaveBeenCalledTimes(1);

    expect(impulseBlocker.pause).toHaveBeenCalledTimes(0);
    expect(impulseBlocker.start).toHaveBeenCalledTimes(1);
    expect(impulseBlocker.start).toHaveBeenCalledWith();
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

test('blocker ignores malformed stored domains when attaching listener', () => {
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [
      Website.create('example.com'),
      Website.create('ftp://invalid.example.com'),
    ],
  });

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.attachWebRequestListener().then(() => {
    expect(global.browser.webRequest.onBeforeRequest.removeListener).toHaveBeenCalledTimes(1);
    expect(global.browser.webRequest.onBeforeRequest.addListener).toHaveBeenCalledTimes(1);
    expect(global.browser.webRequest.onBeforeRequest.addListener.mock.calls[0][1]).toStrictEqual({
      urls: ['*://*.example.com/*'],
      types: ['main_frame'],
    });
  });
});

test('refreshBlockedTabs reloads matching loaded tabs', () => {
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [Website.create('example.com')],
  });
  global.browser.tabs.query = jest.fn().mockResolvedValue([
    { id: 1, url: 'https://example.com/feed', discarded: false },
    { id: 2, url: 'https://unblocked.com/feed', discarded: false },
  ]);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.refreshBlockedTabs().then(() => {
    expect(global.browser.tabs.reload).toHaveBeenCalledTimes(1);
    expect(global.browser.tabs.reload).toHaveBeenCalledWith(1);
  });
});

test('refreshBlockedTabs does not reload matching discarded tabs', () => {
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [Website.create('example.com')],
  });
  global.browser.tabs.query = jest.fn().mockResolvedValue([
    { id: 1, url: 'https://example.com/feed', discarded: true },
  ]);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.refreshBlockedTabs().then(() => {
    expect(global.browser.tabs.reload).toHaveBeenCalledTimes(0);
  });
});

test('enableBlockedTabs updates matching loaded redirect tabs', () => {
  global.browser.tabs.query = jest.fn().mockResolvedValue([
    {
      id: 1,
      url: 'moz-extension://abc/resources/redirect.html?target=https%3A%2F%2Fexample.com%2Ffeed',
      discarded: false,
    },
    {
      id: 2,
      url: 'https://example.com/feed',
      discarded: false,
    },
  ]);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.enableBlockedTabs().then(() => {
    expect(global.browser.tabs.update).toHaveBeenCalledTimes(1);
    expect(global.browser.tabs.update).toHaveBeenCalledWith(1, {
      loadReplace: true,
      url: 'https://example.com/feed',
    });
  });
});

test('enableBlockedTabs does not update matching discarded redirect tabs', () => {
  global.browser.tabs.query = jest.fn().mockResolvedValue([
    {
      id: 1,
      url: 'moz-extension://abc/resources/redirect.html?target=https%3A%2F%2Fexample.com%2Ffeed',
      discarded: true,
    },
  ]);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.enableBlockedTabs().then(() => {
    expect(global.browser.tabs.update).toHaveBeenCalledTimes(0);
  });
});

test('stopping blocker clears pending pause timeout', () => {
  jest.useFakeTimers();

  storageHandler.setStatus = jest.fn().mockResolvedValue(true);
  storageHandler.setPausedUntil = jest.fn().mockResolvedValue(true);
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({
    pauseCount: 0,
    pauseCountDate: dayjs().format('YYYY-MM-DD'),
  });
  storageHandler.setPauseCount = jest.fn().mockResolvedValue(true);

  const blocker = new ImpulseBlocker(storageHandler);
  blocker.start = jest.fn();

  return blocker.pause(60).then(() => blocker.stop()).then(() => {
    jest.advanceTimersByTime(60 * 1000);

    expect(blocker.start).toHaveBeenCalledTimes(0);
    jest.useRealTimers();
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

test('it recognizes legacy url-shaped domains as blocked', () => {
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [Website.create('https://WWW.Example.com/articles')],
  });

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return expect(impulseBlocker.isDomainBlocked('example.com')).resolves.toBe(true);
});

test('it can return the current state containing status, settings and paused until', () => {
  storageHandler.getStatus = jest.fn().mockResolvedValue({ status: extensionStatus.ON });
  storageHandler.getSettings = jest.fn().mockResolvedValue({ extensionSettings: {} });
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: [] });
  storageHandler.getPausedUntil = jest.fn().mockResolvedValue({ pausedUntil: null });
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({
    pauseCount: 2,
    pauseCountDate: dayjs().format('YYYY-MM-DD'),
  });

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.getState().then((result) => {
    expect(result.extensionStatus).toBe(extensionStatus.ON);
    expect(result.extensionSettings).toStrictEqual({});
    expect(result.pausedUntil).toBe(null);
    expect(result.pauseCount).toBe(2);
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

test('it normalizes urls before adding them to the block list', () => {
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({ sites: [] });
  storageHandler.setBlockedWebsites = jest.fn().mockResolvedValue();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.addToBlockList('https://www.example.com:8080/articles').then((domain) => {
    expect(domain).toBe('example.com');
    expect(storageHandler.setBlockedWebsites).toHaveBeenCalledWith([
      expect.objectContaining({ domain: 'example.com' }),
    ]);
  });
});

test('it rejects non-http urls before adding them to the block list', () => {
  storageHandler.getBlockedWebsites = jest.fn();
  storageHandler.setBlockedWebsites = jest.fn();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return expect(impulseBlocker.addToBlockList('ftp://example.com')).rejects.toThrow().then(() => {
    expect(storageHandler.getBlockedWebsites).toHaveBeenCalledTimes(0);
    expect(storageHandler.setBlockedWebsites).toHaveBeenCalledTimes(0);
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

test('it can remove legacy url-shaped domains from the block list', () => {
  const legacyEntry = Website.create('https://WWW.Example.com/articles');
  const testCom = Website.create('test.com');

  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [legacyEntry, testCom],
  });
  storageHandler.setBlockedWebsites = jest.fn().mockResolvedValue();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.removeFromBlockList('example.com').then(() => {
    expect(storageHandler.setBlockedWebsites).toHaveBeenCalledWith([testCom]);
  });
});

test('it can remove malformed domains saved by older versions', () => {
  const malformedEntry = Website.create('ftp://example.com');
  const testCom = Website.create('test.com');

  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [malformedEntry, testCom],
  });
  storageHandler.setBlockedWebsites = jest.fn().mockResolvedValue();

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return impulseBlocker.removeFromBlockList('ftp://example.com').then(() => {
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

test('it returns a unique normalized list of stored domains', () => {
  storageHandler.getBlockedWebsites = jest.fn().mockResolvedValue({
    sites: [
      Website.create('example.com'),
      Website.create('https://WWW.Example.com/articles'),
      Website.create('ftp://legacy.example.com'),
    ],
  });

  const impulseBlocker = new ImpulseBlocker(storageHandler);

  return expect(impulseBlocker.getBlockedDomains()).resolves.toStrictEqual([
    'example.com',
    'ftp://legacy.example.com',
  ]);
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

test('pausing increments the daily pause count', () => {
  jest.useFakeTimers();

  storageHandler.setStatus = jest.fn().mockResolvedValue(true);
  storageHandler.setPausedUntil = jest.fn().mockResolvedValue(true);
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({
    pauseCount: 1,
    pauseCountDate: dayjs().format('YYYY-MM-DD'),
  });
  storageHandler.setPauseCount = jest.fn().mockResolvedValue(true);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.pause(60).then(() => {
    expect(storageHandler.setPauseCount).toHaveBeenCalledWith(2, dayjs().format('YYYY-MM-DD'));
    blocker.stop();
    jest.useRealTimers();
  });
});

test('pausing during boot recovery does not increment the daily pause count', () => {
  jest.useFakeTimers();

  storageHandler.setPausedUntil = jest.fn().mockResolvedValue(true);
  storageHandler.getPauseCount = jest.fn();
  storageHandler.setPauseCount = jest.fn();

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.pause(60, false).then(() => {
    expect(storageHandler.getPauseCount).not.toHaveBeenCalled();
    expect(storageHandler.setPauseCount).not.toHaveBeenCalled();
    blocker.stop();
    jest.useRealTimers();
  });
});

test('getTodaysPauseCount returns the stored count for today', () => {
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({
    pauseCount: 5,
    pauseCountDate: dayjs().format('YYYY-MM-DD'),
  });

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.getTodaysPauseCount().then((count) => {
    expect(count).toBe(5);
  });
});

test('getTodaysPauseCount returns 0 when the stored date is not today', () => {
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({
    pauseCount: 5,
    pauseCountDate: '2020-01-01',
  });

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.getTodaysPauseCount().then((count) => {
    expect(count).toBe(0);
  });
});

test('getTodaysPauseCount returns 0 when no count is stored', () => {
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({});

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.getTodaysPauseCount().then((count) => {
    expect(count).toBe(0);
  });
});

test('incrementTodaysPauseCount resets the count when the stored date is not today', () => {
  storageHandler.getPauseCount = jest.fn().mockResolvedValue({
    pauseCount: 5,
    pauseCountDate: '2020-01-01',
  });
  storageHandler.setPauseCount = jest.fn().mockResolvedValue(true);

  const blocker = new ImpulseBlocker(storageHandler);

  return blocker.incrementTodaysPauseCount().then(() => {
    expect(storageHandler.setPauseCount).toHaveBeenCalledWith(1, dayjs().format('YYYY-MM-DD'));
  });
});

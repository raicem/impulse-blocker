import getCurrentWebsiteDomain from '../tabs';

global.browser = {
  runtime: { getURL: (path) => `moz-extension://abc/${path}` },
  tabs: {
    query: jest.fn().mockResolvedValue(),
  },
};

test('it gets the domain of currently open website domain', () => {
  const currentWebsiteDomain = 'https://example.com';
  const currentWebsiteDomainWithoutProtocol = 'example.com';

  const mockedResult = { active: true, url: currentWebsiteDomain, attention: true };

  const tabsQuery = jest.fn().mockResolvedValue([mockedResult]);

  global.browser.tabs.query = tabsQuery;

  return getCurrentWebsiteDomain().then((domain) => {
    expect(global.browser.tabs.query).toHaveBeenCalledTimes(1);

    expect(domain).toBe(currentWebsiteDomainWithoutProtocol);
  });
});

test('it gets the original domain from its own blocked page', async () => {
  global.browser.tabs.query.mockResolvedValue([{
    url: 'moz-extension://abc/resources/redirect.html?target=https%3A%2F%2Fmusic.youtube.com%2F',
  }]);
  expect(await getCurrentWebsiteDomain()).toBe('music.youtube.com');
});

test.each([
  'moz-extension://other/resources/redirect.html?target=https%3A%2F%2Fyoutube.com',
  'moz-extension://abc/resources/redirect.html?target=invalid',
  'about:blank',
])('it ignores unsupported active tabs: %s', async (url) => {
  global.browser.tabs.query.mockResolvedValue([{ url }]);
  expect(await getCurrentWebsiteDomain()).toBe(false);
});

test('it handles an empty active tab list', async () => {
  global.browser.tabs.query.mockResolvedValue([]);
  expect(await getCurrentWebsiteDomain()).toBe(false);
});

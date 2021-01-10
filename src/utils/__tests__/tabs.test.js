import getCurrentWebsiteDomain from '../tabs';

global.browser = {
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

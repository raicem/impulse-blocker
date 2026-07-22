import Website from '../../storage/Website';
import { createMatchPatterns, redirectToBlockedPage } from '../functions';

test('it redirects blocked requests to the extension page', () => {
  global.window = {
    matchMedia: jest.fn().mockReturnValue({ matches: false }),
  };
  global.browser = {
    runtime: {
      getURL: jest.fn((path) => `moz-extension://impulse-blocker${path}`),
    },
  };

  const response = redirectToBlockedPage({
    tabId: 42,
    url: 'https://example.com/path?query=value',
  });

  expect(response).toStrictEqual({
    redirectUrl: 'moz-extension://impulse-blocker/resources/redirect.html?target=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue&theme=light',
  });
});

test('it creates match patterns for site urls', () => {
  const websites = [Website.create('test.example.com'), Website.create('example.com')];

  const websitesAsMatchPatterns = createMatchPatterns(websites);
  expect(websitesAsMatchPatterns[0]).toBe('*://*.test.example.com/*');
  expect(websitesAsMatchPatterns[1]).toBe('*://*.example.com/*');
});

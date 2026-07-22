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
    method: 'GET',
    tabId: 42,
    url: 'https://example.com/path?query=value',
  });

  expect(response).toStrictEqual({
    redirectUrl: 'moz-extension://impulse-blocker/resources/redirect.html?target=https%3A%2F%2Fexample.com%2Fpath%3Fquery%3Dvalue&theme=light',
  });
});

test.each(['POST', 'PUT', 'PATCH'])('it allows %s requests to blocked sites', (method) => {
  global.browser = {
    runtime: {
      getURL: jest.fn(),
    },
  };

  const response = redirectToBlockedPage({
    method,
    tabId: 42,
    url: 'https://example.com/submit',
  });

  expect(response).toStrictEqual({});
  expect(global.browser.runtime.getURL).not.toHaveBeenCalled();
});

test('it creates match patterns for site urls', () => {
  const websites = [Website.create('test.example.com'), Website.create('example.com')];

  const websitesAsMatchPatterns = createMatchPatterns(websites);
  expect(websitesAsMatchPatterns[0]).toBe('*://*.test.example.com/*');
  expect(websitesAsMatchPatterns[1]).toBe('*://*.example.com/*');
});

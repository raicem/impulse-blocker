export function openOptionsPage() {
  browser.runtime.openOptionsPage();
  window.close();
}

export function redirectToBlockedPage(requestDetails) {
  const original = encodeURIComponent(requestDetails.url);
  const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const interceptPage = `/resources/redirect.html?target=${original}&theme=${theme}`;

  browser.tabs.update(requestDetails.tabId, { url: interceptPage });
}

export function createMatchPatterns(sites) {
  return sites.map((site) => `*://*.${site.domain}/*`);
}

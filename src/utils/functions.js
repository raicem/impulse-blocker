export function openOptionsPage() {
  browser.runtime.openOptionsPage();
  window.close();
}

export function redirectToBlockedPage(requestDetails) {
  const original = encodeURIComponent(requestDetails.url);
  const theme = requestDetails.incognito ? 'dark' : 'light';

  const interceptPage = `/resources/redirect.html?target=${original}&theme=${theme}`;

  browser.tabs.update(requestDetails.tabId, { url: interceptPage });
}

export function backgroundResponse(value) {
  return new Promise(res => res(value));
}

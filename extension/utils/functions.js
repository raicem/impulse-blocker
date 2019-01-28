export function openOptionsPage() {
  browser.runtime.openOptionsPage();
  window.close();
}

export function redirectToBlockedPage(requestDetails) {
  const original = encodeURIComponent(requestDetails.url);
  const interceptPage = `/resources/redirect.html?target=${original}`;
  browser.tabs.update(requestDetails.tabId, { url: interceptPage });
}

import { getBlockedPageTarget } from './functions';

function getActiveTab() {
  return browser.tabs.query({
    active: true,
    currentWindow: true,
  });
}

function parse(url) {
  try {
    const domain = new URL(getBlockedPageTarget(url) || url);

    // dont show the button for non-http pages
    if (['http:', 'https:'].indexOf(domain.protocol) === -1) {
      throw new Error('URLS with non-http protocols are not supported.');
    }

    return domain.hostname.replace(/^www\./, '').replace(/\.$/, '').toLowerCase();
  } catch (e) {
    return false;
  }
}

export default function getCurrentWebsiteDomain() {
  return getActiveTab().then((tabs) => {
    const activeTab = tabs[0];

    return activeTab ? parse(activeTab.url) : false;
  });
}

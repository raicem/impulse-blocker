/**
 * @typedef {Object} TogglConfig
 * @property {boolean} enabled
 * @property {string} token
 * @property {string[]} breakTags
 */
import StorageHandler from "../storage/StorageHandler";

export function openOptionsPage() {
  browser.runtime.openOptionsPage();
  window.close();
}

export async function redirectToBlockedPage(requestDetails) {
  const original = encodeURIComponent(requestDetails.url);
  const interceptPage = `/resources/redirect.html?target=${original}`;

  const togglConfig = await StorageHandler.getTogglConfig();
  if (togglConfig.enabled && await isOnBreak(togglConfig)) {
    return;
  }

  browser.tabs.update(requestDetails.tabId, { url: interceptPage });
}

export function backgroundResponse(value) {
  return new Promise(res => res(value));
}

/**
 * @param togglConfig {TogglConfig}
 * @returns {Promise<boolean>}
 */
async function isOnBreak(togglConfig) {
  const endpoint = 'https://www.toggl.com/api/v8/time_entries/current';
  const auth = `Basic ${btoa(`${togglConfig.token}:api_token`)}`;

  const response = await fetch(endpoint, {
    headers: new Headers({
      Authorization: auth
    })
  });
  if (!response.ok) return false;

  const body = await response.json();
  if (!body.data) return false;
  if (!(body.data.tags instanceof Array)) return false;

  const breakTags = new Set(togglConfig.breakTags);
  return body.data.tags.some(tag => breakTags.has(tag));
}

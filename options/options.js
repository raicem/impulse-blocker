const blockedSites = document.querySelector('ul.blocked-sites');
const form = document.querySelector('form');
const getSites = browser.storage.local.get('sites');
const settingsArea = document.getElementById('settings-area');
const importButton = document.getElementById('import-settings');
const exportButton = document.getElementById('export-settings');

function addToBlockedList(text) {
  const button = document.createElement('button');
  button.textContent = 'Delete';

  const listItem = document.createElement('li');
  listItem.textContent = text;
  listItem.appendChild(button);

  blockedSites.appendChild(listItem);
}

function hasNoProtocol(url) {
  const regex = /^[a-zA-Z]{3,}:\/\//;
  return !regex.test(url);
}

function hasNoExtension(url) {
  const regex = /(\w+\.\w+)$/;
  return !regex.test(url);
}

function normalizeUrl(url) {
  let urlToAdd = url.replace(/^www\./, '');

  if (hasNoProtocol(urlToAdd)) {
    urlToAdd = `http://${urlToAdd}`;
  }

  if (hasNoExtension(urlToAdd)) {
    urlToAdd += '.com';
  }

  return new URL(urlToAdd);
}

function restoreOptions() {
  getSites.then((storage) => {
    storage.sites.forEach((site) => {
      addToBlockedList(site);
    });
  });
}

function saveSite(event) {
  event.preventDefault();
  const url = normalizeUrl(form.site.value);
  addToBlockedList(url.hostname);
  form.site.value = '';

  getSites.then((storage) => {
    storage.sites.push(url.hostname);
    browser.storage.local.set({
      sites: storage.sites,
    });
  });
}

function deleteSite(event) {
  if (event.target.nodeName === 'BUTTON') {
    const toDelete = event.target.parentElement;
    const toDeleteParent = toDelete.parentElement;
    const toDeleteText = event.target.previousSibling.textContent;
    toDeleteParent.removeChild(toDelete);

    getSites.then((storage) => {
      const i = storage.sites.indexOf(toDeleteText);
      if (i !== -1) {
        storage.sites.splice(i, 1);
      }
      browser.storage.local.set({
        sites: storage.sites,
      });
    });
  }
}

function loadv1settings(data) {
  if (!Array.isArray(data.sites)) {
    settingsArea.value = 'Error loading settings: corrupted data! (E11)';
    return;
  }
  data.sites.forEach((s) => {
    if (typeof(s) != 'string') {
      settingsArea.value = 'Error loading settings: corrupted data! (E12)';
      return;
    }
  });
  browser.storage.local.set({
    sites: data.sites,
  }).then((_) => {
    settingsArea.value = 'Settings successfully loaded!';
    // TODO: this should probably be done properly by recreating the list on storage change.
    location.reload();
  });
}

function importSettings(event) {
  try {
    var data = JSON.parse(settingsArea.value);
  } catch (e) {
    settingsArea.value = 'Error loading settings: corrupted data! (E01)';
    return;
  }
  switch (data.version) {
    case 1:
      loadv1settings(data);
      break;
    default:
      settingsArea.value = 'Error loading settings: incompatible with current version (E02)';
      break;
  }
}

function exportSettings(event) {
  getSites.then((storage) => {
    var data = {
      'version': 1,
      'sites': storage.sites
    }
    settingsArea.value = JSON.stringify(data);
  });
}

form.addEventListener('submit', saveSite);
blockedSites.addEventListener('click', deleteSite);
importButton.addEventListener('click', importSettings);
exportButton.addEventListener('click', exportSettings);
document.addEventListener('DOMContentLoaded', restoreOptions);

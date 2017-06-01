const blockedSites = document.querySelector('ul.blocked-sites');
const form = document.querySelector('form');
const getSites = browser.storage.local.get('sites');

function addToBlockedList(text) {
  const listItem = `<li>${text}<button>Delete</button></li>`;
  blockedSites.innerHTML += listItem;
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

form.addEventListener('submit', saveSite);
blockedSites.addEventListener('click', deleteSite);
document.addEventListener('DOMContentLoaded', restoreOptions);

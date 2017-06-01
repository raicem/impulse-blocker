const radioOff = document.querySelector('input#off');
const radioOn = document.querySelector('input#on');
const addButton = document.querySelector('button.button-add');
const removeButton = document.querySelector('button.button-remove');
const domain = document.querySelector('span.domain');
const getBackgroundPage = browser.runtime.getBackgroundPage();

function handleClick() {
  if (this.value === 'off') {
    getBackgroundPage.then(bg => bg.disableBlocker());
  } else {
    getBackgroundPage.then(bg => bg.setBlocker());
  }
}

function markExtensionStatus() {
  getBackgroundPage.then((bg) => {
    const status = bg.getStatus();
    if (status === 'off') {
      radioOff.checked = true;
    } else if (status === 'on') {
      radioOn.checked = true;
    }
  });
}

function displayCurrentDomain() {
  getBackgroundPage.then((bg) => {
    let url;
    bg.getDomain()
      .then((tabs) => {
        url = new URL(tabs[0].url);
        if (url.protocol === 'moz-extension:') return false;
        const urlToMatch = url.hostname.replace(/^www\./, '');
        domain.innerHTML = urlToMatch;

        bg.getSites().then((storage) => {
          if (storage.sites.includes(urlToMatch)) {
            removeButton.style.display = 'block';
            addButton.style.display = 'none';
          } else {
            addButton.style.display = 'block';
            removeButton.style.display = 'none';
          }
        });
      });
  });
}

function refreshToolbar() {
  markExtensionStatus();
  displayCurrentDomain();
}

function addWebsite() {
  getBackgroundPage.then((bg) => {
    bg.addCurrentlyActiveSite().then(() => {
      refreshToolbar();
    });
  });
}

function removeWebsite() {
  getBackgroundPage.then((bg) => {
    bg.removeCurrentlyActiveSite().then(() => {
      refreshToolbar();
    });
  });
}

radioOff.addEventListener('click', handleClick);
radioOn.addEventListener('click', handleClick);
addButton.addEventListener('click', addWebsite);
removeButton.addEventListener('click', removeWebsite);

refreshToolbar();

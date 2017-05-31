const radioOff = document.querySelector('input#off');
const radioOn = document.querySelector('input#on');
const addButton = document.querySelector('button.add-site-button');
const removeButton = document.querySelector('button.remove-site-button');
const domain = document.querySelector('p.domain');

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
        const urlToMatch = `*://*.${url.hostname}/*`;

        domain.innerHTML = url.hostname;
        bg.getSites().then((storage) => {
          const sites = storage.sites.map(item => `*://*.${item}/*`);

          if (sites.includes(urlToMatch)) {
            document.querySelector('.remove-site').style.display = 'block';
          } else {
            document.querySelector('.add-site').style.display = 'block';
          }
        });
      });
  });
}

function removeSiteBlockingButtons() {
  document.querySelector('.remove-site').style.display = 'none';
  document.querySelector('.add-site').style.display = 'none';
}

function refreshToolbar() {
  markExtensionStatus();
  removeSiteBlockingButtons();
  displayCurrentDomain();
}

function addWebsite() {
  getBackgroundPage.then((bg) => {
    bg.addThisSite().then(() => {
      refreshToolbar();
    });
  });
}

function removeWebsite() {
  getBackgroundPage.then((bg) => {
    bg.removeThisSite().then(() => {
      refreshToolbar();
    });
  });
}

radioOff.addEventListener('click', handleClick);
radioOn.addEventListener('click', handleClick);
addButton.addEventListener('click', addWebsite);
removeButton.addEventListener('click', removeWebsite);

refreshToolbar();

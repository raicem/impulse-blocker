const radioOff = document.querySelector('input#off');
const radioOn = document.querySelector('input#on');

// this returns a promise
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

radioOff.addEventListener('click', handleClick);
radioOn.addEventListener('click', handleClick);

markExtensionStatus();

let form = document.querySelector('form');
let radioOff = document.querySelector('input#off');
let radioOn = document.querySelector('input#on');

// this returns a promise
let getBackgroundPage = browser.runtime.getBackgroundPage();

radioOff.addEventListener('click', handleClick);
radioOn.addEventListener('click', handleClick);

markExtensionStatus();

function handleClick() {
  if (this.value === 'off') {
    getBackgroundPage.then(bg => bg.disableBlocker());
  } else {
    getBackgroundPage.then(bg => bg.setBlocker());
  }
}

function markExtensionStatus() {
  getBackgroundPage.then(bg => {
    let status = bg.getStatus();
    if (status === 'off') {
      radioOff.checked = true;
    } else if (status === 'on') {
      radioOn.checked = true;
    }
  });
}

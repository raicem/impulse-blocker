var form = document.querySelector('form');
var div = document.querySelector('.deneme');
var radioOff = document.querySelector('input#off');
var radioOn = document.querySelector('input#on');

// this returns a promise
var getBackgroundPage = browser.runtime.getBackgroundPage();

radioOff.addEventListener('click', handleClick);
radioOn.addEventListener('click', handleClick);

markExtensionStatus();

function handleClick() {
    console.log('Status:' + this.value);
    if (this.value === 'off') {
        getBackgroundPage.then(function(bg) {
            bg.disableBlocker();
        });
    } else {
        getBackgroundPage.then(function(bg) {
            bg.setBlocker();
        })
    }
}

function markExtensionStatus() {
    getBackgroundPage.then(function(bg) {
        var status = bg.getStatus();
        if (status === 'off') {
            radioOff.checked = true;
        } else if (status === 'on') {
            radioOn.checked = true;            
        }
    })
}

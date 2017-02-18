var extStatus = 'on';
// in the future should be directed to a custom page
function redirect() {
    browser.tabs.update({url: "/resources/redirect.html"});
}

function getStatus() {
  return extStatus;
}

function setBlocker() {
  browser.storage.local.get('sites').then(function(storage) {
    var pattern = storage.sites.map(function(item) {
      return "*://*." + item  + "/*";;
    });

    console.log(pattern); 

    browser.webRequest.onBeforeRequest.removeListener(redirect);
    browser.webRequest.onBeforeRequest.addListener(
      redirect, 
      {urls: pattern, types: ["main_frame"]},
      ["blocking"]
    );
  });

  extStatus = 'on';
}

function disableBlocker() {
    browser.webRequest.onBeforeRequest.removeListener(redirect);
    extStatus = 'off';
}

// initial run
setBlocker();

// then refresh the blocked websites if storage is updated
browser.storage.onChanged.addListener(setBlocker);


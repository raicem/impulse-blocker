var blockedSites = document.querySelector("ul.blocked-sites");
var form = document.querySelector("form");
var getSites = browser.storage.local.get('sites');

form.addEventListener("submit", saveSite);
blockedSites.addEventListener("click", deleteSite);
document.addEventListener("DOMContentLoaded", restoreOptions);

function restoreOptions() {
    getSites.then(storage => {
        storage.sites.forEach(function(site) {
            addToBlockedList(site);
        });
    })
}

function saveSite(event) {
    event.preventDefault();
    var url = normalizeUrl(form.site.value);
    addToBlockedList(url.hostname);
    form.site.value = "";

    getSites.then(storage => {    
        storage.sites.push(url.hostname);
        browser.storage.local.set({
            sites: storage.sites
        });
        
    });
}

function addToBlockedList(text) {
    var listItem = `<li>${text}<button>Sil</button></li>`;
    blockedSites.innerHTML = blockedSites.innerHTML + listItem; 
}

function normalizeUrl(url) {
    if (hasNoProtocol(url)) {
        url = "http://" + url;
    };

    if (hasNoExtension(url)) {
        url = url + ".com";
    };

    return new URL(url);
}

function hasNoProtocol(url) {
    var regex = /^[a-zA-Z]{3,}:\/\//;
    return ! regex.test(url);
}

function hasNoExtension(url) {
    var regex = /(\w+\.\w+)$/;
    return ! regex.test(url);
}


function deleteSite(event) {
    if (event.target.nodeName === "BUTTON") {
        var toDelete = event.target.parentElement;
        var toDeleteParent = toDelete.parentElement;
        var toDeleteText = event.target.previousSibling.textContent;
        toDeleteParent.removeChild(toDelete);

        getSites.then(storage => {
            var i = storage.sites.indexOf(toDeleteText);
            if (i != -1) {
                storage.sites.splice(i, 1);
            }
            browser.storage.local.set({
                sites: storage.sites
            })
        });
    }
}


var blockedSites = document.querySelector("ul.blocked-sites");
var form = document.querySelector("form");

form.addEventListener("submit", saveSite);
blockedSites.addEventListener("click", deleteSite);
document.addEventListener("DOMContentLoaded", restoreOptions);

function restoreOptions() {
    storage = browser.storage.local.get('sites').then(function(storage) {
        console.log(storage.sites);
        storage.sites.forEach(function(element) {
            var listItem = createListItem(element);
            blockedSites.appendChild(listItem);
        });
    }).catch(function() {
        browser.storage.local.set({
            sites: []
        })
    });
}

function saveSite(event) {
    event.preventDefault();
    var url = normalizeUrl(form.site.value);
    storage = browser.storage.local.get('sites').then(function(storage) {
        var listItem = createListItem(url.hostname);
        blockedSites.appendChild(listItem);
        storage.sites.push(url.hostname);
        console.log(storage.sites);
        browser.storage.local.set({
            sites: storage.sites
        });
        form.site.value = "";
    });
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
    if (url.match(regex)) {
        return false;
    };
    return true;
}

function hasNoExtension(url) {
    var regex = /(\w+\.\w+)$/;
    if (url.match(regex)) {
        return false;
    }
    return true;
}


function deleteSite(event) {
    if (event.target.nodeName === "BUTTON") {
        var toDelete = event.target.parentElement;
        var toDeleteParent = toDelete.parentElement;
        var toDeleteText = event.target.previousSibling.textContent;
        toDeleteParent.removeChild(toDelete);

        storage = browser.storage.local.get('sites').then(function(storage) {
            var i = storage.sites.indexOf(toDeleteText);
            if (i != -1) {
                storage.sites.splice(i, 1);
            }
            console.log(storage.sites);
            browser.storage.local.set({
                sites: storage.sites
            })
        });
    }
}

function createListItem(text) {
    var li = document.createElement("li");
    var text = document.createTextNode(text);
    var deleteButton = document.createElement("button");
    var buttonText = document.createTextNode("Sil");
    deleteButton.appendChild(buttonText);
    li.appendChild(text);
    li.appendChild(deleteButton);
    return li;
}
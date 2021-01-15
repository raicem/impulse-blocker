# Impulse Blocker

Block distracting websites when you are browsing the web. Written using [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) so it will be compatible with the future releases of Firefox.

## Installation and Usage

If you want to install and use the extension please head over to [here](https://addons.mozilla.org/en-US/firefox/addon/impulse-blocker/).

Simple usage guide can be found [here](https://blog.cemunalan.com.tr/2017/05/17/impulse-blocker-guide/).

## Building

If you want to build the extension yourself using the source code, follow these steps.

### Dependencies

Make sure you have `node` (version 11) and `npm` (version 6) installed on your machine.

Then clone this repository:

```bash
git clone https://github.com/raicem/impulse-blocker.git
```

Then install the dependencies using `npm`

```bash
npm install
```

If you want to build it to sideload the extension without using the Mozilla's [AMO](https://addons.mozilla.org) use this command.

```
npm run release
```

This will create a zip file in the `web-ext-artifacts` folder. This file contains everything the Firefox needs to run the extension. You can install it following instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/Distribution) and [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Distribution_options/Sideloading_add-ons).

Again just a reminder, you can install the extension from the official [add-ons page](https://addons.mozilla.org/en-US/firefox/addon/impulse-blocker/). Simple usage instructions are [here](https://blog.cemunalan.com.tr/2017/05/17/impulse-blocker-guide/).

## Contributing

The extension is open for any kinds of contribution. Please note that it requires a basic knowledge about [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons) and [React](https://reactjs.org/).

After following the steps explained in the Building section above, all you have to do is run these commands in parallel.

`npm run watch` will start the Webpack watcher. This will immediately build the extension and create files to be loaded into the Firefox.

`npm run browser` will load the built files into the isolated Firefox instance and you will be able to see the changes you make immediately.

## Testing

Make sure you run through these steps to make sure the extension works.

Impulse Blocker testing

### Starting and stopping

-[] Start the blocker with no blocked websites. It should not interfere.
-[] Start blocking a website. It should be blocked.
-[] Add a second website to the block list. It should also be blocked.
-[] Stop the blocker. Websites should now be free to access.
-[] Start the blocker again. See the websites are blocked again.

### Pausing

-[] Pause the blocker. Websites should be free to access.
-[] Cancel the pause. Websites should be blocked.
-[] Pause the blocker again and restart the browser. It should still be paused.
-[] Close the browser again and wait for pause period to finish. When you open the browser it should not be in pause state and websites must be blocked.
-[] Add a website when the blocker is paused. It should still be paused.

### Options page

-[] Add website from the options page. It should be blocked.
-[] Remove website from the options page. It should be now accessible.
-[] Stop extension from the options page. It should stop the blocker.
-[] Start the extension from the options page. It should start the blocker.
-[] Tick and check options and check they have the desired effect on the popup.

## Contributors

Huge thanks to contributors!

@Crotek
@pkonneker
@Thynix
@xeBuz
@Mattwmaster58

[Crote](https://github.com/Crotek)
[pkonneker](https://github.com/pkonneker)

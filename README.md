# Impulse Blocker

Block distracting websites when you are browsing the web. Written using [WebExtensions](https://developer.mozilla.org/en-US/Add-ons/WebExtensions) so it will be compatible with the future releases of Firefox.

## Installation and Usage

If you want to install and use the extension please head over to [here](https://addons.mozilla.org/en-US/firefox/addon/impulse-blocker/).

Simple usage guide can be found [here](https://blog.cemunalan.com.tr/2017/05/17/impulse-blocker-guide/).

## Building

If you want to build the extension yourself using the source code, follow these steps.

### Dependencies

Make sure you have `node` and `npm` installed on your machine.
After you make sure you have `npm` install `web-ext`. `web-ext` [is a tool](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext) released by Mozilla to help developing WebExtensions.

Install `web-ext` using this command:

```bash
npm install --global web-ext
```

Then clone this repository:

```bash
git clone https://github.com/raicem/impulse-blocker.git
```

Then install the dependencies using `npm`

```
npm install
```

You can now temprarily install the extension to your Firefox browser. Insturctions are [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#Installing).

If you want to build it to sideload the extension without using the Mozilla's [AMO](https://addons.mozilla.org) use this command.

```
npm run release
```

This will create a zip file on the `web-ext-artifacts` folder. This file contains everyting the Firefox needs to run the extenison. You can install it following instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/Distribution) and [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Distribution_options/Sideloading_add-ons).

Again just a reminder, you can install the extension from the official [add-ons page](https://addons.mozilla.org/en-US/firefox/addon/impulse-blocker/). Simple usage instructions are [here](https://blog.cemunalan.com.tr/2017/05/17/impulse-blocker-guide/).

## Contributing

The extenison is open for any kinds of contribution. Please note that it requires a basic knowledge about [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons) and [React](https://reactjs.org/).

After following the steps explained in the Building section above, all you have to do is run these commands in parallel.

`npm run watch` will start the Webpack watcher. This will immediately build the extension and create files to be loaded into the Firefox.

`npm run browser` will load the built files into the isolated Firefox instance and you will be able to see the changes you make immediately.

## Contributors

Many to thanks to [Crote](https://github.com/Crotek) and [pkonneker](https://github.com/pkonneker) for their contributions.

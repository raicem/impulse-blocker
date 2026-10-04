const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');

const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const projectRoot = path.resolve(__dirname, '..');
const extensionPath = path.join(projectRoot, 'extension');
const resultsPath = path.join(projectRoot, 'test-results', 'e2e-firefox');
const timeout = 10000;

function startTestServer() {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end('<!doctype html><title>Local test page</title><h1 id="loaded">Local test page</h1>');
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        server,
        url: `http://localhost:${port}/blocked`,
      });
    });
  });
}

function closeServer(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

async function getOptionsUrl(driver, addonId) {
  await driver.setContext(firefox.Context.CHROME);

  try {
    return await driver.executeScript((id) => {
      const policy = WebExtensionPolicy.getByID(id);
      if (!policy) {
        return { error: `No active WebExtension policy found for ${id}` };
      }

      return policy.getURL('options.html');
    }, addonId).then((result) => {
      if (result && result.error) {
        throw new Error(result.error);
      }

      return result;
    });
  } finally {
    await driver.setContext(firefox.Context.CONTENT);
  }
}

async function waitForText(driver, locator, text) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(
    async () => (await element.getText()).toLowerCase().includes(text.toLowerCase()),
    timeout,
  );
  return element;
}

async function openOptions(driver, optionsUrl) {
  await driver.get(optionsUrl);
  await driver.wait(until.elementLocated(By.id('site')), timeout);
  await waitForText(driver, By.css('.extension-status__title'), 'Blocker is');
}

async function clickButton(driver, label) {
  const button = await driver.wait(
    until.elementLocated(By.xpath(`//button[normalize-space()="${label}"]`)),
    timeout,
  );
  await driver.wait(until.elementIsVisible(button), timeout);
  await button.click();
}

async function setCheckbox(driver, id, checked) {
  const checkbox = await driver.wait(until.elementLocated(By.id(id)), timeout);
  await driver.wait(until.elementIsVisible(checkbox), timeout);

  if ((await checkbox.isSelected()) !== checked) {
    await driver.executeScript('arguments[0].click()', checkbox);
  }

  await driver.wait(async () => (await checkbox.isSelected()) === checked, timeout);
}

async function assertOptionsPage(driver, optionsUrl) {
  await openOptions(driver, optionsUrl);
  assert.equal(await driver.getTitle(), 'Impulse Blocker');
  await waitForText(driver, By.css('.blocklist__header'), 'Blocked sites');
  await waitForText(driver, By.css('.settings__header'), 'Settings');

  await setCheckbox(driver, 'onOffButton', false);
  await setCheckbox(driver, 'pauseButtons', false);

  await openOptions(driver, optionsUrl);
  assert.equal(await driver.findElement(By.id('onOffButton')).isSelected(), false);
  assert.equal(await driver.findElement(By.id('pauseButtons')).isSelected(), false);

  await setCheckbox(driver, 'onOffButton', true);
  await setCheckbox(driver, 'pauseButtons', true);

  await openOptions(driver, optionsUrl);
  assert.equal(await driver.findElement(By.id('onOffButton')).isSelected(), true);
  assert.equal(await driver.findElement(By.id('pauseButtons')).isSelected(), true);
}

async function assertBlocked(driver, targetUrl) {
  await driver.get(targetUrl);
  await driver.wait(async () => {
    const url = new URL(await driver.getCurrentUrl());
    return url.protocol === 'moz-extension:' && url.pathname === '/resources/redirect.html';
  }, timeout);

  const blockedUrl = new URL(await driver.getCurrentUrl());
  assert.equal(blockedUrl.searchParams.get('target'), targetUrl);
  await waitForText(driver, By.id('impulse-msg'), 'is successfully blocked!');
}

async function assertAccessible(driver, targetUrl) {
  await driver.get(targetUrl);
  await driver.wait(until.elementLocated(By.id('loaded')), timeout);
  assert.equal(await driver.getCurrentUrl(), targetUrl);
}

async function addSite(driver, domain) {
  const input = await driver.findElement(By.id('site'));
  await input.clear();
  await input.sendKeys(domain);
  await driver.executeScript('arguments[0].click()', await driver.findElement(By.css('input[type="submit"]')));
  await waitForText(driver, By.css('.blocklist__list'), domain);
}

async function runInExtension(driver, operation) {
  const result = await driver.executeAsyncScript(operation);
  assert.equal(result, null);
}

async function setSubdomainScope(driver, checked) {
  const locator = By.css('input[aria-label="Include subdomains for youtube.localhost"]');
  const checkbox = await driver.wait(until.elementLocated(locator), timeout);
  if ((await checkbox.isSelected()) !== checked) {
    await checkbox.click();
  }
  await driver.wait(async () => {
    const current = await driver.findElement(locator);
    return (await current.isEnabled()) && (await current.isSelected()) === checked;
  }, timeout);
}

async function assertSubdomainBlocking(driver, optionsUrl, targetUrl) {
  const root = new URL(targetUrl);
  root.hostname = 'youtube.localhost';
  const www = new URL(root);
  www.hostname = 'www.youtube.localhost';
  const music = new URL(root);
  music.hostname = 'music.youtube.localhost';
  const nested = new URL(root);
  nested.hostname = 'nested.music.youtube.localhost';

  await openOptions(driver, optionsUrl);
  await addSite(driver, 'youtube.localhost');
  const checkbox = By.css('input[aria-label="Include subdomains for youtube.localhost"]');
  assert.equal(await driver.findElement(checkbox).isSelected(), true);
  await waitForText(driver, By.css('.header__link'), 'v1.5.0');

  console.log('Checking legacy entries without a subdomain setting...');
  await runInExtension(driver, function legacyEntry() {
    const done = arguments[arguments.length - 1];
    browser.storage.local.get('sites').then(({ sites }) => {
      sites.forEach((site) => { delete site.includeSubdomains; });
      return browser.storage.local.set({ sites });
    }).then(() => done(null), (error) => done(error.message));
  });
  await openOptions(driver, optionsUrl);
  assert.equal(await driver.findElement(checkbox).isSelected(), true);
  const optionsTab = await driver.getWindowHandle();
  await driver.switchTo().newWindow('tab');
  const targetTab = await driver.getWindowHandle();
  await assertBlocked(driver, root.href);
  await assertBlocked(driver, www.href);
  await assertBlocked(driver, nested.href);
  await assertBlocked(driver, music.href);

  console.log('Narrowing the rule and checking live restoration and persistence...');
  await driver.switchTo().window(optionsTab);
  await setSubdomainScope(driver, false);
  await driver.switchTo().window(targetTab);
  await driver.wait(until.elementLocated(By.id('loaded')), timeout);
  assert.equal(await driver.getCurrentUrl(), music.href);
  await assertAccessible(driver, nested.href);
  await assertBlocked(driver, root.href);
  await assertBlocked(driver, www.href);
  await driver.switchTo().window(optionsTab);
  await openOptions(driver, optionsUrl);
  assert.equal(await driver.findElement(checkbox).isSelected(), false);

  console.log('Checking domain-only rules after stopping and restarting the blocker...');
  await clickButton(driver, 'Turn blocker off');
  await waitForText(driver, By.css('.extension-status__title'), 'Blocker is off');
  await driver.switchTo().window(targetTab);
  await assertAccessible(driver, music.href);
  await driver.switchTo().window(optionsTab);
  await clickButton(driver, 'Turn blocker on');
  await waitForText(driver, By.css('.extension-status__title'), 'Blocker is on');
  await driver.switchTo().window(targetTab);
  await assertAccessible(driver, music.href);

  console.log('Widening the rule and checking live blocking...');
  await driver.switchTo().window(optionsTab);
  await setSubdomainScope(driver, true);
  await driver.switchTo().window(targetTab);
  await driver.wait(async () => (await driver.getCurrentUrl()).includes('/resources/redirect.html?'), timeout);
  assert.equal(new URL(await driver.getCurrentUrl()).searchParams.get('target'), music.href);

  console.log('Checking scope changes during a pause and blocking after resuming...');
  await driver.switchTo().window(optionsTab);
  await runInExtension(driver, function pause() {
    const done = arguments[arguments.length - 1];
    browser.runtime.sendMessage({ type: 'pauseBlocker', duration: 60 })
      .then(() => done(null), (error) => done(error.message));
  });
  await setSubdomainScope(driver, false);
  await driver.switchTo().window(targetTab);
  await assertAccessible(driver, root.href);
  await assertAccessible(driver, music.href);
  await driver.switchTo().window(optionsTab);
  await runInExtension(driver, function resume() {
    const done = arguments[arguments.length - 1];
    browser.runtime.sendMessage({ type: 'unpauseBlocker' })
      .then(() => done(null), (error) => done(error.message));
  });
  await driver.switchTo().window(targetTab);
  await assertAccessible(driver, music.href);
  await assertBlocked(driver, root.href);
  await assertBlocked(driver, www.href);

  await driver.switchTo().window(optionsTab);
  await openOptions(driver, optionsUrl);
  assert.equal(await driver.findElement(checkbox).isSelected(), false);
  await fs.mkdir(resultsPath, { recursive: true });
  await fs.writeFile(path.join(resultsPath, 'options-desktop.png'), await driver.takeScreenshot(), 'base64');
  await driver.manage().window().setRect({ width: 390, height: 844 });
  await fs.writeFile(path.join(resultsPath, 'options-mobile.png'), await driver.takeScreenshot(), 'base64');
}

async function main() {
  await fs.rm(resultsPath, { recursive: true, force: true });

  const { server, url: targetUrl } = await startTestServer();
  const options = new firefox.Options()
    .addArguments('-headless')
    .setPreference('network.dns.localDomains', 'youtube.localhost,www.youtube.localhost,music.youtube.localhost,nested.music.youtube.localhost')
    .windowSize({ width: 1280, height: 900 });
  const service = new firefox.ServiceBuilder().addArguments('--allow-system-access');
  let driver;

  try {
    driver = await new Builder()
      .forBrowser('firefox')
      .setFirefoxOptions(options)
      .setFirefoxService(service)
      .build();

    const addonId = await driver.installAddon(extensionPath, true);
    const optionsUrl = await getOptionsUrl(driver, addonId);

    console.log('Checking the options page and persisted settings...');
    await assertOptionsPage(driver, optionsUrl);

    console.log('Adding localhost from the options page...');
    await openOptions(driver, optionsUrl);
    const siteInput = await driver.findElement(By.id('site'));
    await siteInput.sendKeys('localhost');
    assert.equal(await siteInput.getAttribute('value'), 'localhost');
    const submit = await driver.findElement(By.css('input[type="submit"]'));
    await driver.executeScript('arguments[0].click()', submit);
    await waitForText(driver, By.css('.blocklist__list'), 'localhost');

    console.log('Checking that localhost is blocked...');
    await assertBlocked(driver, targetUrl);

    console.log('Turning the blocker off and checking access...');
    await openOptions(driver, optionsUrl);
    await clickButton(driver, 'Turn blocker off');
    await waitForText(driver, By.css('.extension-status__title'), 'Blocker is off');
    await assertAccessible(driver, targetUrl);

    console.log('Turning the blocker on and checking blocking...');
    await openOptions(driver, optionsUrl);
    await clickButton(driver, 'Turn blocker on');
    await waitForText(driver, By.css('.extension-status__title'), 'Blocker is on');
    await assertBlocked(driver, targetUrl);

    console.log('Removing localhost and checking access...');
    await openOptions(driver, optionsUrl);
    await clickButton(driver, 'Delete');
    await driver.wait(async () => {
      const list = await driver.findElement(By.css('.blocklist__list'));
      return !(await list.getText()).includes('localhost');
    }, timeout);
    await assertAccessible(driver, targetUrl);

    await assertSubdomainBlocking(driver, optionsUrl, targetUrl);

    console.log('Firefox extension smoke test passed.');
  } catch (error) {
    if (driver) {
      try {
        await fs.mkdir(resultsPath, { recursive: true });
        const screenshot = await driver.takeScreenshot();
        await fs.writeFile(path.join(resultsPath, 'failure.png'), screenshot, 'base64');
        const diagnostics = [
          `URL: ${await driver.getCurrentUrl()}`,
          '',
          await driver.findElement(By.css('body')).getText(),
        ].join('\n');
        await fs.writeFile(path.join(resultsPath, 'failure.txt'), diagnostics);
      } catch (artifactError) {
        console.error('Could not save Firefox failure artifacts:', artifactError);
      }
    }
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
    }
    await closeServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

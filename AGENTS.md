# Agent verification

After changing application logic, run `npm test -- --runInBand`.

For changes that can affect extension behavior or generated bundles, also run
`npm run test:e2e`. This command builds the extension and runs a finite,
headless Firefox smoke test. It may require permission to launch Firefox and
network access for Selenium Manager to obtain GeckoDriver on its first run.

Do not use `npm run browser` as automated verification. It is the interactive
development watcher and intentionally stays open until stopped.

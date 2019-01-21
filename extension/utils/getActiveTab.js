export default async function getActiveTab() {
  const [activeTab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  return activeTab;
}

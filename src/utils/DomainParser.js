export default class DomainParser {
  static async getActiveTab() {
    const [activeTab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    return activeTab;
  }

  static parse(url) {
    const domain = new URL(url);
    // dont show the button for non-http pages
    if (['http:', 'https:'].indexOf(domain.protocol) === -1) {
      return false;
    }

    return domain.hostname.replace(/^www\./, '');
  }

  static async getCurrentDomain() {
    const activeTab = await this.getActiveTab();
    return this.parse(activeTab.url);
  }
}

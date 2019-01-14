export default class DomainParser {
  static parse(url) {
    const domain = new URL(url);
    // dont show the button for non-http pages
    if (['http:', 'https:'].indexOf(domain.protocol) === -1) {
      return false;
    }

    return domain.hostname.replace(/^www\./, '');
  }
}

import React from 'react';
import ReactDOM from 'react-dom';
import './options.css';

import MessageTypes from '../enums/messages';
import DomainListItem from './components/DomainListItem';
import SettingsSection from './components/SettingsSection';
import ExtensionStatus from './components/ExtensionStatus';

class Options extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      blockedSites: [],
      extensionStatus: null,
      pausedUntil: null,
      extensionSettings: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.listItems = this.listItems.bind(this);
    this.onClick = this.onClick.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.updateExtensionStatus = this.updateExtensionStatus.bind(this);
  }

  async componentDidMount() {
    const domains = await browser.runtime.sendMessage({
      type: MessageTypes.GET_BLOCKED_DOMAINS_LIST,
    });

    const statusResponse = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });

    this.setState({
      blockedSites: domains,
      extensionStatus: statusResponse.extensionStatus,
      pausedUntil: statusResponse.pausedUntil,
      extensionSettings: statusResponse.extensionSettings,
    });
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    browser.runtime
      .sendMessage({
        type: MessageTypes.START_BLOCKING_DOMAIN,
        domain: this.state.value,
      })
      .then((domain) => {
        this.setState((prevState) => ({
          blockedSites: [...prevState.blockedSites, domain],
          value: '',
        }));
      });
  }

  onClick(domain) {
    browser.runtime
      .sendMessage({
        type: MessageTypes.START_ALLOWING_DOMAIN,
        domain,
      })
      .then(() => {
        const updatedBlockedSites = this.state.blockedSites.filter(
          (item) => item !== domain,
        );

        this.setState({
          blockedSites: updatedBlockedSites,
        });
      });
  }

  listItems() {
    return this.state.blockedSites.map((domain) => (
      <DomainListItem domain={domain} onClick={this.onClick} key={domain} />
    ));
  }

  getSetting(key) {
    return this.state.extensionSettings.find((item) => item.key === key);
  }

  updateExtensionStatus(extensionStatus) {
    browser.runtime
      .sendMessage({
        type: MessageTypes.UPDATE_EXTENSION_STATUS,
        parameter: extensionStatus,
      })
      .then(() => {
        this.setState({ extensionStatus });
      });
  }

  render() {
    const count = this.state.blockedSites.length;
    return (
      <div>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <header className="header">
          <div className="header__inner">
            <div className="header__top">
              <h1 className="header__title">Impulse Blocker</h1>
              <div className="header__links">
                <a
                  href="https://addons.mozilla.org/firefox/addon/impulse-blocker/versions/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header__link"
                >
                  v{browser.runtime.getManifest().version}
                </a>
                <span className="header__links-separator">·</span>
                <a
                  href="https://blog.cemunalan.com.tr/2017/05/17/impulse-blocker-guide/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header__link"
                >
                  Guide
                </a>
              </div>
            </div>
          </div>
        </header>
        <main id="main" className="container">
          <ExtensionStatus
            status={this.state.extensionStatus}
            onStatusUpdate={this.updateExtensionStatus}
          />
          <div className="blocklist">
            <div className="blocklist__header-row">
              <h3 className="blocklist__header">Blocked sites</h3>
              <span className="blocklist__count">{count}</span>
            </div>
            <form onSubmit={this.handleSubmit} className="blocklist__form">
              <input
                type="text"
                className="form__input"
                id="site"
                name="site"
                value={this.state.value}
                onChange={this.handleChange}
                placeholder="Add a site (e.g. instagram.com)"
                required
              />
              <input
                type="submit"
                className="button button--red"
                value="Block"
              />
            </form>
            <hr />
            <ul className="blocklist__list">
              {count === 0 ? (
                <li className="blocklist__empty">
                  The list is empty. Add a site above to start blocking.
                </li>
              ) : (
                this.listItems()
              )}
            </ul>
          </div>
          <SettingsSection />
        </main>
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById('root'));

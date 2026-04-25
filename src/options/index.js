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
      .then(() => {
        this.setState((prevState) => ({
          blockedSites: [...prevState.blockedSites, this.state.value],
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
      <DomainListItem
        domain={domain}
        onClick={this.onClick}
        key={Math.random()}
      />
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
    var emptymsg = "empty";
    if(this.state.blockedSites.length > 0) {
        emptymsg = this.state.blockedSites.length.toString()
    }
    return (
      <div>
        <header className="header">
          <h1 className="header__title">
            Impulse Blocker
            <div className="header__links">
              <a
                href="https://blog.cemunalan.com.tr/2019/02/20/impulse-blocker-1-0/"
                target="_blank"
                className="header__link"
              >
                v1.2.0
              </a>
              <span className="header__links-seperator">|</span>
              <a
                href="https://blog.cemunalan.com.tr/2017/05/17/impulse-blocker-guide/"
                target="_blank"
                className="header__link"
              >
                Guide
              </a>
            </div>
          </h1>
          <form onSubmit={this.handleSubmit} className="header__form">
            <input
              type="text"
              className="form__input"
              id="site"
              name="site"
              value={this.state.value}
              onChange={this.handleChange}
              placeholder="Add a site to the blocklist..."
              required
            />
            <input type="submit" className="button button--red" value="Block" />
          </form>
        </header>
        <div className="container">
          <ExtensionStatus
            status={this.state.extensionStatus}
            onStatusUpdate={this.updateExtensionStatus}
          />
          <div className="blocklist">
            <h3 className="blocklist__header">
              Currently blocked websites
              <span style={{float: "right"}}>({emptymsg})</span>
            </h3>
            <hr />
            <ul className="blocklist__list">{this.listItems()}</ul>
          </div>
          <SettingsSection />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById('root'));

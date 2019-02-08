import React from 'react';
import ReactDOM from 'react-dom';
import './settings.css';

import MessageTypes from '../enums/messages';
import DomainListItem from './components/DomainListItem';
import settings from '../enums/settings';
import extensionStatus from '../enums/extensionStatus';
import ExtensionStatus from './components/ExtensionStatus';

class Settings extends React.Component {
  constructor() {
    super();

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
    this.handleOnOffButtonSettingsChange = this.handleOnOffButtonSettingsChange.bind(
      this,
    );
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

  async handleSubmit(e) {
    e.preventDefault();
    const response = await browser.runtime.sendMessage({
      type: MessageTypes.START_BLOCKING_DOMAIN,
      domain: this.state.value,
    });

    if (response === true) {
      this.setState(prevState => ({
        blockedSites: [...prevState.blockedSites, this.state.value],
        value: '',
      }));
    }
  }

  async onClick(domain) {
    const response = await browser.runtime.sendMessage({
      type: MessageTypes.START_ALLOWING_DOMAIN,
      domain,
    });

    if (response === true) {
      const updatedBlockedSites = this.state.blockedSites.filter(
        item => item !== domain,
      );

      this.setState({
        blockedSites: updatedBlockedSites,
      });
    }
  }

  listItems() {
    return this.state.blockedSites.map(domain => (
      <DomainListItem
        domain={domain}
        onClick={this.onClick}
        key={Math.random()}
      />
    ));
  }

  getSetting(key) {
    return this.state.extensionSettings.find(item => item.key === key);
  }

  onOffButtonSetting() {
    const setting = this.state.extensionSettings.find(
      item => item.key === settings.SHOW_ON_OFF_BUTTONS_IN_POPUP,
    );

    if (setting === undefined) {
      return false;
    }

    return setting.value;
  }

  async handleOnOffButtonSettingsChange(e) {
    e.preventDefault();

    let value = settings.ON;
    if (this.onOffButtonSetting() === settings.ON) {
      value = settings.OFF;
    }

    const response = await browser.runtime.sendMessage({
      type: MessageTypes.UPDATE_EXTENSION_SETTING,
      key: settings.SHOW_ON_OFF_BUTTONS_IN_POPUP,
      value,
    });

    if (response !== false) {
      this.setState({
        extensionSettings: response,
      });
    }
  }

  async updateExtensionStatus(extensionStatus) {
    const extensionStatusChange = await browser.runtime.sendMessage({
      type: MessageTypes.UPDATE_EXTENSION_STATUS,
      parameter: extensionStatus,
    });

    if (extensionStatusChange === true) {
      this.setState({ extensionStatus });
    }
  }

  render() {
    return (
      <div>
        <header className="header">
          <h1 className="header__title">Impulse Blocker</h1>
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
            <h3 className="blocklist__header">Currently blocked websites:</h3>
            <hr />
            <ul className="blocklist__list">{this.listItems()}</ul>
          </div>
          <div className="settings">
            <h3 className="settings__header">Extension Settings</h3>
            <hr />
            <form>
              <label htmlFor="onOffButton">Show On/Off Buttons in Popup</label>
              <input
                name="onOffButton"
                type="checkbox"
                checked={this.onOffButtonSetting() === settings.ON}
                onChange={e => {
                  this.handleOnOffButtonSettingsChange(e);
                }}
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Settings />, document.getElementById('root'));

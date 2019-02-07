import React from 'react';
import ReactDOM from 'react-dom';
import './settings.css';

import MessageTypes from '../enums/messages';
import DomainListItem from './components/DomainListItem';
import settings from '../enums/settings';

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

  async handleOnOffButtonSettingsChange(e) {
    e.preventDefault();
    const response = await browser.runtime.sendMessage({
      type: MessageTypes.UPDATE_EXTENSION_SETTING,
      key: settings.SHOW_ON_OFF_BUTTONS_IN_POPUP,
      value: settings.ON,
    });
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
                type="checkbox"
                onChange={e => {
                  this.handleOnOffButtonSettingsChange(e);
                }}
                value={settings.ON}
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Settings />, document.getElementById('root'));

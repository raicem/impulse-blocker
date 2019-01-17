import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

import MessageTypes from '../enums/messages';
import ExtensionStatusEnum from '../enums/extensionStatus';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      extensionStatus: 'now known',
      domain: '',
      isBlocked: false,
      isValidUrl: false,
    };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.handleDomainClicked = this.handleDomainClicked.bind(this);
  }

  isBlockable() {
    if (this.state.isValidUrl === false) {
      return false;
    }

    if (this.state.isBlocked === true) {
      return false;
    }

    return true;
  }

  async componentDidMount() {
    const activeTabUrl = await browser.runtime.sendMessage({
      type: MessageTypes.GET_CURRENT_DOMAIN,
    });

    if (activeTabUrl !== false) {
      this.setState({
        domain: activeTabUrl,
        isValidUrl: true,
      });
    }

    const extensionStatus = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });

    this.setState({ extensionStatus });
  }

  async handleStatusChange(extensionStatus) {
    const extensionStatusChange = await browser.runtime.sendMessage({
      type: MessageTypes.UPDATE_EXTENSION_STATUS,
      parameter: extensionStatus,
    });

    if (extensionStatusChange === true) {
      this.setState({ extensionStatus });
    }
  }

  handleDomainClicked() {
    console.log('clicked');
    if (this.state.isBlocked === true) {
      this.startAllowingCurrentDomain();
    }

    if (this.state.isBlocked === false) {
      this.startBlockingCurrentDomain();
    }
  }

  async startBlockingCurrentDomain() {
    const blockingDomainResponse = await browser.runtime.sendMessage({
      type: MessageTypes.START_BLOCKING_DOMAIN,
    });

    if (blockingDomainResponse === true) {
      this.setState({
        isBlocked: true,
      });
    }
  }

  async startAllowingCurrentDomain() {
    const allowingDomainResponse = await browser.runtime.sendMessage({
      type: MessageTypes.START_ALLOWING_DOMAIN,
    });

    if (allowingDomainResponse === true) {
      this.setState({ isBlocked: false });
    }
  }

  render() {
    return (
      <div>
        <header>
          <img className="options" src={cogs} />
        </header>
        <main>
          <form action="GET">
            <div className="form-group">
              <input
                type="radio"
                name="status"
                id="on"
                value="on"
                checked={this.state.extensionStatus === ExtensionStatusEnum.ON}
                onChange={() => this.handleStatusChange(ExtensionStatusEnum.ON)}
              />
              <label htmlFor="on">On</label>
            </div>
            <div className="form-group">
              <input
                type="radio"
                name="status"
                id="off"
                value="off"
                checked={this.state.extensionStatus === ExtensionStatusEnum.OFF}
                onChange={() =>
                  this.handleStatusChange(ExtensionStatusEnum.OFF)
                }
              />
              <label htmlFor="off">Off</label>
            </div>
          </form>
          <div className="add-domain-section">
            {this.state.isValidUrl && (
              <button
                className={`button ${
                  this.isBlockable() ? 'button-add' : 'button-remove'
                }`}
                onClick={this.handleDomainClicked}
              >
                {this.isBlockable() ? 'Block' : 'Allow'} {this.state.domain}
              </button>
            )}
          </div>
        </main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

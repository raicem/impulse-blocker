import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

import MessageTypes from '../enums/messages';
import ExtensionStatus from './components/ExtensionStatus';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      domain: '',
      isBlocked: false,
      isValidUrl: false,
    };

    this.handleDomainClicked = this.handleDomainClicked.bind(this);
  }

  isBlockable() {
    console.log(this.state);
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
      const isBlocked = await browser.runtime.sendMessage({
        type: MessageTypes.IS_DOMAIN_BLOCKED,
        domain: activeTabUrl,
      });

      console.log('mount', isBlocked);

      this.setState({
        domain: activeTabUrl,
        isValidUrl: true,
        isBlocked,
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
    console.log('render', this.isBlockable());
    return (
      <div>
        <header>
          <img className="options" src={cogs} />
        </header>
        <main>
          <ExtensionStatus />
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

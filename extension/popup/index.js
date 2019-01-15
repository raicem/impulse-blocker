import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

import MessageEnums from '../enums/messages';
import ExtensionStatusEnum from '../enums/extensionStatus';

import InvalidWebPage from './components/InvalidWebPage';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      extensionStatus: ExtensionStatusEnum.OFF,
      domain: '',
      isBlocked: false,
      isValidUrl: false,
    };
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
    this.getExtensionStatus();
    const activeTabUrl = await browser.runtime.sendMessage({
      type: MessageEnums.GET_CURRENT_DOMAIN,
    });

    if (activeTabUrl !== false) {
      this.setState({
        domain: activeTabUrl,
        isValidUrl: true,
      });
    }
  }

  async getExtensionStatus() {
    const extensionStatus = await browser.runtime.sendMessage({
      type: MessageEnums.GET_EXTENSION_STATUS,
    });

    console.log(extensionStatus);

    this.setState({
      extensionStatus,
    });
  }

  render() {
    if (!this.state.isValidUrl) {
      return <InvalidWebPage />;
    }
    return (
      <div>
        <header>
          <img className="options" src={cogs} />
        </header>
        <main>
          <form action="GET">
            <div className="form-group">
              <input type="radio" name="status" id="on" value="on" />
              <label htmlFor="on">On</label>
            </div>
            <div className="form-group">
              <input type="radio" name="status" id="off" value="off" />
              <label htmlFor="off">Off</label>
            </div>
          </form>
          <div className="add-domain-section">
            <button
              className={`button ${
                this.isBlockable() ? 'button-add' : 'button-remove'
              }`}
            >
              {this.isBlockable() ? 'Block' : 'Allow'} {this.state.domain}
            </button>
          </div>
        </main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

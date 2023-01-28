import React from 'react';
import ReactDOM from 'react-dom';
import './options.css';

import MessageTypes from '../enums/messages';
import DomainListItem from './components/DomainListItem';
import SettingsSection from './components/SettingsSection';
import ExtensionStatus from './components/ExtensionStatus';
import UrlHistoryInput from './components/UrlHistoryInput';

class Options extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      blockedSites: [],
      extensionStatus: null,
      pausedUntil: null,
      extensionSettings: [],
      hasHistoryPermission: false,
    };
    this.historyPermission = "history";
    this.browserPermissions = browser.permissions;
    this.onPermissionsAdded = this.onPermissionsAdded.bind(this);
    this.onPermissionsRemoved = this.onPermissionsRemoved.bind(this);
    this.requestHistoryPermission = this.requestHistoryPermission.bind(this);
    this.hasHistoryPermission = this.hasHistoryPermission.bind(this);
    this.urlHistoryInputElement = React.createRef();

    this.onBlockDomainClick = this.onBlockDomainClick.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleUrlHistoryInputChange = this.handleUrlHistoryInputChange.bind(this);
    this.getDomainInput = this.getDomainInput.bind(this);
    
    this.getListItems = this.getListItems.bind(this);
    this.onListItemClick = this.onListItemClick.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.showPermissionNoteIfHistoryPermissionDenied = this.showPermissionNoteIfHistoryPermissionDenied.bind(this);
    this.updateExtensionStatus = this.updateExtensionStatus.bind(this);
  }

  async componentDidMount() {
    const domains = await browser.runtime.sendMessage({
      type: MessageTypes.GET_BLOCKED_DOMAINS_LIST,
    });
    const statusResponse = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });
    
    this.browserPermissions.onAdded.addListener(this.onPermissionsAdded);
    this.browserPermissions.onRemoved.addListener(this.onPermissionsRemoved);
    const hasHistoryPermission = await this.hasHistoryPermission();

    this.setState({
      blockedSites: domains,
      extensionStatus: statusResponse.extensionStatus,
      pausedUntil: statusResponse.pausedUntil,
      extensionSettings: statusResponse.extensionSettings,
      hasHistoryPermission: hasHistoryPermission,
    });
  }

  async componentWillUnmount() {
    this.browserPermissions.onAdded.removeListener(this.onPermissionsAdded);
    this.browserPermissions.onRemoved.removeListener(this.onPermissionsRemoved);
  }

  onPermissionsRemoved(_) {
    this.setState({hasHistoryPermission: false });
  }

  onPermissionsAdded(_) {
    this.setState({ hasHistoryPermission: true });
  }

  async requestHistoryPermission(_) {
    return browser.permissions.request({permissions: [this.historyPermission]})
    .then((response) => response)
    .catch((_) => false);
  }

  async revokeHistoryPermission(_) {
    browser.permissions.remove({permissions: [this.historyPermission]})
    .catch((_) => _);
  }

  /**
   * @returns `true` if extension has the permission to read user's browser history. `false` otherwise.
   */
  async hasHistoryPermission() {
    return this.browserPermissions.contains({
        permissions: [this.historyPermission]
      })
      .then((response) => { return response; })
      .catch((_) => { return false; });
  }

  onBlockDomainClick(e) {
    e.preventDefault();
    browser.runtime
      .sendMessage({
        type: MessageTypes.START_BLOCKING_DOMAIN,
        domain: this.state.value,
      })
      .then(() => {
        this.urlHistoryInputElement?.current?.clearSelected();
        this.setState((prevState) => ({
          blockedSites: [...prevState.blockedSites, this.state.value],
          value: '',
        }));
      });
  }

  /**
   * Returns an input field based on the history permission of this extension.
   * @returns `UrlHistoryInput` if the extension has a history permission, `input` otherwise.
   */
  getDomainInput() {
    if (this.state.hasHistoryPermission) {
      return (<UrlHistoryInput onItemChange={this.handleUrlHistoryInputChange} ref={this.urlHistoryInputElement}/>);
    }
    return (<input
              type="text"
              className="form__input"
              id="site"
              name="site"
              value={this.state.value}
              onChange={this.handleInputChange}
              placeholder="Add a site to the blocklist..."
              required
            />);
  }

  handleInputChange(e) {
    this.setState({ value: e?.target?.value });
  }

  handleUrlHistoryInputChange(e) {
    this.setState({ value: e?.url });
  }

  showPermissionNoteIfHistoryPermissionDenied() {
    if (!this.state.hasHistoryPermission) {
      return (<div className="header__links">
        <a href='#' className="header__note" onClick={this.requestHistoryPermission}>Request optional permission for this extension</a>
      </div>)
    }
  }

  onListItemClick(domain) {
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

  getListItems() {
    return this.state.blockedSites.map((domain) => (
      <DomainListItem
        domain={domain}
        onClick={this.onListItemClick}
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
            {this.showPermissionNoteIfHistoryPermissionDenied()}
          </h1>
          <form onSubmit={this.onBlockDomainClick} className="header__form">
            {this.getDomainInput()}
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
            <ul className="blocklist__list">{this.getListItems()}</ul>
          </div>
          <SettingsSection />
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Options />, document.getElementById('root'));

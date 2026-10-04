import React from 'react';
import MessageTypes from '../../enums/messages';
import { openOptionsPage } from '../../utils/functions';

export default class DomainButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      domain: '',
      isBlocked: false,
      isValidUrl: false,
      parentDomain: null,
    };

    this.handleDomainClicked = this.handleDomainClicked.bind(this);
  }

  async componentDidMount() {
    const activeTabUrl = await browser.runtime.sendMessage({
      type: MessageTypes.GET_CURRENT_DOMAIN,
    });

    if (activeTabUrl !== false) {
      await this.refreshDomainState(activeTabUrl);
    }
  }

  async refreshDomainState(domain) {
    const matchingDomains = await browser.runtime.sendMessage({
      type: MessageTypes.GET_MATCHING_BLOCKED_DOMAINS,
      domain,
    });
    this.setState({
      domain,
      isValidUrl: true,
      isBlocked: matchingDomains.length > 0,
      parentDomain: matchingDomains.find((blockedDomain) => blockedDomain !== domain) || null,
    });
  }

  handleDomainClicked() {
    if (this.state.isBlocked === true) {
      this.updateDomainInBlockedList({
        type: MessageTypes.START_ALLOWING_DOMAIN,
        domain: this.state.domain,
      });
    }

    if (this.state.isBlocked === false) {
      this.updateDomainInBlockedList({
        type: MessageTypes.START_BLOCKING_DOMAIN,
        domain: this.state.domain,
      });
    }
  }

  updateDomainInBlockedList({ type, domain }) {
    return browser.runtime
      .sendMessage({
        type,
        domain,
      })
      .then(() => this.refreshDomainState(domain));
  }

  render() {
    if (this.state.parentDomain) {
      return (
        <div className="add-domain-section">
          <p>Blocked by {this.state.parentDomain}</p>
          <button className="button" onClick={openOptionsPage}>
            Manage blocked sites
          </button>
        </div>
      );
    }
    return (
      <div className="add-domain-section">
        {this.state.isValidUrl && (
          <button
            className={`button ${
              this.state.isBlocked ? 'button-remove' : 'button-add'
            }`}
            onClick={this.handleDomainClicked}
          >
            {this.state.isBlocked ? 'Allow' : 'Block'}
            {' '}
            {this.state.domain}
          </button>
        )}
      </div>
    );
  }
}

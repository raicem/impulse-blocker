import React from 'react';
import MessageTypes from '../../enums/messages';

export default class DomainButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      domain: '',
      isBlocked: false,
      isValidUrl: false,
    };

    this.handleDomainClicked = this.handleDomainClicked.bind(this);
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

      this.setState({
        domain: activeTabUrl,
        isValidUrl: true,
        isBlocked,
      });
    }
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
    browser.runtime
      .sendMessage({
        type,
        domain,
      })
      .then(() => {
        this.setState({
          isBlocked: !this.state.isBlocked,
        });
      });
  }

  render() {
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

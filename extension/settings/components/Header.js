import React from 'react';
import MessageTypes from '../../enums/messages';

export default class Header extends React.Component {
  constructor() {
    super();
    this.state = { value: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
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

  render() {
    return (
      <header>
        <h3>Impulse Blocker</h3>
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            id="site"
            name="site"
            value={this.state.value}
            onChange={this.handleChange}
            placeholder="Add site to the blocklist"
          />
          <input type="submit" value="Block" />
        </form>
      </header>
    );
  }
}

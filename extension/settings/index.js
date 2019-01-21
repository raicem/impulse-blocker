import React from 'react';
import ReactDOM from 'react-dom';
import './settings.css';

import MessageTypes from '../enums/messages';

class Settings extends React.Component {
  constructor() {
    super();

    this.state = {
      value: '',
      blockedSites: [],
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.listItems = this.listItems.bind(this);
  }

  async componentDidMount() {
    const storage = await browser.runtime.sendMessage({
      type: MessageTypes.GET_BLOCKED_DOMAINS_LIST,
    });

    this.setState({
      blockedSites: storage.sites,
    });
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
  }

  handleSubmit() {
    console.log('submitting');
  }

  listItems() {
    return this.state.blockedSites.map(site => <li key={site}>{site}</li>);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="site">Website to block: </label>
          <input
            type="text"
            id="site"
            name="site"
            value={this.state.value}
            onChange={this.handleChange}
          />
          <input type="submit" value="Add" />
        </form>
        <div className="blocked-sites">
          <p className="list-header">Currently blocked websites:</p>
          <ul>{this.listItems()}</ul>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Settings />, document.getElementById('root'));

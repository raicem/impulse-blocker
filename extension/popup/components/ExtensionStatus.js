import React from 'react';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';

export default class ExtensionStatus extends React.Component {
  constructor() {
    super();
    this.state = { extensionStatus: 'now known' };

    this.handleStatusChange = this.handleStatusChange.bind(this);
  }

  async componentDidMount() {
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

  render() {
    return (
      <form action="GET">
        <div className="form-group">
          <input
            type="radio"
            name="status"
            id="on"
            value="on"
            checked={this.state.extensionStatus === ExtensionStatusTypes.ON}
            onChange={() => this.handleStatusChange(ExtensionStatusTypes.ON)}
          />
          <label htmlFor="on">On</label>
        </div>
        <div className="form-group">
          <input
            type="radio"
            name="status"
            id="off"
            value="off"
            checked={this.state.extensionStatus === ExtensionStatusTypes.OFF}
            onChange={() => this.handleStatusChange(ExtensionStatusTypes.OFF)}
          />
          <label htmlFor="off">Off</label>
        </div>
      </form>
    );
  }
}

import React from 'react';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';
import PauseSection from './Pause/PauseSection';

export default class ExtensionStatus extends React.Component {
  constructor() {
    super();
    this.state = { extensionStatus: null, pausedUntil: null };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.updateExtensionStatus = this.updateExtensionStatus.bind(this);
  }

  async componentDidMount() {
    const statusResponse = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });

    this.setState({
      extensionStatus: statusResponse.extensionStatus,
      pausedUntil: statusResponse.pausedUntil,
    });
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

  async updateExtensionStatus() {
    const statusResponse = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });

    this.setState({
      extensionStatus: statusResponse.extensionStatus,
      pausedUntil: statusResponse.pausedUntil,
    });
  }

  render() {
    return (
      <div>
        <form>
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
        <PauseSection
          pausedUntil={this.state.pausedUntil}
          extensionStatus={this.state.extensionStatus}
          onChange={this.updateExtensionStatus}
        />
      </div>
    );
  }
}

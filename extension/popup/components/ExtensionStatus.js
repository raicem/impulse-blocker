import React from 'react';
import dayjs from 'dayjs';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';
import PauseButton from './PauseButton';

export default class ExtensionStatus extends React.Component {
  constructor() {
    super();
    this.state = { extensionStatus: 'now known', pausedUntil: null };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handleUnpause = this.handleUnpause.bind(this);
  }

  async componentDidMount() {
    const statusResponse = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });

    console.log(statusResponse);

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

  handlePause() {
    this.setState({
      pausedUntil: dayjs().add(this.defaultDuration, 'minute'),
      extensionStatus: ExtensionStatusTypes.PAUSED,
    });
  }

  handleUnpause() {
    this.setState({
      extensionStatus: ExtensionStatusTypes.ON,
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
        <PauseButton
          pausedUntil={this.state.pausedUntil}
          extensionStatus={this.state.extensionStatus}
          onPause={this.handlePause}
          onUnpause={this.handleUnpause}
        />
      </div>
    );
  }
}

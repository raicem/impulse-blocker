import React from 'react';
import dayjs from 'dayjs';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';

// TODO: Add prop types
export default class PauseButton extends React.Component {
  constructor() {
    super();

    this.defaultDuration = 5 * 60;

    this.pauseExtension = this.pauseExtension.bind(this);
    this.unpauseExtension = this.unpauseExtension.bind(this);
  }

  async pauseExtension(event) {
    event.preventDefault();
    const pauseRequest = await browser.runtime.sendMessage({
      type: MessageTypes.PAUSE_BLOCKER,
      duration: this.defaultDuration,
    });

    if (pauseRequest === true) {
      this.props.onPause();
    }
  }

  async unpauseExtension(event) {
    event.preventDefault();
    const unpauseRequest = await browser.runtime.sendMessage({
      type: MessageTypes.UNPAUSE_BLOCKER,
    });

    if (unpauseRequest === true) {
      this.props.onUnpause();
    }
  }

  render() {
    return (
      <div className="pause-section">
        <div className="form-group">
          {this.props.extensionStatus === ExtensionStatusTypes.ON && (
            <button
              className="button button--pause"
              onClick={this.pauseExtension}
            >
              5 Minute Pause
            </button>
          )}
          {this.props.extensionStatus === ExtensionStatusTypes.OFF && (
            <button className="button button--pause-disabled" disabled>
              5 Minute Pause
            </button>
          )}
          {this.props.extensionStatus === ExtensionStatusTypes.PAUSED && (
            <button
              className="button button--unpause"
              onClick={this.unpauseExtension}
            >
              Cancel Pause - {this.props.pausedUntil.format()}
            </button>
          )}
        </div>
      </div>
    );
  }
}

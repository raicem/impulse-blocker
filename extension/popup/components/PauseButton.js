import React from 'react';
import dayjs from 'dayjs';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';

// TODO: Add prop types
export default class PauseButton extends React.Component {
  constructor() {
    super();

    this.state = {
      secondsToExpire: 0,
    };

    this.defaultDuration = 300;

    this.pauseExtension = this.pauseExtension.bind(this);
    this.unpauseExtension = this.unpauseExtension.bind(this);
    this.calculateTimeRemaining = this.calculateTimeRemaining.bind(this);
  }

  componentDidMount() {
    if (this.props.extensionStatus === ExtensionStatusTypes.PAUSED) {
      this.calculateTimeRemaining();
      this.startCountdownTimer();
    }
  }

  async pauseExtension(event) {
    event.preventDefault();
    const pauseRequest = await browser.runtime.sendMessage({
      type: MessageTypes.PAUSE_BLOCKER,
      duration: this.defaultDuration,
    });

    if (pauseRequest === true) {
      this.startCountdownTimer();
      this.props.onChange();
    }
  }

  async unpauseExtension(event) {
    event.preventDefault();
    const unpauseRequest = await browser.runtime.sendMessage({
      type: MessageTypes.UNPAUSE_BLOCKER,
    });

    if (unpauseRequest === true) {
      clearInterval(this.countdownTimer);
      this.props.onChange();
    }

    this.setState({
      secondsToExpire: 0,
    });
  }

  calculateTimeRemaining() {
    const currentDatetime = dayjs();
    const expiresAt = dayjs(this.props.pausedUntil);

    const secondsToExpire = expiresAt.diff(currentDatetime, 'second');

    this.setState({
      secondsToExpire,
    });
  }

  startCountdownTimer() {
    this.countdownTimer = setInterval(
      () => this.calculateTimeRemaining(),
      1000,
    );
  }

  remainingTime() {
    const time = dayjs()
      .set('hour', 0)
      .set('minute', 0)
      .set('second', 0)
      .add(this.state.secondsToExpire, 'second');

    return time.format('mm:ss');
  }

  isExtensionPaused() {
    return this.props.extensionStatus === ExtensionStatusTypes.PAUSED;
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
              {`Cancel Pause - ${this.isExtensionPaused() &&
                this.remainingTime()}`}
            </button>
          )}
        </div>
      </div>
    );
  }
}

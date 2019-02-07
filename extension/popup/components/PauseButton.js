import React from 'react';
import dayjs from 'dayjs';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';

// TODO: Add prop types
export default class PauseButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsToExpire: 0,
    };

    this.defaultDuration = 5 * 60;

    this.pauseExtension = this.pauseExtension.bind(this);
    this.unpauseExtension = this.unpauseExtension.bind(this);
    this.calculateTimeRemaining = this.calculateTimeRemaining.bind(this);
    this.createPauseButton = this.createPauseButton.bind(this);
    this.createDisabledPauseButton = this.createDisabledPauseButton.bind(this);
  }

  componentDidMount() {
    this.calculateTimeRemaining();
    this.startCountdownTimer();
  }

  async pauseExtension(event, duration) {
    event.preventDefault();
    const pauseRequest = await browser.runtime.sendMessage({
      type: MessageTypes.PAUSE_BLOCKER,
      duration,
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

    if (this.state.secondsToExpire > 60 * 60) {
      return time.format('hh:mm:ss');
    }

    return time.format('mm:ss');
  }

  isExtensionPaused() {
    return this.props.extensionStatus === ExtensionStatusTypes.PAUSED;
  }

  createPauseButton(label, duration) {
    return (
      <button
        className="button button--pause"
        onClick={e => this.pauseExtension(e, duration)}
      >
        {label}
      </button>
    );
  }

  createDisabledPauseButton(label, duration) {
    return (
      <button
        className="button button--pause-disabled"
        onClick={e => this.pauseExtension(e, duration)}
        disabled
      >
        {label}
      </button>
    );
  }

  render() {
    return (
      <div className="pause-section">
        <p>Pause for...</p>
        {this.props.extensionStatus === ExtensionStatusTypes.ON && (
          <div className="duration-buttons">
            <div className="duration-buttons__row">
              {this.createPauseButton('5 Minutes', 5 * 60)}
              {this.createPauseButton('10 Minutes', 10 * 60)}
              {this.createPauseButton('15 Minutes', 15 * 60)}
            </div>
            <div className="duration-buttons__row">
              {this.createPauseButton('30 Minutes', 30 * 60)}
              {this.createPauseButton('1 Hour', 60 * 60)}
              {this.createPauseButton('3 Hours', 3 * 60 * 60)}
            </div>
          </div>
        )}
        {this.props.extensionStatus === ExtensionStatusTypes.OFF && (
          <div className="duration-buttons">
            <div className="duration-buttons__row">
              {this.createDisabledPauseButton('5 Minutes', 5 * 60)}
              {this.createDisabledPauseButton('10 Minutes', 10 * 60)}
              {this.createDisabledPauseButton('15 Minutes', 15 * 60)}
            </div>
            <div className="duration-buttons__row">
              {this.createDisabledPauseButton('30 Minutes', 30 * 60)}
              {this.createDisabledPauseButton('1 Hour', 60 * 60)}
              {this.createDisabledPauseButton('3 Hours', 3 * 60 * 60)}
            </div>
          </div>
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
    );
  }
}

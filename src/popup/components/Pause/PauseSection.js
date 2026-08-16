import React from 'react';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import ExtensionStatusTypes from '../../../enums/extensionStatus';
import SettingTypes from '../../../enums/settings';
import MessageTypes from '../../../enums/messages';
import { getHoldDurationMs } from '../../../utils/holdDuration';
import HoldPauseButton from './HoldPauseButton';
import PauseButton from './PauseButton';
import DisabledPauseButton from './DisabledPauseButton';
import CancelPauseButton from './CancelPauseButton';

// TODO: Add prop types
export default class PauseSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = { secondsToExpire: 0 };

    this.defaultDuration = 5 * 60;

    this.pauseExtension = this.pauseExtension.bind(this);
    this.unpauseExtension = this.unpauseExtension.bind(this);
    this.calculateTimeRemaining = this.calculateTimeRemaining.bind(this);
    this.startCountdownTimer = this.startCountdownTimer.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.extensionStatus === ExtensionStatusTypes.PAUSED &&
      prevProps.extensionStatus !== this.props.extensionStatus
    ) {
      this.calculateTimeRemaining();
      this.startCountdownTimer();
    }
  }

  pauseExtension(duration) {
    browser.runtime
      .sendMessage({
        type: MessageTypes.PAUSE_BLOCKER,
        duration,
      })
      .then(() => {
        this.startCountdownTimer();
        this.props.onChange();
      });
  }

  unpauseExtension(event) {
    event.preventDefault();
    browser.runtime
      .sendMessage({
        type: MessageTypes.UNPAUSE_BLOCKER,
      })
      .then(() => {
        clearInterval(this.countdownTimer);
        this.props.onChange();
        this.setState({ secondsToExpire: 0 });
      });
  }

  calculateTimeRemaining() {
    const currentDatetime = dayjs();
    const expiresAt = dayjs(this.props.pausedUntil);

    const secondsToExpire = expiresAt.diff(currentDatetime, 'second');

    if (secondsToExpire <= 0) {
      clearInterval(this.countdownTimer);
      this.props.onChange();
    }
    this.setState({ secondsToExpire });
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

  createDisabledPauseButton(label, duration) {
    return (
      <button
        className="button button--pause-disabled"
        onClick={() => this.pauseExtension(duration)}
        disabled
      >
        {label}
      </button>
    );
  }

  getSetting(key) {
    return this.props.extensionSettings.find(item => item.key === key);
  }

  showPauseButtonsSettingIsOff() {
    const setting = this.getSetting(SettingTypes.SHOW_PAUSE_BUTTONS_IN_POPUP);

    if (setting === undefined) {
      return false;
    }

    return setting.value === SettingTypes.OFF;
  }

  holdToConfirmSettingIsOn() {
    const setting = this.getSetting(SettingTypes.HOLD_TO_CONFIRM_PAUSE);

    if (setting === undefined) {
      return false;
    }

    return setting.value === SettingTypes.ON;
  }

  render() {
    if (this.showPauseButtonsSettingIsOff()) {
      return false;
    }

    const holdDuration = getHoldDurationMs(this.props.pauseCount);
    const holdToConfirm = this.holdToConfirmSettingIsOn();

    const pauseOptions = [
      { label: '5 Minutes', duration: 5 * 60 },
      { label: '10 Minutes', duration: 10 * 60 },
      { label: '15 Minutes', duration: 15 * 60 },
      { label: '30 Minutes', duration: 30 * 60 },
      { label: '1 Hour', duration: 60 * 60 },
      { label: '3 Hours', duration: 3 * 60 * 60 },
    ];

    const pauseButton = (option) => (holdToConfirm ? (
      <HoldPauseButton
        key={option.label}
        label={option.label}
        duration={option.duration}
        holdDuration={holdDuration}
        onConfirm={this.pauseExtension}
      />
    ) : (
      <PauseButton
        key={option.label}
        label={option.label}
        duration={option.duration}
        onClick={this.pauseExtension}
      />
    ));

    return (
      <div className="pause-section">
        {this.props.extensionStatus === ExtensionStatusTypes.ON && (
          <div className="duration-buttons">
            <p className="pause-section__title">Pause for...</p>
            <div className="duration-buttons__row">
              {pauseOptions.slice(0, 3).map(pauseButton)}
            </div>
            <div className="duration-buttons__row">
              {pauseOptions.slice(3).map(pauseButton)}
            </div>
          </div>
        )}
        {this.props.extensionStatus === ExtensionStatusTypes.OFF && (
          <div className="duration-buttons">
            <div className="duration-buttons__row">
              <DisabledPauseButton label="5 Minutes" />
              <DisabledPauseButton label="10 Minutes" />
              <DisabledPauseButton label="15 Minutes" />
            </div>
            <div className="duration-buttons__row">
              <DisabledPauseButton label="30 Minutes" />
              <DisabledPauseButton label="1 Hour" />
              <DisabledPauseButton label="3 Hours" />
            </div>
          </div>
        )}
        {this.props.extensionStatus === ExtensionStatusTypes.PAUSED && (
          <CancelPauseButton
            onClick={this.unpauseExtension}
            remainingTime={this.remainingTime()}
          />
        )}
      </div>
    );
  }
}

PauseSection.propTypes = {
  extensionStatus: PropTypes.string,
  pausedUntil: PropTypes.string,
  pauseCount: PropTypes.number,
  extensionSettings: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
};

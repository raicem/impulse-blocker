import React from 'react';
import PropTypes from 'prop-types';

import { MIN_HOLD_DURATION_MS } from '../../../utils/holdDuration';

export default class HoldPauseButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = { holding: false, progress: 0 };

    this.startHold = this.startHold.bind(this);
    this.endHold = this.endHold.bind(this);
    this.cancelHold = this.cancelHold.bind(this);
    this.updateProgress = this.updateProgress.bind(this);
    this.completeHold = this.completeHold.bind(this);
  }

  componentWillUnmount() {
    this.stopHoldTimer();
  }

  stopHoldTimer() {
    if (this.holdTimer !== null) {
      clearInterval(this.holdTimer);
      this.holdTimer = null;
    }
  }

  startHold() {
    if (this.state.holding) {
      return;
    }

    this.holdStartedAt = Date.now();
    this.setState({ holding: true, progress: 0 });
    this.holdTimer = setInterval(this.updateProgress, 100);
  }

  updateProgress() {
    const progress = Math.min(
      (Date.now() - this.holdStartedAt) / this.props.holdDuration,
      1,
    );

    this.setState({ progress });

    if (progress >= 1) {
      this.completeHold();
    }
  }

  completeHold() {
    this.stopHoldTimer();
    this.setState({ holding: false, progress: 0 });
    this.props.onConfirm(this.props.duration);
  }

  endHold() {
    if (this.state.holding) {
      this.cancelHold();
    }
  }

  cancelHold() {
    this.stopHoldTimer();
    this.setState({ holding: false, progress: 0 });
  }

  render() {
    const { label } = this.props;
    const { holding, progress } = this.state;

    const secondsLeft = Math.max(
      Math.ceil(((1 - progress) * this.props.holdDuration) / 1000),
      0,
    );

    return (
      <button
        type="button"
        className={`button button--pause${holding ? ' button--pause-holding' : ''}`}
        onPointerDown={this.startHold}
        onPointerUp={this.endHold}
        onPointerLeave={this.endHold}
        onPointerCancel={this.cancelHold}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.startHold();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            this.endHold();
          }
        }}
        onBlur={this.cancelHold}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span
          className="button--pause__fill"
          style={{ width: `${progress * 100}%` }}
        />
        <span className="button--pause__label" aria-hidden={holding}>
          {label}
        </span>
        {holding && (
          <span className="button--pause__countdown">
            {`${secondsLeft}s`}
          </span>
        )}
      </button>
    );
  }
}

HoldPauseButton.defaultProps = {
  holdDuration: MIN_HOLD_DURATION_MS,
};

HoldPauseButton.propTypes = {
  label: PropTypes.string,
  duration: PropTypes.number,
  holdDuration: PropTypes.number,
  onConfirm: PropTypes.func,
};

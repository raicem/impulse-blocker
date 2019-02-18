import React from 'react';
import PropTypes from 'prop-types';

export default function CancelPauseButton(props) {
  return (
    <button className="button button--unpause" onClick={e => props.onClick(e)}>
      {`Cancel Pause - ${props.remainingTime}`}
    </button>
  );
}

CancelPauseButton.propTypes = {
  onClick: PropTypes.func,
  remainingTime: PropTypes.string,
};

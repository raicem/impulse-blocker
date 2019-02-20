import React from 'react';
import PropTypes from 'prop-types';

export default function PauseButton(props) {
  return (
    <button
      className="button button--pause"
      onClick={e => props.onClick(e, props.duration)}
    >
      {props.label}
    </button>
  );
}

PauseButton.propTypes = {
  label: PropTypes.string,
  onClick: PropTypes.func,
  duration: PropTypes.number,
};

import React from 'react';
import PropTypes from 'prop-types';

export default function DisabledPauseButton(props) {
  return (
    <button className="button button--pause-disabled" disabled>
      {props.label}
    </button>
  );
}

DisabledPauseButton.propTypes = {
  label: PropTypes.string,
};

import React from 'react';
import PropTypes from 'prop-types';

export default function ExtensionStatusButton(props) {
  return (
    <div className="extension-status__button">
      <button className="button" onClick={props.onClick}>
        {props.value}
      </button>
    </div>
  );
}

ExtensionStatusButton.propTypes = {
  onClick: PropTypes.func,
  value: PropTypes.string,
};

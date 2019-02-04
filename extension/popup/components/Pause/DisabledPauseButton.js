import React from 'react';

export default function DisabledPauseButton(props) {
  return (
    <button className="button button--pause-disabled" disabled>
      {props.label}
    </button>
  );
}

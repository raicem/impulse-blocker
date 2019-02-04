import React from 'react';

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

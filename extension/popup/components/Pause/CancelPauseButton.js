import React from 'react';

export default function CancelPauseButton(props) {
  return (
    <button className="button button--unpause" onClick={e => props.onClick(e)}>
      {`Cancel Pause - ${props.remainingTime}`}
    </button>
  );
}

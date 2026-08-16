import React from 'react';
import PropTypes from 'prop-types';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import ExtenisonStatusButton from './ExtensionStatusButton';

export default function ExtensionStatus(props) {
  return (
    <div>
      {props.status === ExtensionStatusTypes.ON && (
        <div className="extension-status extension-status--on">
          <span className="extension-status__dot" aria-hidden="true" />
          <div className="extension-status__text">
            <h2 className="extension-status__title">Blocker is on</h2>
            <p>Blocked sites will not be accessible.</p>
          </div>
          <ExtenisonStatusButton
            onClick={() => props.onStatusUpdate(ExtensionStatusTypes.OFF)}
            value="Turn blocker off"
          />
        </div>
      )}
      {props.status === ExtensionStatusTypes.OFF && (
        <div className="extension-status extension-status--off">
          <span className="extension-status__dot" aria-hidden="true" />
          <div className="extension-status__text">
            <h2 className="extension-status__title">Blocker is off</h2>
            <p>Blocked sites will open as usual.</p>
          </div>
          <ExtenisonStatusButton
            onClick={() => props.onStatusUpdate(ExtensionStatusTypes.ON)}
            value="Turn blocker on"
          />
        </div>
      )}
      {props.status === ExtensionStatusTypes.PAUSED && (
        <div className="extension-status extension-status--paused">
          <span className="extension-status__dot" aria-hidden="true" />
          <div className="extension-status__text">
            <h2 className="extension-status__title">Blocker is paused</h2>
            <p>Blocked sites will open as usual while the blocker is paused.</p>
          </div>
          <ExtenisonStatusButton
            onClick={() => props.onStatusUpdate(ExtensionStatusTypes.ON)}
            value="Cancel pause"
          />
        </div>
      )}
    </div>
  );
}

ExtensionStatus.propTypes = {
  status: PropTypes.string,
  onStatusUpdate: PropTypes.func,
};

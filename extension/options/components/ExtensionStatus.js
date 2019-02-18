import React from 'react';
import PropTypes from 'prop-types';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import ExtenisonStatusButton from './ExtensionStatusButton';

export default function ExtensionStatus(props) {
  return (
    <div>
      {props.status === ExtensionStatusTypes.ON && (
        <div className="extension-status extension-status--on">
          <div className="extension-status__text">
            <h2 className="extension-status__title">Blocker is On.</h2>
            <p>Blocked websites listed below will not be accessible.</p>
          </div>
          <ExtenisonStatusButton
            onClick={() => props.onStatusUpdate(ExtensionStatusTypes.OFF)}
            value="Turn Off Blocker"
          />
        </div>
      )}
      {props.status === ExtensionStatusTypes.OFF && (
        <div className="extension-status extension-status--off">
          <div className="extension-status__text">
            <h2 className="extension-status__title">Blocker is Off.</h2>
            <p>Blocked websites listed below will be accessible.</p>
          </div>
          <ExtenisonStatusButton
            onClick={() => props.onStatusUpdate(ExtensionStatusTypes.ON)}
            value="Turn On Blocker"
          />
        </div>
      )}
      {props.status === ExtensionStatusTypes.PAUSED && (
        <div className="extension-status extension-status--paused">
          <div className="extension-status__text">
            <h2 className="extension-status__title">Blocker is Paused.</h2>
            <p>Blocked websites listed below will be accessible.</p>
          </div>
          <ExtenisonStatusButton
            onClick={() => props.onStatusUpdate(ExtensionStatusTypes.ON)}
            value="Cancel Pause"
          />
        </div>
      )}
    </div>
  );
}

ExtensionStatus.propTypes = {};

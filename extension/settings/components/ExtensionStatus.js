import React from 'react';
import ExtensionStatusTypes from '../../enums/extensionStatus';

export default class ExtensionStatus extends React.Component {
  render() {
    return (
      <div>
        {this.props.status === ExtensionStatusTypes.ON && (
          <div className="extension-status extension-status--on">
            <div className="extension-status__text">
              <h2 className="extension-status__title">Blocker is On.</h2>
              <p>Blocked websites listed below will not be accessible.</p>
            </div>
            <div className="extension-status__button">
              <button
                className="button"
                onClick={() =>
                  this.props.onStatusUpdate(ExtensionStatusTypes.OFF)
                }
              >
                Turn Off Blocker
              </button>
            </div>
          </div>
        )}
        {this.props.status === ExtensionStatusTypes.OFF && (
          <div className="extension-status extension-status--off">
            <div className="extension-status__text">
              <h2 className="extension-status__title">Blocker is Off.</h2>
              <p>Blocked websites listed below will be accessible.</p>
            </div>
            <div className="extension-status__button">
              <button
                className="button"
                onClick={() =>
                  this.props.onStatusUpdate(ExtensionStatusTypes.ON)
                }
              >
                Turn On Blocker
              </button>
            </div>
          </div>
        )}
        {this.props.status === ExtensionStatusTypes.PAUSED && (
          <div className="extension-status extension-status--paused">
            <div className="extension-status__text">
              <h2 className="extension-status__title">Blocker is Paused.</h2>
              <p>Blocked websites listed below will be accessible.</p>
            </div>
            <div className="extension-status__button">
              <button
                className="button"
                onClick={() =>
                  this.props.onStatusUpdate(ExtensionStatusTypes.ON)
                }
              >
                Cancel Pause
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

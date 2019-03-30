import React from 'react';
import ExtensionStatusTypes from '../../enums/extensionStatus';
import MessageTypes from '../../enums/messages';
import PauseSection from './Pause/PauseSection';
import SettingTypes from '../../enums/settings';

export default class ExtensionStatus extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      extensionStatus: null,
      pausedUntil: null,
      extensionSettings: [],
    };

    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.updateExtensionStatus = this.updateExtensionStatus.bind(this);
    this.getSetting = this.getSetting.bind(this);
    this.showOnOfButtonSettingIsOn = this.showOnOfButtonSettingIsOn.bind(this);
  }

  componentDidMount() {
    browser.runtime
      .sendMessage({
        type: MessageTypes.GET_EXTENSION_STATUS,
      })
      .then(statusResponse => {
        this.setState({
          extensionStatus: statusResponse.extensionStatus,
          pausedUntil: statusResponse.pausedUntil,
          extensionSettings: statusResponse.extensionSettings,
        });
      });
  }

  handleStatusChange(extensionStatus) {
    browser.runtime
      .sendMessage({
        type: MessageTypes.UPDATE_EXTENSION_STATUS,
        parameter: extensionStatus,
      })
      .then(() => {
        this.setState({ extensionStatus });
      });
  }

  updateExtensionStatus() {
    browser.runtime
      .sendMessage({
        type: MessageTypes.GET_EXTENSION_STATUS,
      })
      .then(statusResponse => {
        this.setState({
          extensionStatus: statusResponse.extensionStatus,
          pausedUntil: statusResponse.pausedUntil,
        });
      });
  }

  getSetting(key) {
    return this.state.extensionSettings.find(item => item.key === key);
  }

  showOnOfButtonSettingIsOn() {
    const setting = this.getSetting(SettingTypes.SHOW_ON_OFF_BUTTONS_IN_POPUP);

    if (setting === undefined) {
      return false;
    }

    return setting.value === SettingTypes.ON;
  }

  render() {
    return (
      <div>
        {this.showOnOfButtonSettingIsOn() && (
          <form>
            <div className="form-group">
              <input
                type="radio"
                name="status"
                id="on"
                value="on"
                checked={this.state.extensionStatus === ExtensionStatusTypes.ON}
                onChange={() =>
                  this.handleStatusChange(ExtensionStatusTypes.ON)
                }
              />
              <label htmlFor="on">On</label>
            </div>
            <div className="form-group">
              <input
                type="radio"
                name="status"
                id="off"
                value="off"
                checked={
                  this.state.extensionStatus === ExtensionStatusTypes.OFF
                }
                onChange={() =>
                  this.handleStatusChange(ExtensionStatusTypes.OFF)
                }
              />
              <label htmlFor="off">Off</label>
            </div>
          </form>
        )}
        <PauseSection
          pausedUntil={this.state.pausedUntil}
          extensionStatus={this.state.extensionStatus}
          onChange={this.updateExtensionStatus}
        />
      </div>
    );
  }
}

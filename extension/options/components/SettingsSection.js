import React from 'react';
import MessageTypes from '../../enums/messages';
import SettingTypes from '../../enums/settings';

export default class SettingsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      extensionSettings: [],
    };

    this.handleOnOffButtonSettingsChange = this.handleOnOffButtonSettingsChange.bind(
      this,
    );
  }

  async componentDidMount() {
    const statusResponse = await browser.runtime.sendMessage({
      type: MessageTypes.GET_EXTENSION_STATUS,
    });

    this.setState({
      extensionSettings: statusResponse.extensionSettings,
    });
  }

  async handleOnOffButtonSettingsChange(e) {
    e.preventDefault();

    let value = SettingTypes.ON;
    if (this.onOffButtonSetting() === SettingTypes.ON) {
      value = SettingTypes.OFF;
    }

    const response = await browser.runtime.sendMessage({
      type: MessageTypes.UPDATE_EXTENSION_SETTING,
      key: SettingTypes.SHOW_ON_OFF_BUTTONS_IN_POPUP,
      value,
    });

    if (response !== false) {
      this.setState({
        extensionSettings: response,
      });
    }
  }

  onOffButtonSetting() {
    const setting = this.state.extensionSettings.find(
      item => item.key === SettingTypes.SHOW_ON_OFF_BUTTONS_IN_POPUP,
    );

    if (setting === undefined) {
      return false;
    }

    return setting.value;
  }

  render() {
    return (
      <div className="settings">
        <h3 className="settings__header">Extension Settings</h3>
        <hr />
        <form>
          <label htmlFor="onOffButton">Show On/Off Buttons in Popup</label>
          <input
            name="onOffButton"
            type="checkbox"
            checked={this.onOffButtonSetting() === SettingTypes.ON}
            onChange={e => {
              this.handleOnOffButtonSettingsChange(e);
            }}
          />
        </form>
      </div>
    );
  }
}

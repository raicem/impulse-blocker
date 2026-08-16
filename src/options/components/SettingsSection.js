import React from 'react';
import MessageTypes from '../../enums/messages';
import SettingTypes from '../../enums/settings';

export default class SettingsSection extends React.Component {
  constructor(props) {
    super(props);

    this.state = { extensionSettings: [] };

    this.handleSettingsChange = this.handleSettingsChange.bind(this);
    this.isSettingChecked = this.isSettingChecked.bind(this);
    this.getSettingValue = this.getSettingValue.bind(this);
  }

  componentDidMount() {
    browser.runtime
      .sendMessage({
        type: MessageTypes.GET_EXTENSION_STATUS,
      })
      .then((statusResponse) => {
        this.setState({
          extensionSettings: statusResponse.extensionSettings,
        });
      });
  }

  handleSettingsChange(e, key) {
    e.preventDefault();

    let value = SettingTypes.ON;

    if (this.getSettingValue(key) === SettingTypes.ON) {
      value = SettingTypes.OFF;
    }

    browser.runtime
      .sendMessage({
        type: MessageTypes.UPDATE_EXTENSION_SETTING,
        key,
        value,
      })
      .then((response) => {
        this.setState({
          extensionSettings: response,
        });
      });
  }

  getSettingValue(settingKey) {
    const setting = this.state.extensionSettings.find(
      (item) => item.key === settingKey,
    );

    if (setting === undefined) {
      return false;
    }

    return setting.value;
  }

  isSettingChecked(settingKey) {
    return this.getSettingValue(settingKey) === SettingTypes.ON;
  }

  render() {
    return (
      <div className="settings">
        <h3 className="settings__header">Settings</h3>
        <hr />
        <form>
          <div className="form-group">
            <input
              id="onOffButton"
              name="onOffButton"
              type="checkbox"
              checked={this.isSettingChecked(
                SettingTypes.SHOW_ON_OFF_BUTTONS_IN_POPUP,
              )}
              onChange={(e) => {
                this.handleSettingsChange(
                  e,
                  SettingTypes.SHOW_ON_OFF_BUTTONS_IN_POPUP,
                );
              }}
            />
            <div className="form-group__text">
              <label htmlFor="onOffButton">Show on/off buttons in popup</label>
              <p className="form-group__description">
                Adds buttons to turn the blocker on and off from the popup.
              </p>
            </div>
          </div>
          <div className="form-group">
            <input
              id="pauseButtons"
              name="pauseButtons"
              type="checkbox"
              checked={this.isSettingChecked(
                SettingTypes.SHOW_PAUSE_BUTTONS_IN_POPUP,
              )}
              onChange={(e) => {
                this.handleSettingsChange(
                  e,
                  SettingTypes.SHOW_PAUSE_BUTTONS_IN_POPUP,
                );
              }}
            />
            <div className="form-group__text">
              <label htmlFor="pauseButtons">Show pause buttons in popup</label>
              <p className="form-group__description">
                Adds buttons to pause the blocker for a set time from the
                popup.
              </p>
            </div>
          </div>
          <div className="form-group">
            <input
              id="holdToConfirm"
              name="holdToConfirm"
              type="checkbox"
              checked={this.isSettingChecked(
                SettingTypes.HOLD_TO_CONFIRM_PAUSE,
              )}
              onChange={(e) => {
                this.handleSettingsChange(
                  e,
                  SettingTypes.HOLD_TO_CONFIRM_PAUSE,
                );
              }}
            />
            <div className="form-group__text">
              <label htmlFor="holdToConfirm">Hold to confirm pause</label>
              <p className="form-group__description">
                Requires holding a pause button before the pause starts.
              </p>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

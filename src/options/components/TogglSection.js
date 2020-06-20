import React, { useEffect, useState } from 'react';
import StorageHandler from '../../storage/StorageHandler';

/**
 * @typedef {Object} TogglConfig
 * @property {boolean} enabled
 * @property {string} token
 * @property {string[]} breakTags
 */

export default function TogglSection() {
  /**
   * @type {[TogglConfig, (togglConfig: TogglConfig) => void]}
   */
  const [config, setConfig] = useState();
  console.log('config', config);

  useEffect(() => {
    StorageHandler.getTogglConfig().then(setConfig);
  }, []);

  /**
   * @param {TogglConfig} config
   */
  async function updateConfig(config) {
    await StorageHandler.setTogglConfig(config);
    setConfig(config);
  }

  return (
    <div>
      <h3 className="settings__header">Toggl Integration Settings</h3>
      <hr />
      {config &&
        <form>
          <div className="form-group">
            <label htmlFor="enabledButton">Enable Toggl integration</label>
            <input
              name="enabledButton"
              type="checkbox"
              checked={config.enabled}
              onChange={e => updateConfig({ ...config, enabled: !!e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="token">Toggl API token</label>
            <input
              name="token"
              type="text"
              checked={config.token}
              onChange={e => updateConfig({ ...config, token: e.target.value })}
            />
          </div>
        </form>
      }
    </div>
  );
}
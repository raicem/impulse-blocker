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

  const breakTagsToText = () => config.breakTags.join(', ');
  /**
   * @param {string} text
   * @returns {string[]}
   */
  const textToBreakTags = text => text.split(',')
    .map(t => t.trim())
    .filter(t => t);

  return (
    <div>
      <h3 className="toggl__header">Toggl Integration Settings</h3>
      <p className="toggl__subheader">
        Allow access to blocked websites when you're tracking a break in
        <a className="toggl__link" href="https://toggl.com" target="_blank">Toggl</a>
      </p>
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
              value={config.token}
              onChange={e => updateConfig({ ...config, token: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="mr-2" htmlFor="breakTags">Break tags (comma separated)</label>
            <input
              name="breakTags"
              type="text"
              value={breakTagsToText()}
              onChange={e => updateConfig({ ...config, token: textToBreakTags(e.target.value) })}
            />
          </div>
        </form>
      }
    </div>
  );
}
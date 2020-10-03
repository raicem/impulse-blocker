import React, { useEffect, useState } from 'react';
import StorageHandler from '../../storage/StorageHandler';

/**
 * @typedef {Object} TogglConfig
 * @property {boolean} enabled
 * @property {string} token
 * @property {string[]} breakTags
 */

/**
 * @param {TogglConfig} config
 */
async function updateConfig(config) {
  await StorageHandler.setTogglConfig(config);
  setConfig(config);
}

/**
 * @param {string[]} breakTags
 * @returns {string}
 */
const breakTagsToText = (breakTags) => breakTags.join(', ');

/**
 * @param {string} text
 * @returns {string[]}
 */
const textToBreakTags = text => text.split(',')
  .map(t => t.trim())
  .filter(t => t);

export default function TogglSection() {
  const [enabled, setEnabled] = useState();
  const [token, setToken] = useState();
  const [breakTagsText, setBreakTagsText] = useState();
  const [loading, setLoading] = useState(true);

  const loadConfig = () => {
    StorageHandler.getTogglConfig().then(config => {
      setEnabled(config.enabled);
      setToken(config.token);
      setBreakTagsText(breakTagsToText(config.breakTags));
      setLoading(false);
    });
  };

  const save = async () => {
    setLoading(true);
    await StorageHandler.setTogglConfig({
      enabled,
      token,
      breakTags: textToBreakTags(breakTagsText),
    });
    loadConfig();
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <div className="toggl">
      <h3 className="toggl__header">Toggl Integration Settings</h3>
      <p className="toggl__subheader">
        Allow access to blocked websites when you're tracking a break in
        <a className="toggl__link" href="https://toggl.com" target="_blank">Toggl</a>
      </p>
      <hr />
      {!loading &&
        <form onSubmit={() => save()}>
          <div className="form-group">
            <label htmlFor="enabledButton">Enable Toggl integration</label>
            <input
              name="enabledButton"
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(!!e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="token">Toggl API token</label>
            <input
              className="toggl__text-input"
              type="text"
              value={token}
              onChange={e => setToken(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="breakTags">Break tags (comma separated)</label>
            <input
              className="toggl__text-input"
              name="breakTags"
              type="text"
              value={breakTagsText}
              onChange={e => setBreakTagsText(e.target.value)}
            />
          </div>
          <input className="button button--black toggl__save" type="submit" value="Save" />
        </form>
      }
    </div>
  );
}
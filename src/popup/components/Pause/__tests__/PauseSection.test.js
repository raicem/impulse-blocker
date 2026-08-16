import React from 'react';
import TestRenderer from 'react-test-renderer';

import ExtensionStatusTypes from '../../../../enums/extensionStatus';
import SettingTypes from '../../../../enums/settings';
import PauseSection from '../PauseSection';
import HoldPauseButton from '../HoldPauseButton';

global.browser = {
  runtime: {
    sendMessage: jest.fn(),
  },
};

function renderPauseSection(extensionSettings = []) {
  return TestRenderer.create(
    <PauseSection
      extensionStatus={ExtensionStatusTypes.ON}
      pausedUntil={null}
      pauseCount={0}
      extensionSettings={extensionSettings}
      onChange={() => {}}
    />,
  );
}

test('it renders hold buttons when the hold to confirm setting is on', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.HOLD_TO_CONFIRM_PAUSE, value: SettingTypes.ON },
  ]);

  expect(renderer.root.findAllByType(HoldPauseButton).length).toBe(6);
});

test('it renders instant pause buttons by default when the setting is missing', () => {
  const renderer = renderPauseSection([]);

  expect(renderer.root.findAllByType(HoldPauseButton).length).toBe(0);
});

test('it renders instant pause buttons when the hold to confirm setting is off', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.HOLD_TO_CONFIRM_PAUSE, value: SettingTypes.OFF },
  ]);

  expect(renderer.root.findAllByType(HoldPauseButton).length).toBe(0);
  expect(renderer.root.findAllByType('button').length).toBe(6);
});

test('it does not render pause buttons when the pause buttons setting is off', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.SHOW_PAUSE_BUTTONS_IN_POPUP, value: SettingTypes.OFF },
  ]);

  expect(renderer.root.findAllByType('button').length).toBe(0);
});

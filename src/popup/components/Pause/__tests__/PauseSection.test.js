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

jest.useFakeTimers();

afterEach(() => {
  jest.clearAllTimers();
});

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

test('it shows a hold notice after a pause button is released early', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.HOLD_TO_CONFIRM_PAUSE, value: SettingTypes.ON },
  ]);

  const notice = renderer.root.findByProps({ className: 'pause-section__notice' });
  expect(notice.children.join('')).toBe('');

  const button = renderer.root.findAllByType('button')[0];
  button.props.onPointerDown();
  button.props.onPointerUp();

  expect(notice.children.join('')).toBe('Press and hold a button to start the pause.');
  expect(notice.props.className).toContain('pause-section__notice--visible');
});

test('it hides the hold notice after five seconds', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.HOLD_TO_CONFIRM_PAUSE, value: SettingTypes.ON },
  ]);

  const button = renderer.root.findAllByType('button')[0];
  button.props.onPointerDown();
  button.props.onPointerUp();

  const notice = renderer.root.findByProps({ className: 'pause-section__notice pause-section__notice--visible' });

  jest.advanceTimersByTime(5000);

  expect(notice.children.join('')).toBe('');
  expect(notice.props.className).not.toContain('pause-section__notice--visible');
});

test('it does not hide the hold notice when a hold is released early again', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.HOLD_TO_CONFIRM_PAUSE, value: SettingTypes.ON },
  ]);

  const button = renderer.root.findAllByType('button')[0];
  button.props.onPointerDown();
  button.props.onPointerUp();

  jest.advanceTimersByTime(4000);
  button.props.onPointerDown();
  button.props.onPointerUp();
  jest.advanceTimersByTime(4000);

  const notice = renderer.root.findByProps({ className: 'pause-section__notice pause-section__notice--visible' });
  expect(notice.children.join('')).toBe('Press and hold a button to start the pause.');
});

test('it does not render pause buttons when the pause buttons setting is off', () => {
  const renderer = renderPauseSection([
    { key: SettingTypes.SHOW_PAUSE_BUTTONS_IN_POPUP, value: SettingTypes.OFF },
  ]);

  expect(renderer.root.findAllByType('button').length).toBe(0);
});

test('starting the countdown again replaces the existing interval', () => {
  const renderer = renderPauseSection();
  const pauseSection = renderer.root.findByType(PauseSection).instance;

  pauseSection.startCountdownTimer();
  pauseSection.startCountdownTimer();

  expect(jest.getTimerCount()).toBe(1);

  renderer.unmount();
  expect(jest.getTimerCount()).toBe(0);
});

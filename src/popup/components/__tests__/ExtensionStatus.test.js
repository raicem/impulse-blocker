import dayjs from 'dayjs';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import ExtensionStatusTypes from '../../../enums/extensionStatus';
import SettingTypes from '../../../enums/settings';
import ExtensionStatus from '../ExtensionStatus';
import HoldPauseButton from '../Pause/HoldPauseButton';

global.browser = {
  runtime: {
    sendMessage: jest.fn(),
  },
};

const extensionSettings = [
  { key: SettingTypes.HOLD_TO_CONFIRM_PAUSE, value: SettingTypes.ON },
];

function statusResponse(pauseCount) {
  return {
    extensionStatus: ExtensionStatusTypes.ON,
    pausedUntil: null,
    pauseCount,
    extensionSettings,
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-08-31T12:00:00.000Z'));
  global.browser.runtime.sendMessage.mockReset();
});

afterEach(() => {
  jest.useRealTimers();
});

test('an open popup resets the hold duration at midnight', async () => {
  global.browser.runtime.sendMessage
    .mockResolvedValueOnce(statusResponse(4))
    .mockResolvedValueOnce(statusResponse(0));

  let renderer;
  await act(async () => {
    renderer = TestRenderer.create(<ExtensionStatus />);
  });

  expect(renderer.root.findAllByType(HoldPauseButton)[0].props.holdDuration).toBe(20000);

  const now = dayjs();
  const millisecondsUntilTomorrow = now.add(1, 'day').startOf('day').diff(now);

  await act(async () => {
    jest.advanceTimersByTime(millisecondsUntilTomorrow);
  });

  expect(global.browser.runtime.sendMessage).toHaveBeenCalledTimes(2);
  expect(renderer.root.findAllByType(HoldPauseButton)[0].props.holdDuration).toBe(3000);

  renderer.unmount();
});

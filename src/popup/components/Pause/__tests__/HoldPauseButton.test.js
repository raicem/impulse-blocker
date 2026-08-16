import React from 'react';
import TestRenderer from 'react-test-renderer';

import HoldPauseButton from '../HoldPauseButton';
import { MIN_HOLD_DURATION_MS } from '../../../../utils/holdDuration';

jest.useFakeTimers();

function renderButton(props = {}) {
  const onConfirm = jest.fn();
  const renderer = TestRenderer.create(
    <HoldPauseButton
      label="5 Minutes"
      duration={300}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  const button = renderer.root.findByType('button');

  return { renderer, button, onConfirm };
}

test('it renders the label', () => {
  const { renderer, button } = renderButton();

  expect(button.props.className).toContain('button--pause');
  const label = renderer.root.findByProps({ className: 'button--pause__label' });
  expect(label.children).toContain('5 Minutes');
});

test('it pauses when the button is held for the full duration', () => {
  const { button, onConfirm } = renderButton();

  button.props.onPointerDown();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS);

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onConfirm).toHaveBeenCalledWith(300);
});

test('it does not pause when the button is released early', () => {
  const { button, onConfirm } = renderButton();

  button.props.onPointerDown();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS / 2);
  button.props.onPointerUp();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS);

  expect(onConfirm).not.toHaveBeenCalled();
});

test('it does not pause when the pointer leaves the button early', () => {
  const { button, onConfirm } = renderButton();

  button.props.onPointerDown();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS / 2);
  button.props.onPointerLeave();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS);

  expect(onConfirm).not.toHaveBeenCalled();
});

test('it can be paused again after cancelling a hold', () => {
  const { button, onConfirm } = renderButton();

  button.props.onPointerDown();
  jest.advanceTimersByTime(1000);
  button.props.onPointerUp();

  button.props.onPointerDown();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS);

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test('it replaces the label with the hold countdown while holding', () => {
  const { renderer, button } = renderButton();

  button.props.onPointerDown();
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS / 2);

  const label = renderer.root.findByProps({ className: 'button--pause__label' });
  expect(label.props['aria-hidden']).toBe(true);

  const countdown = renderer.root.findByProps({ className: 'button--pause__countdown' });
  expect(countdown.children.join('')).toBe('2s');
});

test('it shows the label again after a cancelled hold', () => {
  const { renderer, button } = renderButton();

  button.props.onPointerDown();
  jest.advanceTimersByTime(1000);
  button.props.onPointerUp();

  const label = renderer.root.findByProps({ className: 'button--pause__label' });
  expect(label.props['aria-hidden']).toBe(false);
});

test('it supports holding with the keyboard', () => {
  const { button, onConfirm } = renderButton();

  button.props.onKeyDown({ key: ' ', preventDefault: jest.fn() });
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS);

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test('it cancels a keyboard hold on key up', () => {
  const { button, onConfirm } = renderButton();

  button.props.onKeyDown({ key: 'Enter', preventDefault: jest.fn() });
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS / 2);
  button.props.onKeyUp({ key: 'Enter' });
  jest.advanceTimersByTime(MIN_HOLD_DURATION_MS);

  expect(onConfirm).not.toHaveBeenCalled();
});

test('it respects the holdDuration prop', () => {
  const { button, onConfirm } = renderButton({ holdDuration: 10000 });

  button.props.onPointerDown();
  jest.advanceTimersByTime(10000);

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test('it does not complete before the holdDuration prop has elapsed', () => {
  const { button, onConfirm } = renderButton({ holdDuration: 10000 });

  button.props.onPointerDown();
  jest.advanceTimersByTime(9999);

  expect(onConfirm).not.toHaveBeenCalled();
});

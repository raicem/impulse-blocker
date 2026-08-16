import {
  getHoldDurationMs,
  MAX_HOLD_DURATION_MS,
  MIN_HOLD_DURATION_MS,
} from '../holdDuration';

test('first pause of the day holds for the minimum duration', () => {
  expect(getHoldDurationMs(0)).toBe(MIN_HOLD_DURATION_MS);
  expect(getHoldDurationMs(-1)).toBe(MIN_HOLD_DURATION_MS);
});

test('second pause of the day holds for 5 seconds', () => {
  expect(getHoldDurationMs(1)).toBe(5000);
});

test('third pause of the day holds for 10 seconds', () => {
  expect(getHoldDurationMs(2)).toBe(10000);
});

test('duration grows by 5 seconds for every pause after the third', () => {
  expect(getHoldDurationMs(3)).toBe(15000);
  expect(getHoldDurationMs(4)).toBe(20000);
  expect(getHoldDurationMs(5)).toBe(25000);
});

test('duration is capped at the maximum', () => {
  expect(getHoldDurationMs(12)).toBe(MAX_HOLD_DURATION_MS);
  expect(getHoldDurationMs(20)).toBe(MAX_HOLD_DURATION_MS);
  expect(getHoldDurationMs(100)).toBe(MAX_HOLD_DURATION_MS);
});

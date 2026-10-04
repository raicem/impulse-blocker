import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import DomainButton from '../DomainButton';
import MessageTypes from '../../../enums/messages';

beforeEach(() => {
  global.browser = { runtime: { sendMessage: jest.fn() } };
});

async function renderDomainButton(domain, matchingDomains) {
  global.browser.runtime.sendMessage.mockImplementation(async (message) => (
    message.type === MessageTypes.GET_CURRENT_DOMAIN ? domain : matchingDomains
  ));
  let renderer;
  await act(async () => { renderer = TestRenderer.create(<DomainButton />); });
  return renderer;
}

test('a subdomain blocked by a parent directs the user to settings', async () => {
  const renderer = await renderDomainButton('music.youtube.com', ['youtube.com']);
  expect(renderer.root.findByType('p').children.join('')).toBe('Blocked by youtube.com');
  expect(renderer.root.findByType('button').children.join('')).toBe('Manage blocked sites');
  renderer.unmount();
});

test('removing an explicit rule cannot offer access when a parent also blocks it', async () => {
  const renderer = await renderDomainButton('music.youtube.com', ['music.youtube.com', 'youtube.com']);
  expect(renderer.root.findByType('button').children.join('')).toBe('Manage blocked sites');
  renderer.unmount();
});

test.each([
  [[], 'Block music.youtube.com'],
  [['music.youtube.com'], 'Allow music.youtube.com'],
])('explicit rule actions remain available for %j', async (matchingDomains, label) => {
  const renderer = await renderDomainButton('music.youtube.com', matchingDomains);
  expect(renderer.root.findByType('button').children.join('')).toBe(label);
  renderer.unmount();
});

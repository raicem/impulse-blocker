import React from 'react';
import TestRenderer from 'react-test-renderer';
import DomainListItem from '../DomainListItem';

test.each([undefined, true, false])('the checkbox reflects includeSubdomains=%s', (includeSubdomains) => {
  const onScopeChange = jest.fn();
  const renderer = TestRenderer.create(
    <DomainListItem domain="youtube.com" includeSubdomains={includeSubdomains} onScopeChange={onScopeChange} onClick={() => {}} />,
  );
  const checkbox = renderer.root.findByType('input');
  expect(checkbox.props.checked).toBe(includeSubdomains !== false);
  expect(checkbox.props['aria-label']).toBe('Include subdomains for youtube.com');
  checkbox.props.onChange({ target: { checked: false } });
  expect(onScopeChange).toHaveBeenCalledWith('youtube.com', false);
  renderer.unmount();
});

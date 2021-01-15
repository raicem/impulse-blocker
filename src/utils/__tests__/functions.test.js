import Website from '../../storage/Website';
import { createMatchPatterns } from '../functions';

test('it creates match patterns for site urls', () => {
  const websites = [Website.create('test.example.com'), Website.create('example.com')];

  const websitesAsMatchPatterns = createMatchPatterns(websites);
  expect(websitesAsMatchPatterns[0]).toBe('*://*.test.example.com/*');
  expect(websitesAsMatchPatterns[1]).toBe('*://*.example.com/*');
});

export function openOptionsPage() {
  browser.runtime.openOptionsPage();
  window.close();
}

export function redirectToBlockedPage(requestDetails) {
  if (['POST', 'PUT', 'PATCH'].includes(requestDetails.method)) {
    return {};
  }

  const original = encodeURIComponent(requestDetails.url);
  const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const interceptPage = `/resources/redirect.html?target=${original}&theme=${theme}`;

  return { redirectUrl: browser.runtime.getURL(interceptPage) };
}

export function createMatchPatterns(sites) {
  return sites.flatMap((site) => {
    if (site.includeSubdomains !== false) {
      return [`*://*.${site.domain}/*`];
    }

    return [`*://${site.domain}/*`, `*://www.${site.domain}/*`];
  });
}

// Both arguments use normalized domains, with the leading www. alias removed.
export function siteMatchesDomain(site, domain) {
  return domain === site.domain || (
    site.includeSubdomains !== false && domain.endsWith(`.${site.domain}`)
  );
}

export function getBlockedPageTarget(url) {
  const page = new URL(url);
  const blockedPage = new URL(browser.runtime.getURL('resources/redirect.html'));
  if (
    page.protocol !== blockedPage.protocol ||
    page.host !== blockedPage.host ||
    page.pathname !== blockedPage.pathname
  ) {
    return null;
  }
  return page.searchParams.get('target');
}

const messages = {
  GET_EXTENSION_STATUS: 'getExtensionStatus',
  GET_CURRENT_DOMAIN: 'getCurrentDomain',
  IS_DOMAIN_BLOCKED: 'isDomainBlocked',
  UPDATE_EXTENSION_STATUS: 'updateExtensionStatus',
  START_BLOCKING_DOMAIN: 'startBlockingDomain',
  START_ALLOWING_DOMAIN: 'startAllowingDomain',
  GET_BLOCKED_DOMAINS_LIST: 'getBlockedDomainsList',
  GET_BLOCKED_SITES_LIST: 'getBlockedSitesList',
  GET_MATCHING_BLOCKED_DOMAINS: 'getMatchingBlockedDomains',
  UPDATE_SUBDOMAIN_BLOCKING: 'updateSubdomainBlocking',
  PAUSE_BLOCKER: 'pauseBlocker',
  UNPAUSE_BLOCKER: 'unpauseBlocker',
  UPDATE_EXTENSION_SETTING: 'updateExtensionSetting',
};

Object.freeze(messages);

export default messages;

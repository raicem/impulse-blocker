import React from 'react';
import PropTypes from 'prop-types';

export default function DomainListItem({
  domain, includeSubdomains, onClick, onScopeChange, disabled,
}) {
  return (
    <li className="blocklist__item">
      <div className="blocklist__entry">
        <span className="blocklist__domain">{domain}</span>
        <label className="blocklist__scope">
          <input
            type="checkbox"
            checked={includeSubdomains !== false}
            disabled={disabled}
            aria-label={`Include subdomains for ${domain}`}
            onChange={(event) => onScopeChange(domain, event.target.checked)}
          />
          Include subdomains
        </label>
      </div>
      <button
        className="button button--ghost button--small"
        onClick={() => onClick(domain)}
        disabled={disabled}
      >
        Delete
      </button>
    </li>
  );
}

DomainListItem.propTypes = {
  domain: PropTypes.string,
  onClick: PropTypes.func,
  includeSubdomains: PropTypes.bool,
  onScopeChange: PropTypes.func,
  disabled: PropTypes.bool,
};

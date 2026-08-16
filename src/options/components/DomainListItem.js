import React from 'react';
import PropTypes from 'prop-types';

export default function DomainListItem({ domain, onClick }) {
  return (
    <li className="blocklist__item">
      <span className="blocklist__domain">{domain}</span>
      <button
        className="button button--ghost button--small"
        onClick={() => onClick(domain)}
      >
        Delete
      </button>
    </li>
  );
}

DomainListItem.propTypes = {
  domain: PropTypes.string,
  onClick: PropTypes.func,
};

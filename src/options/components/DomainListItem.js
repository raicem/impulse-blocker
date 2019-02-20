import React from 'react';
import PropTypes from 'prop-types';

export default function DomainListItem({ domain, onClick }) {
  return (
    <li className="blocklist__item" key={domain}>
      {domain}{' '}
      <button className="button button--black" onClick={() => onClick(domain)}>
        Delete
      </button>
    </li>
  );
}

DomainListItem.propTypes = {
  domain: PropTypes.string,
  onClick: PropTypes.func,
};

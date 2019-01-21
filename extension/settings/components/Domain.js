import React from 'react';
import PropTypes from 'prop-types';

export default function Domain({ domain, onClick }) {
  return (
    <li key={domain}>
      {domain} <button onClick={() => onClick(domain)}>Delete</button>
    </li>
  );
}

Domain.propTypes = {
  domain: PropTypes.string,
  onClick: PropTypes.func,
};

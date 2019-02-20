import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

import ExtensionStatus from './components/ExtensionStatus';
import DomainButton from './components/DomainButton';
import { openOptionsPage } from '../utils/functions';

function Popup() {
  return (
    <div>
      <header className="header">
        <a href="" className="header__options">
          <img className="options-icon" src={cogs} onClick={openOptionsPage} />
        </a>
        <h5 className="header__title">Impulse Blocker</h5>
      </header>
      <main>
        <ExtensionStatus />
        <DomainButton />
      </main>
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById('root'));

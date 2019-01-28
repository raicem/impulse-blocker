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
      <header>
        <a href="">
          <img className="options" src={cogs} onClick={openOptionsPage} />
        </a>
      </header>
      <main>
        <ExtensionStatus />
        <DomainButton />
      </main>
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById('root'));

import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

import ExtensionStatus from './components/ExtensionStatus';
import DomainButton from './components/DomainButton';

function Popup() {
  return (
    <div>
      <header>
        <img className="options" src={cogs} />
      </header>
      <main>
        <ExtensionStatus />
        <DomainButton />
      </main>
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById('root'));

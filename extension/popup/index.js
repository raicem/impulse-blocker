import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
<<<<<<< HEAD
      extensionStatus: 'on',
=======
      extensionStatus: 'off',
>>>>>>> bd3d0cd6cbb561452bac8b75ac6de342e65be536
      domain: '',
      isBlocked: false,
    };
  }

<<<<<<< HEAD
  componentDidMount() {
    console.log('mounted');
=======
  async componentDidMount() {
    const activeTab = await browser.runtime.sendMessage({
      type: 'getFirstPopupState',
    });

    console.log(activeTab);
>>>>>>> bd3d0cd6cbb561452bac8b75ac6de342e65be536
  }

  render() {
    return (
      <div>
        <header>
<<<<<<< HEAD
          <h5 className="title">Impulse Blocker</h5>
=======
>>>>>>> bd3d0cd6cbb561452bac8b75ac6de342e65be536
          <img className="options" src={cogs} />
        </header>
        <main>
          <form action="GET">
            <div className="form-group">
              <input type="radio" name="status" id="on" value="on" />
              <label htmlFor="on">On</label>
            </div>
            <div className="form-group">
              <input type="radio" name="status" id="off" value="off" />
              <label htmlFor="off">Off</label>
            </div>
          </form>
          <div className="add-domain-section">
            <button className="button button-add">{this.state.domain}</button>
          </div>
        </main>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

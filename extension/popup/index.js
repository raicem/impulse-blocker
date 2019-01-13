import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      extensionStatus: 'on',
      domain: '',
      isBlocked: false,
    };
  }

  componentDidMount() {
    console.log('mounted');
  }

  render() {
    return (
      <div>
        <header>
          <h5 className="title">Impulse Blocker</h5>
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

import React from 'react';
import ReactDOM from 'react-dom';

export default class App extends React.Component {
  render() {
    return <p>Popup started.</p>;
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

import React from 'react';
import ReactDOM from 'react-dom';
import './popup.css';
import cogs from './cogs.svg';

export default class App extends React.Component {
    render() {
        return (
            <div>
                <header>
                    <h5 class="title">Impulse Blocker</h5>
                    <img class="options" src={cogs} />
                </header>
                <main>
                    <form action="GET">
                        <div class="form-group">
                            <input type="radio" name="status" id="on" value="on" />
                            <label for="on">On</label >
                        </div>
                        <div class="form-group">
                            <input type="radio" name="status" id="off" value="off" />
                            <label for="off">Off</label >
                        </div>
                    </form>
                    <div class="add-domain-section">
                        <button class="button button-add">
                            Block
                    <span class="domainToAllow"></span>
                        </button>
                        <button class="button button-remove">
                            Allow
                    <span class="domainToBlock"></span>
                        </button>
                    </div>
                </main>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
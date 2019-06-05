import React, { Component } from 'react';
import { render } from 'react-dom';
import TextField from '@material-ui/core/TextField';

import InputHandler from '../index';

class App extends Component {
  constructor() {
    super();

    this.state = {
      isTriggered: false,
      ref: React.createRef(),
    };
  }

  render() {
    return (
      <div>
        <button onClick={() => this.setState({ yolo: true })}>FORCE ME</button>
        <h2>
          {`Is Triggered: ${this.state.isTriggered}`}<br />
          {
            this.state.isTriggered
              ? (
                <button
                  onClick={() => {
                    this.setState({
                      isTriggered: false,
                      obj: null,
                    }, () => {
                      this.endHandler();
                    });
                  }}
                >
                  End Trigger
                </button>
              )
              : (
                null
              )
          }
        </h2>

        <InputHandler
          trigger={{
            keyCode: 50,
            shiftKey: true,
          }}
          onStart={(obj) => { this.setState({ isTriggered: true, obj }); }}
          onType={(obj) => { this.setState({ isTriggered: true, obj }); }}
          onCancel={(obj) => { this.setState({ isTriggered: false, obj }); }}
          endTrigger={(endHandler) => { this.endHandler = endHandler; }}
        >
          {
            (refSetter) => (
              <TextField inputRef={refSetter} />
            )
          }
        </InputHandler>

        {
          this.state.obj
            ? (
              <pre>
                {
                  JSON.stringify(this.state.obj, null, 2)
                }
              </pre>
            )
            : (
              null
            )
        }
        <h4>
          View on <a href="https://github.com/abinavseelan/react-input-trigger">Github!</a>
        </h4>
      </div>
    );
  }
}

render(<App />, document.getElementById('app'));

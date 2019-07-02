import React, {Component} from 'react';
import PropTypes from 'prop-types';
import getCaretCoordinates from 'textarea-caret';

function getHookObject(type, element, startPoint, hookArgs) {
  if (hookArgs === undefined) hookArgs = {};
  const {quill} = element;
  let caret;
  let selection;
  if (quill) {
    selection = quill.getSelection();
    caret = quill.getBounds(selection);
  } else {
    caret = getCaretCoordinates(element, element.selectionEnd);
  }

  const result = {
    hookType: type,
    cursor: {
      selectionStart: quill ? selection.index : element.selectionStart,
      selectionEnd: quill ? selection.index + selection.length : element.selectionEnd,
      top: caret.top,
      left: caret.left,
      height: caret.height,
    },
    ...hookArgs};

  if (startPoint === undefined) {
    return result;
  }
  else {
    result.startPoint = startPoint;
  }

  if (startPoint !== result.cursor.selectionStart) {
    result.text = quill ?
      quill.getText(startPoint, selection.index - startPoint)
      :
      element.value.substr(startPoint, result.cursor.selectionStart);
  }
  return result;
}

class InputTrigger extends Component {
  constructor(args) {
    super(args);

    this.state = {
      triggered: false,
      triggerStartPosition: null,
      triggeredKey: null,
    };

    this.handleTrigger = this.handleTrigger.bind(this);
    this.resetState = this.resetState.bind(this);
    this.findInput = this.findInput.bind(this);
  }


  componentDidMount() {
    this.props.endTrigger(this.resetState);
    this.element = this.findInput();
  }

  findInput() {
    if (this.props.getElement) {
      return this.props.getElement(this);
    }
    if (this.childElemnt instanceof Element && ['INPUT', 'TEXTAREA'].find(tag => tag === this.childElemnt.tagName)) {
      return this.childElemnt;
    }
    const inputs = this.div.getElementsByTagName('input');
    if (inputs.length) {
      return inputs[0];
    }
    const textareas = this.div.getElementsByTagName('textarea');
    if (textareas.length) {
      return textareas[0];
    }
    return null;// Would like to warn, but lint disallowed console logs.
    // console.warn('Multiple or no inputs detected', inputs);
  }

  handleTrigger(event) {
    let {
      trigger,
      onStart,
      onCancel,
      onType,
    } = this.props;

    let {
      key,
      shiftKey,
      metaKey,
      ctrlKey,
    } = event;
    event.persist();

    let {quill} = this.element;
    let selectionStart = quill ?
      quill.getSelection().index +1
      :
      event.target.selectionStart;
    let {triggered, triggerStartPosition} = this.state;

    if (this.reset){
      {triggered = false;
      triggerStartPosition = null;
      }
    }

    if (!triggered) {
      let triggeredKey = trigger.keys.find((triggerKey) => key === triggerKey);
      if (
        triggeredKey &&
        ctrlKey === !!trigger.ctrlKey &&
        metaKey === !!trigger.metaKey
      ) {
        this.setState({
          triggered: true,
          triggeredKey: triggeredKey,
          triggerStartPosition: selectionStart,
        }, () => {
          setTimeout(() => {
            onStart(getHookObject('start', this.element, selectionStart, {triggeredKey: triggeredKey}));
          }, 5);
        });
        return null;
      }
    } else {
      console.log(selectionStart, triggerStartPosition, quill.getSelection());
      if ((key === "Backspace" || key === "Delete") && selectionStart <= triggerStartPosition) {
        this.setState({
          triggered: false,
          triggerStartPosition: null,
          triggeredKey: null,
        }, () => {
          setTimeout(() => {
            onCancel(getHookObject('cancel', this.element));
          }, 5);
        });

          return null;
        }
        clearTimeout(this.onTypeTimout);
        this.onTypeTimout = setTimeout(() => {
          onType(getHookObject('typing', this.element, triggerStartPosition, {triggeredKey: this.state.triggeredKey}));
        }, 5);
      }

    return null
  }

  resetState() {
    this.setState({
      triggered: false,
      triggerStartPosition: null,
      triggeredKey: null,
    });
    this.reset = true;
    setTimeout(() => this.reset=false, 5)
  }

  render() {
    const {
      getElement,
      children,
      trigger,
      onStart,
      onCancel,
      onType,
      endTrigger,
      ...rest
    } = this.props;

    return (
      <div
        // role="textbox"
        // tabIndex={-1}
        onKeyDownCapture={this.handleTrigger}
        ref={(el) => {
          this.div = el;
        }}
        {...rest}
      >
        {
          !getElement
            ? (
              React.Children.map(this.props.children, child => (
                React.cloneElement(child, {
                  ref: (element) => {
                    this.childElemnt = element;
                    if (typeof child.ref === 'function') {
                      child.ref(element);
                    }
                  },
                })
              ))
            )
            : (
              children
            )
        }
      </div>
    );
  }
}

InputTrigger.propTypes = {
  trigger: PropTypes.shape({
    keys: PropTypes.array,
    shiftKey: PropTypes.bool,
    ctrlKey: PropTypes.bool,
    metaKey: PropTypes.bool,
  }),
  onStart: PropTypes.func,
  onCancel: PropTypes.func,
  onType: PropTypes.func,
  endTrigger: PropTypes.func,
  children: PropTypes.element.isRequired,
  getElement: PropTypes.func,
};

InputTrigger.defaultProps = {
  trigger: {
    keys: [],
    shiftKey: false,
    ctrlKey: false,
    metaKey: false,
  },
  onStart: () => {
  },
  onCancel: () => {
  },
  onType: () => {
  },
  endTrigger: () => {
  },
  getElement: undefined,
};

export default InputTrigger;

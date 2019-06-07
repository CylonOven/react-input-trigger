import React, { Component } from 'react';
import PropTypes from 'prop-types';
import getCaretCoordinates from 'textarea-caret';

function getHookObject(type, element, startPoint) {
  const { quill } = element;
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
  };

  if (!startPoint) {
    return result;
  }

  result.text = quill ?
    quill.getText(startPoint, selection.index - startPoint)
    :
    element.value.substr(startPoint, element.selectionStart);

  return result;
}

class InputTrigger extends Component {
  constructor(args) {
    super(args);

    this.state = {
      triggered: false,
      triggerStartPosition: null,
    };

    this.handleTrigger = this.handleTrigger.bind(this);
    this.resetState = this.resetState.bind(this);
    this.element = this.props.elementRef;
  }

  componentDidMount() {
    this.props.endTrigger(this.resetState);
  }

  handleTrigger(event) {
    const {
      trigger,
      onStart,
      onCancel,
      onType,
    } = this.props;

    const {
      which,
      shiftKey,
      metaKey,
      ctrlKey,
    } = event;
    const { quill } = this.element;
    const selectionStart = quill ?
      quill.getSelection().index
      :
      event.target.selectionStart;
    const { triggered, triggerStartPosition } = this.state;

    if (!triggered) {
      if (
        which === trigger.keyCode &&
        shiftKey === !!trigger.shiftKey &&
        ctrlKey === !!trigger.ctrlKey &&
        metaKey === !!trigger.metaKey
      ) {
        this.setState({
          triggered: true,
          triggerStartPosition: selectionStart + 1,
        }, () => {
          setTimeout(() => {
            onStart(getHookObject('start', this.element));
          }, 0);
        });
        return null;
      }
    } else {
      if (which === 8 && selectionStart <= triggerStartPosition) {
        this.setState({
          triggered: false,
          triggerStartPosition: null,
        }, () => {
          setTimeout(() => {
            onCancel(getHookObject('cancel', this.element));
          }, 0);
        });

        return null;
      }

      setTimeout(() => {
        onType(getHookObject('typing', this.element, triggerStartPosition));
      }, quill ? 5 : 0);
    }

    return null;
  }

  resetState() {
    this.setState({
      triggered: false,
      triggerStartPosition: null,
    });
  }

  render() {
    const {
      elementRef,
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
        role="textbox"
        tabIndex={-1}
        onKeyDown={this.handleTrigger}
        {...rest}
      >
        {
          !elementRef
            ? (
              React.Children.map(this.props.children, child => (
                React.cloneElement(child, {
                  ref: (element) => {
                    this.element = element;
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
    keyCode: PropTypes.number,
    shiftKey: PropTypes.bool,
    ctrlKey: PropTypes.bool,
    metaKey: PropTypes.bool,
  }),
  onStart: PropTypes.func,
  onCancel: PropTypes.func,
  onType: PropTypes.func,
  endTrigger: PropTypes.func,
  children: PropTypes.element.isRequired,
  elementRef: PropTypes.element,
};

InputTrigger.defaultProps = {
  trigger: {
    keyCode: null,
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
  elementRef: null,
};

export default InputTrigger;

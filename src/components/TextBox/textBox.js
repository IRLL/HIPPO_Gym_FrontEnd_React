import React from 'react';
import './textBox.css';
import 'antd/dist/antd.css';
import { Button } from 'antd';
import capitalize from '../../utils/capitalize';
import sentenceCase from '../../utils/sentenceCase';

class TextBox extends React.Component {

  state = {
    text: ''
  }

  componentDidMount() {

    document.getElementById(this.props.textBox.idx).addEventListener('keydown', function(e){
      let code = this.value;
      let tab = "    ";

      if (e.key === 'Tab'){
        e.preventDefault()
        // insert tab
        let before = code.slice(0, this.selectionStart);
        let after = code.slice(this.selectionEnd, this.value.length);
        let cursorPos = this.selectionEnd + 4;
        this.value = before + tab  + after;

        // reposition the cursor
        this.selectionStart = this.selectionEnd = cursorPos;
      }
      // TODO: if Ctrl+S is pressed then submit code
    })
  }

  handleChange = (e) => {
    this.setState({ text: e.target.value }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state.text);
      }
    });
  }

  // TODO: if message from backend includes text, save input, clear textarea and then display new messages
  render() {
    const buttonRow = []
    const {
          textBox,
          orientation,
          isLoading,
        } = this.props


    if(textBox && textBox.buttons) {
      textBox.buttons.forEach((button) => {
      buttonRow.push(
      <Button
        className={"textButton"}
        id={button}
        size="small"
      >
        {capitalize(sentenceCase(button))}
      </Button>
      )
    })
    }

    return (
      <div className={`${orientation}TextBox`}>
        {!isLoading ?
          <div className="textBoxArea">
            <textarea
              className="textArea"
              id={textBox.idx}
              placeholder="Input text here ..."
              // TODO: replace hardorder width and height with textBox.size[0] + "px"
              style={{width: textBox.size[0] + "px",
                      height: textBox.size[1] + "px",
                      backgroundColor: textBox.bgcolor,
                      color: textBox.color,
                    }}
              defaultValue={textBox.text}
              onChange={this.handleChange}
              spellCheck="false"
              readOnly={textBox.editable ? false : true}
              autoFocus={textBox.editable ? true : false}
            />
            <div className="buttons">
            {buttonRow}
            </div>
          </div>
        : null }
      </div>
    )
  }

}

export default TextBox;
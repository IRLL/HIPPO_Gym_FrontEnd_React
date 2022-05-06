import React from "react";
import "antd/dist/antd.css";
import "./gameContainer.css";
import {Col, Row, Divider, Typography} from "antd";
import CodeMirror from "@uiw/react-codemirror";
import { python } from '@codemirror/lang-python';

import Game from "../Game/game";

const { Title } = Typography;

class GameContainer extends React.Component {
  state = {
    code_editor: false, // shows a code editor
  };

  codeEditorInput = (text) => {
    this.state.code_editor.text = text;
  };

  updateCodeEditor = (value) => {
    this.setState({code_editor: value});
  }

  render() {
    const {
      code_editor,
    } = this.state;

    return (
      <div>
        <Title level={2}>{code_editor ? ('Step 2/2: Coding Your Strategy') : ('Step 1/2: Playing Game')}</Title>

        {code_editor ? (
          <>
            <Row>
              <Col span={24}>
                <CodeMirror
                  value={code_editor.text || ""}
                  extensions={[python()]}
                  onChange={(value) => {
                    this.codeEditorInput(value);
                  }}
                  height={`${code_editor.size[0] || 600}px`}
                />
              </Col>
            </Row>
            <Divider/>
          </>
        ) : null}

        <Game action={this.props.action} updateCodeEditor={this.updateCodeEditor} getCodeEditor={() => this.state.code_editor} />
      </div>
    );
  }
}

export default GameContainer;

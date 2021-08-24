import React from "react";
import "antd/dist/antd.css";
import "./gridDisplayBar.css";
import capitalize from "../../utils/capitalize";
import sentenceCase from "../../utils/sentenceCase";

class GridDisplayBar extends React.PureComponent {
  render() {
    const { visible, isLoading, displayData } = this.props;

    let messageList = [];
    for (let key in displayData) {
      messageList.push(
        <div key={key} className="displayMessage">
          <p className="key">
            <strong>{sentenceCase(capitalize(key))}</strong>
          </p>
          <p className="value">{displayData[key]}</p>
        </div>
      );
    }

    return (
      <div className="displayContainer">
        {visible && !isLoading ? (
          <div className="messageList">{messageList}</div>
        ) : null}
      </div>
    );
  }
}

export default GridDisplayBar;

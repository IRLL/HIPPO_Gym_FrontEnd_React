import React from "react";
import "./infoPanel.css";
import "antd/dist/antd.css";
import capitalize from "../../utils/capitalize";

class InfoPanel extends React.Component {
  render() {
    const { infoPanel, orientation } = this.props;

    const elements = [];
    let textUI = [];
    let itemsUI = [];
    let kvUI = [];

    for (let key in infoPanel) {
      if (key === "text") {
        elements["text"] = (
          <div key={infoPanel[key].toString()}>
            {infoPanel[key] !== null
              ? infoPanel[key].toString()
              : infoPanel[key]}
          </div>
        );
        textUI.push(elements["text"]);
      } else if (key === "items") {
        if (infoPanel[key]) {
          infoPanel[key].forEach((item, i) => {
            elements[`item${i}`] = (
              <p key={`item${i}`}>{item !== null ? item.toString() : item}</p>
            );
            itemsUI.push(elements[`item${i}`]);
          });
        }
      } else if (key === "kv") {
        for (let k in infoPanel[key]) {
          elements[`${k}`] = (
            <div key={k}>
              <strong>
                {k !== null ? capitalize(k.toString()) : capitalize(k)}
              </strong>
              :{" "}
              {infoPanel[key][k] !== null
                ? infoPanel[key][k].toString()
                : infoPanel[key][k]}
            </div>
          );
          kvUI.push(elements[`${k}`]);
        }
      }
    }

    return (
      <div
        className={`${orientation}InfoPanel`}
        style={{ height: "20em", width: "25em" }}
      >
        <samp key="textUI">{textUI}</samp>
        <samp key="itemsUI">{itemsUI}</samp>
        <samp key="kvUI">{kvUI}</samp>
      </div>
    );
  }
}

export default InfoPanel;

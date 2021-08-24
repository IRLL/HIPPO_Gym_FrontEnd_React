import React from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, notification } from "antd";
import { icons } from "../../utils/icons";

class Transform extends React.Component {

  openNotification =() => {
    notification.success({
      message: "Copied to clipboard!",
      placement: "bottom",
      duration: 2,
    })
  }

  transform = (node, index) => {
    if (node.type === "tag" && node.name === "span" && node.attribs && node.attribs.classname === "copyToClipboard") {
      let copyText;
      if (node.children) {
        copyText = node.children[0].data
      }
      return (
        <span className="copyToClipboard">
          <span> {copyText} </span>
          <CopyToClipboard text={copyText}>
            <Button
              type="link"
              id="copyButton"
              icon={icons["copy"]}
              onClick={this.openNotification}
            />
          </CopyToClipboard>
      </span>
      )
    }
  }
}
export default Transform;

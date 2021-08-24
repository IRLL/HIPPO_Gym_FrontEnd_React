import React from "react";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Button, notification } from "antd";
import { icons } from "../../utils/icons";
import { USER_ID } from "../../utils/constants";

class Transform extends React.Component {

  openNotification =() => {
    notification.success({
      message: "Copied to clipboard!",
      placement: "bottom",
      duration: 2,
    })
  }

  transform = (node, index) => {
    if (node.type === "tag" && node.name === "span" && node.attribs && node.attribs.classname === "MTURK_CODE") {
      let copyText = USER_ID;
      return (
        <div className="copyBox">
          <h3>Mechanical Turks User ID: </h3>
          <div className="copyText">
            <span> {copyText} </span>
              <CopyToClipboard text={copyText}>
                <Button
                  type="link"
                  id="copyButton"
                  icon={icons["copy"]}
                  size="large"
                  onClick={this.openNotification}
                />
              </CopyToClipboard>
          </div>
      </div>
      )
    }
  }
}
export default Transform;

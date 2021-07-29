import React from "react";
import "antd/dist/antd.css";
import "./control.css";
import { Button, Input, Tooltip, Row, Col, Slider, Space, Divider } from "antd";
import { icons } from "../../utils/icons";
import capitalize from "../../utils/capitalize";
import sentenceCase from "../../utils/sentenceCase";

class ControlPanel extends React.Component {
  render() {
    const {
      isEnd,
      isLoading,
      UIlist,
      brightness,
      contrast,
      saturation,
      hue,
      instructions,
      orientation,
      DEBUG,
      handleFPS,
      sendMessage,
      handleCommand,
      handleImage,
      handleImageCommands,
      handleChanging,
      addingMinutiae,
      undoEnabled,
      redoEnabled,
      blockButtons,
    } = this.props;
    const directions = [
      "left",
      "leftUp",
      "up",
      "rightUp",
      "down",
      "leftDown",
      "rightDown",
      "fire",
      "right",
    ];
    const commands = [
      "start",
      "pause",
      "stop",
      "reset",
      "good",
      "bad",
      "trainOnline",
      "trainOffline",
    ];

    const fps = ["fpsUp", "fpsDown", "fpsSet"];

    const imageControls = [
      { name: "brightness", min: 0, max: 1000, default: 100, ref: brightness },
      { name: "contrast", min: 0, max: 500, default: 100, ref: contrast },
      { name: "saturation", min: 0, max: 100, default: 100, ref: saturation },
      { name: "hue", min: 0, max: 360, default: 0, ref: hue },
    ];

    const instructionUI = [];
    const imageCommands = [
      "undo",
      "redo",
      "resetImage",
      "submitImage",
      "addMinutia",
      "resetImage",
      "submitImage",
      "stop",
    ];
    const defaultButtons = [
      ...directions,
      ...fps,
      ...imageCommands,
      ...commands,
    ];

    // filter out UIlist to avoid duplicate buttons
    const UIFiltered = UIlist.filter(
      (ele) =>
        !defaultButtons.includes(ele) &&
        !imageControls.map((control) => control.name).includes(ele)
    );

    const elements = {
      fpsSet: UIlist.includes("fpsSet") ? (
        <Col key="fpsSet">
          <Tooltip
            placement="left"
            title="Press Enter to change fps"
            arrowPointAtCenter
          >
            <Input
              id="fpsSet"
              className="fpsInput"
              defaultValue={30}
              value={this.props.inputFrameRate}
              type="number"
              suffix="FPS"
              onChange={(e) => handleFPS("input", e.target.value)}
              onPressEnter={(e) => handleFPS("enter", e.target.value)}
            />
          </Tooltip>
        </Col>
      ) : null,
      fpsUp: UIlist.includes("fpsUp") ? (
        <Col key="fpsUp">
          <Tooltip
            placement="top"
            title="Increase the FPS by 5"
            arrowPointAtCenter
          >
            <Button
              shape="round"
              id="fpsUp"
              className="fpsUpButton"
              size="large"
              icon={icons["fpsUp"]}
              onClick={() => handleFPS("faster", null)}
            >
              Increase
            </Button>
          </Tooltip>
        </Col>
      ) : null,
      fpsDown: UIlist.includes("fpsDown") ? (
        <Col key="fpsDown">
          <Tooltip
            placement="bottom"
            title="Decrease the FPS by 5"
            arrowPointAtCenter
          >
            <Button
              shape="round"
              id="fpsDown"
              className="fpsDownButton"
              size="large"
              icon={icons["fpsDown"]}
              onClick={() => handleFPS("slower", null)}
            >
              Decrease
            </Button>
          </Tooltip>
        </Col>
      ) : null,
    };
    directions.forEach((dir) => {
      if (UIlist.includes(dir))
        elements[dir] = (
          <Col key={dir} span={2}>
            <Button
              id={dir}
              shape="round"
              size="large"
              icon={icons[dir]}
              onClick={() =>
                sendMessage({ actionType: "mousedown", action: dir })
              }
            />
          </Col>
        );
    });
    commands.forEach((command) => {
      if (UIlist.includes(command)) {
        elements[command] = (
          <Col key={command}>
            <Button
              shape="round"
              type="primary"
              id={command}
              className={`${command}Button`}
              icon={icons[command]}
              size="large"
              onClick={() => handleCommand(command)}
            >
              {capitalize(command)}
            </Button>
          </Col>
        );
      }
    });
    instructions.forEach((instruction, i) => {
      elements[`instruction${i}`] = (
        <li key={`instruction${i}`}>{instruction}</li>
      );
      instructionUI.push(elements[`instruction${i}`]);
    });
    imageControls.forEach((control) => {
      elements[control.name] = (
        <Col
          key={control.name}
          className="space-align-container"
          flex="1"
          align="center"
        >
          {UIlist.includes(control.name) && (
            <div
              className="space-align-block imageControlTextContainer"
              onMouseDown={() => handleChanging(true)}
              onMouseUp={() => {
                handleChanging(false);
              }}
            >
              <Space align="center">
                <span>{icons[control.name]}</span>
                <p className="imageControlText">{capitalize(control.name)}</p>
              </Space>
              <Slider
                id={control.name}
                className="imageControl"
                defaultValue={control.default}
                value={control.ref}
                min={control.min}
                max={control.max}
                onChange={(value) => {
                  handleImage(control.name, value);
                  this.currValue = value;
                }}
              />
            </div>
          )}
        </Col>
      );
    });
    imageCommands.forEach((command) => {
      let className = `${command}Button`;
      if (command === "addMinutia" && addingMinutiae) {
        className = className.concat(" adding");
      }

      let enabled;
      switch (command) {
        case "undo":
          enabled = undoEnabled;
          break;
        case "redo":
          enabled = redoEnabled;
          break;
        default:
          enabled = true;
          break;
      }

      if (UIlist.includes(command)) {
        elements[command] = (
          <Col key={command}>
            <Button
              shape="round"
              type="primary"
              id={command}
              className={className}
              icon={icons[command]}
              size="large"
              onClick={() => handleImageCommands(command)}
              date-testid={command}
              disabled={!enabled}
            >
              {capitalize(sentenceCase(command))}
            </Button>
          </Col>
        );
      }
    });
    UIFiltered.forEach((ele) => {
      if (!(ele in elements)) {
        elements[ele] = (
          <Col key={ele}>
            <Button
              id={ele}
              shape="round"
              type="primary"
              size="large"
              onClick={() => handleCommand(ele)}
            >
              {capitalize(sentenceCase(ele))}
            </Button>
          </Col>
        );
      }
    });
    const next = (
      <Row gutter={[4, 8]} justify="space-around">
        <Col key="nextStep">
          <Tooltip
            placement="bottom"
            title="Move to next step"
            arrowPointAtCenter
          >
            <Button
              id="nextStep"
              type="primary"
              shape="round"
              size="large"
              icon={icons["next"]}
              onClick={this.props.handleOk}
            >
              Next
            </Button>
          </Tooltip>
        </Col>
      </Row>
    );

    const sliders1 = [elements["brightness"], elements["contrast"]];
    const sliders2 = [elements["saturation"], elements["hue"]];
    const imgCommands = [
      elements["undo"],
      elements["redo"],
      elements["addMinutia"],
      elements["resetImage"],
    ];
    const firstRow = [elements["leftUp"], elements["up"], elements["rightUp"]];
    const secondRow = [elements["left"], elements["fire"], elements["right"]];
    const thirdRow = [
      elements["leftDown"],
      elements["down"],
      elements["rightDown"],
    ];
    const fpsRow = [elements["fpsUp"], elements["fpsSet"], elements["fpsDown"]];
    const lastRow = [
      elements["submitImage"],
      elements["start"],
      elements["pause"],
      elements["stop"],
      elements["reset"],
    ];
    const feedbackRow = [elements["good"], elements["bad"]];
    const customRow = []; // store custom buttons

    if (blockButtons) {
      elements["bottomBlocks"] = (
        <Row gutter={[16, 16]} justify="center" align="middle">
          {[
            { name: "Previous", i: 0 },
            { name: "Next", i: 2 },
          ].map(({ name, i }) => {
            return blockButtons[i] !== null ? (
              <Col key={`${name}Block`}>
                <Tooltip
                  placement="bottom"
                  title={`${name} Library item (${blockButtons[i].name})`}
                  arrowPointAtCenter
                >
                  <img
                    className="blockButton bottom"
                    src={blockButtons[i].image}
                    alt="blockButton"
                    onClick={() =>
                      sendMessage({
                        command: blockButtons[i].value,
                      })
                    }
                  />
                </Tooltip>
              </Col>
            ) : null;
          })}
        </Row>
      );
      if (blockButtons[1] !== null) {
        elements["topBlock"] = (
          <Row justify="center" gutter={[0, 16]}>
            <Col key="currentBlock">
              <Tooltip
                placement="bottom"
                title={`Current Block (${blockButtons[1].name})`}
                arrowPointAtCenter
              >
                <p className="blockText">{blockButtons[1].name}</p>
                <img
                  className="blockButton top"
                  src={blockButtons[1].image}
                  alt="blockButton"
                  onClick={() =>
                    sendMessage({
                      command: blockButtons[1].value,
                    })
                  }
                />
              </Tooltip>
            </Col>
          </Row>
        );
      }
    }

    // TODO: this is a temporary method of arranging custom buttons. It needs to be redone
    // add custom buttons
    UIFiltered.forEach((ele) => {
      customRow.push(elements[ele]);
    });
    // UIFiltered.forEach((ele, idx) => {
    // 	if (idx % 3 === 0) {
    // 		firstRow.push(elements[ele]);
    // 	} else if (idx % 3 === 1) {
    // 		secondRow.push(elements[ele]);
    // 	} else if (idx % 3 === 2) {
    // 		thirdRow.push(elements[ele]);
    // 	}
    // });

    return (
      <div data-testid="control-panel">
        {elements["topBlock"]}
        {!isLoading && (
          <div
            className={`controlPanel ${
              orientation === "horizontal" && !DEBUG ? "addMargin" : ""
            }`}
          >
            <div className="panelContainer">
              {instructions.length ? (
                <div>
                  <Divider>Instructions</Divider>
                  <Row gutter={[4, 8]} justify="start" className="instructions">
                    <ul>{instructionUI}</ul>
                  </Row>
                  <Divider>Controls </Divider>
                </div>
              ) : null}
              {this.props.fingerprint ? (
                <div>
                  <Row
                    gutter={[4, 8]}
                    justify="space-around"
                    className="imageCommands"
                  >
                    {imgCommands}
                  </Row>
                  <Row gutter={[4, 8]} justify="space-between">
                    {sliders1}
                  </Row>
                  <Row gutter={[4, 8]} justify="space-between">
                    {sliders2}
                  </Row>
                </div>
              ) : null}
              {[elements["bottomBlocks"]]}
              <Row gutter={[4, 8]} justify="space-around">
                {fpsRow}
              </Row>
              <div className="addPadding">
                <Row className="direction">{firstRow}</Row>
                <Row className="direction">{secondRow}</Row>
                <Row className="direction">{thirdRow}</Row>
              </div>
              <Row
                gutter={[4, 8]}
                justify="space-around"
                className="addPadding"
              >
                {feedbackRow}
              </Row>
              {customRow.length ? (
                <Row
                  gutter={[4, 8]}
                  justify="space-around"
                  className="addPadding"
                >
                  {customRow}
                </Row>
              ) : null}
              <Row
                gutter={[4, 8]}
                justify="space-around"
                className="addPadding"
              >
                {lastRow}
              </Row>
              {isEnd ? next : null}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ControlPanel;

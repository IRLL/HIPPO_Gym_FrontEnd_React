import React from "react";
import "antd/dist/antd.css";
import "./control.css";
import { Button, Tooltip, Row, Col, Slider, Space} from "antd";
import { icons } from "../../utils/icons";
import capitalize from "../../utils/capitalize";
import sentenceCase from "../../utils/sentenceCase";
import titleCase from "../../utils/titleCase";

class ControlPanel extends React.Component {
  render() {
    const {
      isEnd,
      isLoading,
      UIlist,
      orientation,
      DEBUG,
      handleFPS,
      sendMessage,
      imageControls,
      handleImage,
      handleImageCommands,
      handleChanging,
      addingMinutiae,
      undoEnabled,
      redoEnabled,
      blockButtons,
      controlPanel,
      handleButton,
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
      "good",
      "bad",
      "reset",
      "trainOnline",
      "trainOffline",
    ];

    const fps = ["fpsUp", "fpsDown", "fpsSet"];

    const imageCommands = [
      "undo",
      "redo",
      "resetImage",
      "submitImage",
      "addMinutia",
      "resetImage",
      "submitImage",
      "end",
    ];
    const defaultButtons = [
      ...directions,
      ...fps,
      ...imageCommands,
      ...commands,
    ];

    const customRow = []; // store custom buttons

    const elements = {};
    const buttonsInOrder = [];

    if (controlPanel){
      if (controlPanel.Buttons) {
        var buttons = controlPanel.Buttons
        buttons.forEach((button) => {
          let currButton = button[Object.keys(button)[0]]
          if (!currButton.image) {
          elements[currButton.value] = (
            <Col key={currButton.value}>
                <Button
                    shape="round"
                    id={currButton.value}
                    className={`${currButton.value}Button`}
                    icon={currButton.icon ? icons[currButton.value] || icons[currButton.icon] : null}
                    size="large"
                    style={{backgroundColor: currButton.bgcolor,
                    border: currButton.border ? "solid 3px " + currButton.border : null,
                    color: currButton.color
                    }}
                    type={currButton.type || "default"}
                    href={currButton.href || null}
                    target={currButton.href ? "_blank" : null}
                    onClick={() => handleButton(button, currButton.value)}
                  >
                    {currButton.text ? titleCase(sentenceCase(currButton.text)): null}
                  </Button>
                </Col>)
          } else {
            elements[currButton.value] = (
              <Col key={currButton.value}>
                {/* TODO: add icon to tooltip, test with different images for icon and background image*/}
              <Tooltip
              title={capitalize(sentenceCase(currButton.text))}
              arrowPointAtCenter
              icon={currButton.image}
              >
                <Button
                    shape="round"
                    type="primary"
                    id={currButton.value}
                    className={`${currButton.value}Button`}
                    style={{ backgroundImage : "url('" + currButton.image.replace(/(\r\n|\n|\r)/gm, "") + "')",
                            backgroundSize: "cover"}}
                    size="large"
                    onClick={() => handleButton(button, currButton.value)}
                 >
                  {capitalize(sentenceCase(currButton.text))}</Button>
              </Tooltip>
            </Col>)
          }
          if (!defaultButtons.includes(currButton.value)){
            customRow.push(elements[currButton.value]);
          }
          buttonsInOrder.push(elements[currButton.value]);
        })
      }
      if (controlPanel.Sliders) {
        var sliders = controlPanel.Sliders
        sliders.forEach((slider) => {
          let currSlider = slider[Object.keys(slider)[0]]
          elements[currSlider.id] = (
            <Col
            key={currSlider.id}
            className="space-align-container"
            flex="1"
            align="center"
            >
            <div
              className="space-align-block imageControlTextContainer"
              onMouseDown={() => handleChanging(true)}
              onMouseUp={() => {
                handleChanging(false);
              }}
            >
              <Space align="center">
                <span>{icons[currSlider.id]}</span>
                <p className="imageControlText">{capitalize(currSlider.title)}</p>
              </Space>
              <Slider
                id={currSlider.id}
                className="imageControl"
                defaultValue={currSlider.value}
                value={currSlider.value.ref}
                min={currSlider.min}
                max={currSlider.max}
                onChange={(value) => {
                  handleImage(currSlider.id, value);
                  this.currValue = value;
                }}
              />
              </div>
            </Col>
          )
        })
      }
    }

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
    const next = (
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
            onClick={(e) => this.props.handleOk(e, "gameEndOk")}
          >
            Next
          </Button>
        </Tooltip>
      </Col>
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
    const feedbackRow = [elements["good"],elements["bad"]]
    const fpsRow = [elements["fpsUp"], elements["fpsSet"], elements["fpsDown"]];
    const lastRow = [
      elements["submitImage"],
      elements["start"],
      elements["pause"],
      elements["end"],
      elements["reset"],
    ];

    if (blockButtons) {
      elements["bottomBlocks"] = (
        <Row gutter={[16, 16]} justify="center" align="middle">
          {[
            { name: "Previous", i: 0 },
            { name: "Next", i: 2 },
          ].map(({ name, i }) =>
          {return blockButtons[i].value !== null ?
           (<Col key={`${name}Block`}>
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
            ): null}
          )}
        </Row>
      );
      if (blockButtons[1].value !== null){
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

    return (
      <div data-testid="control-panel">
        {elements["topBlock"]}
        {!isLoading && (
          <div className="controlPanel">
            <div className="panelContainer">

              {imageControls ?
                <>
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
                </>
              : null}

              {[elements["bottomBlocks"]]}
              <Row gutter={[8, 8]} justify="space-around">
                {buttonsInOrder}
                {isEnd ? next : null}
              </Row>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ControlPanel;

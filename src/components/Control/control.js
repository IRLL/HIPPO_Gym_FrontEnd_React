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
      infoPanel,
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
      "reset",
      "good",
      "bad",
      "trainOnline",
      "trainOffline",
    ];

    const fps = ["fpsUp", "fpsDown", "fpsSet"];


    const infoPanelUI = [];
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

    // filter out UIlist to avoid duplicate buttons
    const UIFiltered = UIlist.filter(
      (ele) =>
        !defaultButtons.includes(ele)
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
                    type="primary"
                    id={currButton.value}
                    className={`${currButton.value}Button`}
                    icon={currButton.icon ? icons[currButton.value] : null}
                    size="large"
                    style={{backgroundColor: currButton.bgcolor,
                    border: "solid 1px " + currButton.border,
                    color: currButton.color
                    }}
                    onClick={() => handleButton(button, currButton.value)}
                  >
                    {currButton.text ? capitalize(sentenceCase(currButton.text)): null}
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

    let textUI=[]
    let itemsUI=[]
    let kvUI=[]

    for(let key in infoPanel){
      if (key==="text") {
        elements["text"] = (
          <div>{infoPanel[key]}</div>
        )
        textUI.push(elements["text"]);
      } else if (key==="items") {
        infoPanel[key].forEach((item, i) => {
          elements[`item${i}`] = (
            <li key={`item${i}`}>{item}</li>
            )
        itemsUI.push(elements[`item${i}`]);
        })
      } else if(key==="kv"){
        document.createElement("br")
        for(let object in infoPanel[key]){
          for (let k in infoPanel[key][object]){
            elements[`${k}`] = (
              <div key={k}><strong>{capitalize(k)}</strong>: {infoPanel[key][object][k]}</div>
            )
            kvUI.push(elements[`${k}`]);
          }
        }
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
      elements["end"],
      elements["reset"],
      elements["save"]
    ];
    const customRow = []; // store custom buttons

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

    // TODO: this is a temporary method of arranging custom buttons. It needs to be redone
    // add custom buttons
    UIFiltered.forEach((ele) => {
      customRow.push(elements[ele])
		});

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
              {infoPanel ? (
                <div>
                  <Divider>Information</Divider>
                  <Row gutter={[4, 8]} justify="start" className="infoPanel">
                    <ul>{textUI}</ul>
                  </Row>
                  <Row gutter={[4, 8]} justify="start" className="infoPanel">
                    <ul>{itemsUI}</ul>
                  </Row>
                  <Row gutter={[4, 8]} justify="start" className="infoPanel">
                    <ul>{kvUI}</ul>
                  </Row>
                  <Divider>Controls </Divider>
                </div>
              ) : null}
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
              {[elements["bottomBlocks"]]}
              <Row gutter={[4, 8]} justify="space-around">
                {fpsRow}
              </Row>
              <div className="directions">
                <Row className="direction">{firstRow}</Row>
                <Row className="direction">{secondRow}</Row>
                <Row className="direction">{thirdRow}</Row>
              </div>
              {customRow.length ? (
                <Row gutter={[4, 8]} justify="space-around">
                  {customRow}
                </Row>
              ) : null}
              <Row gutter={[4, 8]} justify="space-around">
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

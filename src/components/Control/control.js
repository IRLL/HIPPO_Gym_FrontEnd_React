import React from "react";
import "antd/dist/antd.css";
import "./control.css";
import { Button, Input, Tooltip, Row, Col, Slider, Space, Divider } from "antd";
import { icons } from "../../utils/icons";
import capitalize from "../../utils/capitalize";
import sentenceCase from "../../utils/sentenceCase";

class ControlPanel extends React.Component {
	render() {
		const {isEnd, isLoading, UIlist, brightness, contrast, saturation, hue,
			instructions, orientation, DEBUG } = this.props;

		const directions = [ "left", "leftUp", "up", "rightUp", "down",
			"leftDown", "rightDown", "fire", "right", ];

		const commands = [ "start", "pause", "stop", "reset", "good",
			"bad", "trainOnline", "trainOffline", ];

		const fps = ["fpsUp", "fpsDown", "fpsSet"];

		const imageControls = [
			{ name: "brightness", min: 0, max: 1000, default: 100, ref: brightness },
			{ name: "contrast", min: 0, max: 500, default: 100, ref: contrast },
			{ name: "saturation", min: 0, max: 100, default: 100, ref: saturation },
			{ name: "hue", min: 0, max: 360, default: 0, ref: hue },
		];

		const instructionUI = [];

		const imageCommands = [ "undo",	"redo", "resetImage", "submitImage",
      "addMinutia", "resetImage", "submitImage", ];

		const defaultButtons = [...directions, ...fps];

		const UIFiltered = UIlist.filter(
			(ele) =>
				!defaultButtons.includes(ele) &&
				!imageControls.map((control) => control.name).includes(ele) &&
				!imageCommands.includes(ele)
		);

		const elements = {
      fpsSet:
        UIlist.includes("fpsSet") ? (
          <Col key="fpsSet">
              <Tooltip placement="left" title="Press Enter to change fps" arrowPointAtCenter>
                <Input
                  id="fpsSet"
                  className="fpsInput"
                  defaultValue={30}
                  value={this.props.inputFrameRate}
                  type="number"
                  suffix="FPS"
                  onChange={(e) => this.props.handleFPS("input",e.target.value)}
                  onPressEnter={(e) => this.props.handleFPS("enter", e.target.value)}
                />
              </Tooltip>
          </Col>
				) : null
			,
			fpsUp:
				UIlist.includes("fpsUp") ? (
          <Col key="fpsUp">
              <Tooltip placement="top" title="Increase the FPS by 5" arrowPointAtCenter>
                <Button
                  shape="round"
                  id="fpsUp"
                  className="fpsUpButton"
                  size="large"
                  icon={icons["fpsUp"]}
                  onClick={() => this.props.handleFPS("faster", null)}
                >
                  Increase
                </Button>
              </Tooltip>
          </Col>
				) : null
			,
			fpsDown:
				UIlist.includes("fpsDown") ? (
				  <Col key="fpsDown">
						<Tooltip placement="bottom" title="Decrease the FPS by 5" arrowPointAtCenter>
							<Button
								shape="round"
								id="fpsDown"
								className="fpsDownButton"
								size="large"
								icon={icons["fpsDown"]}
								onClick={() => this.props.handleFPS("slower", null)}
							>
								Decrease
							</Button>
						</Tooltip>
            </Col>
        ) : null
			,
		};
		directions.forEach((dir) => {
			elements[dir] =
				UIlist.includes(dir) ? (
          <Col key={dir} span={2}>
              <Button
                id={dir}
                shape="round"
                size="large"
                icon={icons[dir]}
                onClick={() => this.props.sendMessage({ actionType: "mousedown", action: dir })}
                />
          </Col>
        ) : null
        ;
      });
      commands.forEach((command) => {
        elements[command] =
        UIlist.includes(command) ? (
          <Col key={command}>
            <Button
              shape="round"
              type="primary"
              id={command}
              className={`${command}Button`}
              icon={icons[command]}
              size="large"
              onClick={() => this.props.handleCommand(command)}
              >
              {capitalize(command)}
            </Button>
          </Col>
        ) : null
			;
		});
		instructions.forEach((instruction, i) => {
			elements[`instruction${i}`] = <li key={`instruction${i}`}>{instruction}</li>;
			instructionUI.push(elements[`instruction${i}`]);
		});
		imageControls.forEach((control) => {
			elements[control.name] =
				UIlist.includes(control.name) && (
				  <Col key={control.name} className="space-align-container" flex="1" align="center">
						<div className="space-align-block imageControlTextContainer">
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
								onChange={(value) => this.props.handleImage(control.name, value)}
							/>
						</div>
          </Col>
        );
		});
		imageCommands.forEach((command) => {
			elements[command] =
				UIlist.includes(command) && (
				  <Col key={command}>
						<Button
							shape="round"
							type="primary"
							id={command}
							className={`${command}Button`}
							icon={icons[command]}
							size="large"
							onClick={() => this.props.handleImageCommands(command)}
							date-testid={command}
						>
							{capitalize(sentenceCase(command))}
						</Button>
          </Col>
        );
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
							onClick={() => this.props.handleCommand(ele)}
						>
							{capitalize(ele)}
						</Button>
					</Col>
				);
			}
		});
    const next =
      (<Row gutter={[4, 8]} justify="space-around">
        <Col key="nextStep">
          <Tooltip placement="bottom" title="Move to next step" arrowPointAtCenter>
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
      </Row>)

		const sliders1 = [elements["brightness"], elements["contrast"]];
		const sliders2 = [elements["saturation"], elements["hue"]];
		const imgCommands = [elements["undo"], elements["redo"], elements["addMinutia"], elements["resetImage"]];
		const firstRow = [elements["leftUp"], elements["up"], elements["rightUp"]];
		const secondRow = [elements["left"], elements["fire"], elements["right"]];
		const thirdRow = [ elements["leftDown"], elements["down"], elements["rightDown"]];
    const fpsRow = [elements["fpsUp"], elements["fpsSet"], elements["fpsDown"]]
		const lastRow = [elements["submitImage"], elements["start"], elements["stop"], elements["reset"]];

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
				{!isLoading && (
					<div className={`controlPanel ${orientation === "horizontal" && !DEBUG? "addMargin" : ""}`}>
						<div className="panelContainer">
							{instructions.length ?
                <div>
                  <Divider>Instructions</Divider>
                  <Row gutter={[4, 8]} justify="start" className="instructions">
                    <ul>{instructionUI}</ul>
                  </Row>
                  <Divider>Controls </Divider>
                </div>
              : null}
              {this.props.fingerprint ?
                <>
                  <Row gutter={[4, 8]} justify="space-around" className="imageCommands">
                    {imgCommands}
                  </Row>
                  <Row gutter={[4, 8]} justify="space-between">
                    {sliders1}
                  </Row>
                  <Row gutter={[4, 8]} justify="space-between">
                    {sliders2}
                  </Row>
                </>
              :null}
              <Row gutter={[4, 8]} justify="space-around">{fpsRow}</Row>
							<Row gutter={[4, 8]} className="row">{firstRow}</Row>
							<Row gutter={[4, 8]} className="row">{secondRow}</Row>
							<Row gutter={[4, 8]} className="row">{thirdRow}</Row>
              <Row gutter={[4, 8]} justify="space-around">{lastRow}</Row>
              {isEnd ? next : null}
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default ControlPanel;

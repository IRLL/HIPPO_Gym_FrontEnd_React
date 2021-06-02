import React from "react";
import "antd/dist/antd.css";
import "./game.css";
import { message, Modal, Row, Col, Button, Radio } from "antd";
import { w3cwebsocket } from "websocket";
import { browserName, osName, browserVersion, osVersion } from "react-device-detect";
import getKeyInput from "../../utils/getKeyInput";
import { WS_URL, USER_ID, PROJECT_ID, SERVER, DEBUG } from "../../utils/constants";
import { icons } from "../../utils/icons";
import ControlPanel from "../Control/control";
import BudgetBar from "../BudgetBar/budgetBar";
import DisplayBar from "../DisplayBar/displayBar";
import MessageViewer from "../Message/MessageViewer";
import GameWindow from "../GameWindow/gameWindow";
import FingerprintWindow from "../GameWindow/fingerprintWindow";

import produce, { enablePatches, applyPatches } from "immer";

enablePatches();

const pendingTime = 30;

const undo = [];
const redo = [];

class Game extends React.Component {
	state = {
		frameCount: 0, // count how many frames has received from the server
		frameId: 0, // the id of current frame
		frameRate: 30, // default FPS is 30
		frameSrc: "", // the image source of frame
		imageL: null, // the image source of left image component
		imageR: null, // the image source of right image component
		isLoading: !SERVER ? true : false, // if the server is ready to send out the data
		isEnd: false, // if the game is finished
		isConnection: false, // if the connection to the server is established
		isVisible: false, // if the game end dialog is visible
		UIlist: [], // a list of UI components
		progress: 0, // the status of the server
		inputBudget: 0, // the total budget available for the feedback buttons
		usedInputBudget: 0, // the consumed budget for the feedback buttons
		receiveData: null, // the received data from the server
		displayData: null, // the data that will be displayed on the page
		inMessage: [], // a list of incoming messages
		outMessage: [], // a list of outgoing messages
		holdKey: null, // the key that is holding
		instructions: [], // list of instructions for the game

		// TODO: Add the fingerprint prop to config.yml
		fingerprint: true, // if this is a fingerprint trial
		resetModalVisible: false, // if the reset image dialog is visible
		orientation: "vertical", // default orientation is vertical

		// For image marking functionality
		brightness: 100,
		contrast: 100,
		saturation: 100,
		hue: 0,
		addingMinutiae: false,
		minutiae: [],



		// Widths and heights for responsiveness
		windowWidth: 700,
		windowHeight: 600,
		imageWidth: null,
		imageHeight: null,
	};

	componentDidMount() {
		// To update the progress of loading game content
		// Since we always need to wait 30 seconds before the game
		// content get loaded, we update the progress (100/30) per second
		this.updateProgress = setInterval(
			() =>
				this.setState((prevState) => ({
					progress: prevState.progress + 100 / pendingTime,
				})),
			1000
		);
		// To ensure the websocket server is ready to connect
		// we try to connect the websocket server periodically
		// for every 30 seconds until the connection has been established
		this.timer = setTimeout(
			() => {
				//connect the websocket server
				this.websocket = new w3cwebsocket(WS_URL);
				this.websocket.onopen = () => {
					// Once the websocket connection has been established
					// we remove all the unnecessary timer
					clearTimeout(this.timer);
					clearInterval(this.updateProgress);
					console.log("WebSocket Client Connected");
					this.setState({
						isLoading: false,
						isConnection: true,
					});
					this.sendMessage({
						userId: USER_ID,
						projectId: PROJECT_ID,
					});
				};

				// Listen to the data from the websocket server
				this.websocket.onmessage = (message) => {
					//"done" means the game has ended
					if (message.data === "done") {
						this.setState({
							isEnd: true,
							isVisible: true,
						});
						//parse the data from the websocket server
					} else {
						let parsedData = JSON.parse(message.data);
						//Check if budget bar should be loaded
						if (parsedData.inputBudget) {
							this.setState({
								inputBudget: parsedData.inputBudget,
								usedInputBudget: parsedData.usedInputBudget,
							});
						}
						//Check if UI in response
						if (parsedData.UI) {
							this.setState({
								UIlist: parsedData.UI,
							});
						}
						//Check if Instructions in response
						if (parsedData.Instructions) {
							this.setState({
								instructions: parsedData.Instructions,
							});
						}
						//Check if Instructions in response
						if (parsedData.fingerprint) {
							this.setState({
								fingerprint: parsedData.fingerprint,
							});
						}
						//Check if frame related information in response
						if (parsedData.frame && parsedData.frameId) {
							let frame = parsedData.frame;
							let frameId = parsedData.frameId;
							this.setState((prevState) => ({
								frameSrc: "data:image/jpeg;base64, " + frame,
								frameCount: prevState.frameCount + 1,
								frameId: frameId,
							}));

							const img = new Image();
							img.src = "data:image/jpeg;base64, " + frame;
							img.onload = () => {
								this.setState({
									imageWidth: img.width,
									imageHeight: img.height,
								});
							};
						}

						//check if imageL is in server's response
						if (parsedData.imageL) {
							this.setState({
								imageL: parsedData.imageL,
							});
						}

						//check if imageR is in server's response
						if (parsedData.imageR) {
							this.setState({
								imageR: parsedData.imageR,
							});
						}

						//check if any information needed to display
						if (parsedData.display) {
							this.setState({
								displayData: parsedData.display,
							});
						}
						//log every message received from the server
						if (DEBUG) {
							delete parsedData.frame;
							this.setState((prevState) => ({
								inMessage: [parsedData, ...prevState.inMessage],
							}));
						}
					}
				};

				//listen to the websocket closing status
				this.websocket.onclose = () => {
					console.log("WebSocket Client Closed");
					this.setState({
						isConnection: false,
						isEnd: true,
						isVisible: true,
					});
				};
			},
			SERVER ? 0 : pendingTime * 1000
		);

		// Listen to the user's keyboard inputs
		document.addEventListener("keydown", (event) => {
			//Used to prevent arrow keys and space key from scrolling the page
			let dataToSend = getKeyInput(event.code);
			if (dataToSend.actionType !== null) {
				event.preventDefault();
			}

			if (this.state.UIlist.includes(dataToSend.action)) {
				if (this.state.holdKey !== dataToSend.actionType) {
					this.setState({ holdKey: dataToSend.actionType });
					this.sendMessage(dataToSend);
				}
			}
		});

		document.addEventListener("keyup", (event) => {
			//Used to prevent arrow keys and space key from scrolling the page
			let dataToSend = getKeyInput(event.code);
			if (this.state.UIlist.includes(dataToSend.action)) {
				dataToSend.action = "noop";
				if (this.state.holdKey === dataToSend.actionType) {
					this.setState({ holdKey: null });
				}
				this.sendMessage(dataToSend);
			}
		});

		// Get the client window width to make the game window responsive
		window.addEventListener("resize", () => {
			const value =
				this.state.orientation === "vertical"
					? document.documentElement.clientWidth > 700
						? 700
						: 0.8 * document.documentElement.clientWidth
					: 0.4 * document.documentElement.clientWidth > 700
					? 700
					: 0.4 * document.documentElement.clientWidth;
			this.setState({ windowWidth: value });
		});
	}

	componentWillUnmount() {
		if (this.setInMessage) clearInterval(this.setInMessage);
	}

	// Change the confirmation modal to be invisible
	// Navigate to the post-game page
	handleOk = (e) => {
		if (e.currentTarget.id === "keepMinutiae" || e.currentTarget.id === "resetAll") {
			// clear out undo and redo
			undo.length = 0
			redo.length = 0
			this.setState({
				brightness: 100,
				contrast: 100,
				saturation: 100,
				hue: 0,
				resetModalVisible: false,
			});
			if (e.currentTarget.id === "resetAll") {
				this.setState({
					minutiae: [],
				});
				this.sendMessage({
					info: "reset all",
				});
			} else {
				this.sendMessage({
					info: "reset excluding minutiae",
				});}
			} else {
			this.setState({
				isVisible: false,
			});
			this.props.action();
		}
	};

	// Change the confirmation modal to be invisible
	// Stay on the game page
	handleCancel = (e) => {
		// this is for the cancel button in the "reset image" modal
		if (e.currentTarget.id === "resetCancel") {
			this.setState({
				resetModalVisible: false,
			});
		} else {
			this.setState({
				isVisible: false,
			});
		}
	};

	// Send data to websocket server in JSON format
	sendMessage = (data) => {
		if (this.state.isConnection) {
			const allData = {
				...data,
				frameCount: this.state.frameCount,
				frameId: this.state.frameId,
			};
			this.setState((prevState) => ({
				outMessage: [allData, ...prevState.outMessage],
			}));
			this.websocket.send(JSON.stringify(allData));
		}
	};

	// Send game control commands to the websocket server
	handleCommand = (status) => {
		if (this.state.isLoading) {
			message.error("Please wait for the connection to be established first!");
			return;
		}
		if (status === "start") {
			this.sendMessage({
				command: status,
				system: osName,
				systemVersion: osVersion,
				browser: browserName,
				browserVersion: browserVersion,
			});
		} else if (status === "submitImage") {
			this.sendMessage({
				command: status,
				minutiaList: this.state.minutiae,
				imageName: "current_image",
			});
			//empty undo and redo arrays
			undo.length = 0
			redo.length = 0
			this.setState({
				minutiae: [],
				brightness: 100,
				contrast: 100,
				saturation: 100,
				hue: 0,
			});
		} else {
			this.sendMessage({
				command: status,
			});
		}
	};

	// Change the FPS of the game
	handleFPS = (speed) => {
		if (
			(speed === "faster" && this.state.frameRate + 5 > 90) ||
			(speed === "slower" && this.state.frameRate - 5 < 1)
		) {
			message.error("Invalid FPS, the FPS can only between 1 - 90!");
		} else {
			this.setState((prevState) => ({
				frameRate: speed === "faster" ? prevState.frameRate + 5 : prevState.frameRate - 5,
			}));
			this.sendMessage({
				changeFrameRate: speed,
			});
		}
	};

	// Handle undo and redo buttons
	handleAddPatch = (patches, inversePatches) => {
		undo.push(inversePatches);
		redo.push(patches);
	};

	// Apply color filters to the image in the fingerprint window
	// Send applied filter to websocket
	handleImage = (type, value) => {
		const nextState = produce(
			this.state,
			(draft) => {
				switch (type) {
					case "brightness":
						draft.brightness = value;
						break;
					case "contrast":
						draft.contrast = value;
						break;
					case "saturation":
						draft.saturation = value;
						break;
					case "hue":
						draft.hue = value;
						break;
					default:
						return;
				}
			},
			this.handleAddPatch
		);
		this.setState(nextState);
		this.sendMessage({
			info: type,
			value,
		});
	};

	// Perform commands like add minutia, redo, undo, reset
	// Send performed command to websocket
	handleImageCommands = (command) => {
		switch (command) {
			case "resetImage":
				this.setState({
					resetModalVisible: true,
				});
				break;
			case "undo":
				const isNotEmptyUndo = undo.pop();
				if (!isNotEmptyUndo) return;
				this.setState(applyPatches(this.state, isNotEmptyUndo));
				break;
			case "redo":
				const isNotEmptyRedo = redo.pop();
				if (!isNotEmptyRedo) return;
				this.setState(applyPatches(this.state, isNotEmptyRedo));
				break;
			case "addMinutia":
				const nextStateMinutiae = produce(
					this.state,
					(draft) => {
						draft.addingMinutiae = !this.state.addingMinutiae;
					},
					this.handleAddPatch
				);
				this.setState(nextStateMinutiae);
				break;
			case "submitImage":
				const newMinutiae = this.normalizeMinutiae(this.state.minutiae);
				this.setState({ minutiae: newMinutiae }, () => {
					this.handleCommand(command);
				});
				break;
			default:
				return;
		}
	};

	// Adds a minutia to the minutiae array
	// x and y are the coordinates on the image
	// orientation goes from 0 (up) to 359 degrees clockwise
	// send added minutia to websocket
	addMinutia = (x, y, orientation, size, color, type) => {
		const nextStateMinutiae = produce(
			this.state,
			(draft) => {
				draft.minutiae = [...this.state.minutiae, { x, y, orientation, size, color, type }];
				draft.addingMinutiae = false;
			},
			this.handleAddPatch
		);
		this.setState(nextStateMinutiae);
		this.sendMessage({
			info: "minutia added",
			minutia: { x, y, orientation, size, color, type },
		});
	};

	// Edit the minutia at position index in the minutiae array
	// corresponding to the type of command and value
	// Send applied command to websocket
	handleMinutia = (type, index, value) => {
		let prevMinutiae = [...this.state.minutiae];
		switch (type) {
			case "rotate":
				prevMinutiae[index] = { ...prevMinutiae[index], orientation: value };
				break;
			case "resize":
				prevMinutiae[index] = { ...prevMinutiae[index], size: value };
				break;
			case "recolor":
				prevMinutiae[index] = { ...prevMinutiae[index], color: value };
				break;
			case "move":
				prevMinutiae[index] = {
					...prevMinutiae[index],
					x: value.x || prevMinutiae[index].x,
					y: value.y || prevMinutiae[index].y,
				};
				break;
			case "changeType":
				prevMinutiae[index] = { ...prevMinutiae[index], type: value };
				break;
			case "delete":
				prevMinutiae.splice(index, 1);
				break;
			default:
				return;
		}
		const nextStateMinutiae = produce(
			this.state,
			(draft) => {
				draft.minutiae = prevMinutiae;
			},
			this.handleAddPatch
		);
		this.setState(nextStateMinutiae);
		this.sendMessage({
			info: "minutia " + index + " edited: " + type,
			value,
		});
	};

	// Return a minutiae array such that each minutia's
	// x and y values are accurate pixel coordinates
	normalizeMinutiae(minutiae) {
		return minutiae.map((minutia) => {
			const { windowWidth, windowHeight, imageWidth, imageHeight } = this.state;

			const defaultAspect = windowWidth / windowHeight;
			const imageAspect = imageWidth / imageHeight;

			if (imageAspect > defaultAspect) {
				// the width = window width and the height is scaled to that
				const scale = imageWidth / windowWidth;
				const scaledHeight = imageHeight / scale;
				const offset = (windowHeight - scaledHeight) / 2; // the y-offset from the window border
				const newMinutia = {
					...minutia,
					x: minutia.x * scale,
					y: (minutia.y - offset) * scale,
				};

				return newMinutia;
			} else {
				// the height = window height and the width is scaled to that
				const scale = imageHeight / windowHeight;
				const scaledWidth = imageWidth / scale;
				const offset = (windowWidth - scaledWidth) / 2; // the x-offset from the window border

				const newMinutia = {
					...minutia,
					x: (minutia.x - offset) * scale,
					y: minutia.y * scale,
				};

				return newMinutia;
			}
		});
	}

	render() {
		const {
			inMessage,
			outMessage,
			isLoading,
			frameSrc,
			frameRate,
			displayData,
			isEnd,
			UIlist,
			instructions,
			progress,
			isVisible,
			inputBudget,
			usedInputBudget,
			imageL,
			imageR,
			brightness,
			contrast,
			saturation,
			hue,
			fingerprint,
			minutiae,
			addingMinutiae,
			resetModalVisible,
			orientation,
			windowWidth,
			windowHeight,
		} = this.state;

		return (
			<div className="game">
				<Radio.Group
					defaultValue="vertical"
					onChange={(e) => {
						this.setState({ orientation: e.target.value });
					}}
					buttonStyle="solid"
					className={`${orientation}OrientationToggle`}
				>
					<Radio.Button value="vertical">{icons["verticalSplit"]}</Radio.Button>
					<Radio.Button value="horizontal">{icons["horizontalSplit"]}</Radio.Button>
				</Radio.Group>

				<DisplayBar
					visible={displayData !== null}
					isLoading={isLoading}
					displayData={displayData}
				/>

				<BudgetBar
					visible={inputBudget > 0}
					isLoading={isLoading}
					usedInputBudget={usedInputBudget}
					inputBudget={inputBudget}
				/>

				<div className={`${orientation}Grid`}>
					<Row>
						<Col flex={1}>
							<MessageViewer title="Message In" data={inMessage} visible={DEBUG} />
						</Col>

						<Col flex={2} align="center">
							{fingerprint ? (
								<FingerprintWindow
									frameSrc={frameSrc}
									width={windowWidth || 700}
									height={windowHeight || 600}
									brightness={brightness}
									contrast={contrast}
									saturation={saturation}
									hue={hue}
									minutiae={minutiae}
									addingMinutiae={addingMinutiae}
									addMinutia={this.addMinutia}
									handleMinutia={this.handleMinutia}
								/>
							) : (
								<GameWindow
									isLoading={isLoading}
									frameSrc={frameSrc}
									imageL={imageL}
									imageR={imageR}
									progress={progress}
								/>
							)}
						</Col>

						<Col flex={1}>
							<MessageViewer title="Message Out" data={outMessage} visible={DEBUG} />
						</Col>
					</Row>

					<ControlPanel
						className="gameControlPanel"
						isEnd={isEnd}
						isLoading={isLoading}
						frameRate={frameRate}
						UIlist={UIlist}
						instructions={instructions}
						handleOk={this.handleOk}
						handleFPS={this.handleFPS}
						handleCommand={this.handleCommand}
						handleImage={this.handleImage}
						handleImageCommands={this.handleImageCommands}
						sendMessage={this.sendMessage}
						addMinutia={this.addMinutia}
						brightness={brightness}
						contrast={contrast}
						saturation={saturation}
						hue={hue}
						addingMinutiae={addingMinutiae}
						orientation={orientation}
					/>
				</div>

				<Modal
					title="Game end message"
					visible={isVisible}
					onOk={this.handleOk}
					onCancel={this.handleCancel}
				>
					<p className="modal">The game has ended</p>
					<p className="modal">
						Press <b>"Cancel"</b> to stay on this page
					</p>
					<p className="modal">
						Press <b>"OK"</b> to move to next step
					</p>
				</Modal>

				<Modal
					title="Reset Image"
					visible={resetModalVisible}
					cancelText="Keep Minutiae"
					footer={[
						<Button key="cancel" id="resetCancel" type="default" onClick={this.handleCancel}>
							Cancel
						</Button>,
						<Button key="keepMinutiae" id="keepMinutiae" type="default" onClick={this.handleOk}>
							Keep Minutiae
						</Button>,
						<Button key="ok" id="resetAll" type="primary" onClick={this.handleOk}>
							Reset All
						</Button>,
					]}
				>
					<p className="resetModal">Would you like to reset the minutiae as well?</p>
					<p className="resetModal">
						Press <b>"Reset All"</b> to clear everything
					</p>
					<p className="resetModal">
						Press <b>"Keep minutiae"</b> to avoid clearing minutiae
					</p>
				</Modal>
			</div>
		);
	}
}

export default Game;

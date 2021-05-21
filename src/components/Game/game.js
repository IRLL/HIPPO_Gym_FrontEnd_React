import React from "react";
import "antd/dist/antd.css";
import "./game.css";
import { message, Modal, Row, Col, Button } from "antd";
import { w3cwebsocket } from "websocket";
import { browserName, osName, browserVersion, osVersion } from "react-device-detect";
import getKeyInput from "../../utils/getKeyInput";
import { WS_URL, USER_ID, PROJECT_ID, SERVER, DEBUG } from "../../utils/constants";
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
		isConnection: false, // if the connection to the server established
		isVisible: false, // if the game end dialog visible
		UIlist: [], // a list of UI components
		progress: 0, // the status of the server
		inputBudget: 0, // the total budget available for the feedback buttons
		usedInputBudget: 0, // the consumed budget for the feedback buttons
		receiveData: null, // the received data from the server
		displayData: null, // the data that will be displayed on the page
		inMessage: [], // a list of incoming messages
		outMessage: [], // a list of outgoing messages
		holdKey: null, // the key that is holding
		brightness: 100,
		contrast: 100,
		saturation: 100,
		hue: 0,
		addingMarkers: false,
		markers: [],
		undoList: [],
		redoList: [],
		instructions: [],
		// TODO: Add the fingerprint prop to config.yml instead of hardcoding it
		fingerprint: true,
		resetModalisVisible: false,
	};

	componentDidMount() {
		//To update the progress of loading game content
		//Since we always need to wait 30 seconds before the game
		//content get loaded, we update the progress (100/30) per second
		this.updateProgress = setInterval(
			() =>
				this.setState((prevState) => ({
					progress: prevState.progress + 100 / pendingTime,
				})),
			1000
		);
		//To ensure the websocket server is ready to connect
		//we try to connect the websocket server periodically
		//for every 30 seconds until the connection has been established
		this.timer = setTimeout(
			() => {
				//connect the websocket server
				this.websocket = new w3cwebsocket(WS_URL);
				this.websocket.onopen = () => {
					//Once the websocket connection has been established
					//we remove all the unnecessary timer
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

				//listen to the data from the websocket server
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
						//Check if frame related information in response
						if (parsedData.frame && parsedData.frameId) {
							let frame = parsedData.frame;
							let frameId = parsedData.frameId;
							this.setState((prevState) => ({
								frameSrc: "data:image/jpeg;base64, " + frame,
								frameCount: prevState.frameCount + 1,
								frameId: frameId,
							}));
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

		//listen to the user's keyboard inputs
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
	}

	componentWillUnmount() {
		if (this.setInMessage) clearInterval(this.setInMessage);
	}

	//change the confirmation modal to be invisible
	//navigate to the post-game page
	handleOk = (e) => {
		this.setState({
			isVisible: false,
		});
		this.props.action();
	};

	//change the confirmation modal to be invisible
	//stay on the game page
	handleCancel = (e) => {
		this.setState({
			isVisible: false,
		});
	};

	//send data to websocket server in JSON format
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

	//send game control commands to the websocket server
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
		} else {
			this.sendMessage({
				command: status,
			});
		}
	};

	//change the FPS of the game
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

	handleAddPatch = (patch, inversePatches) => {
		undo.push(inversePatches);
		redo.push(patch);
	};

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
					case "markers":
						draft.markers = this.state.markers;
				}
				draft.undoList.push({ name: type });
				draft.redoList.push({ name: type });
			},
			this.handleAddPatch
		)
		this.setState(nextState)
		// this.sendMessage({
		// 	info: type, 
		// 	value
		// })
	};

	// on pressing ok, clear everythin including markers
	// on pressing keep markers, don't clear the markers
	// TODO : combine the handleok etc. commands for both modals
	handleResetOk = (keepMarkers) => {
		if (keepMarkers) {
			this.setState({ markers: [] });
		}
		this.setState({
			brightness: 100,
			contrast: 100,
			saturation: 100,
			hue: 0,
			resetModalisVisible: false,
		});
	};

	// on pressing cancel, set the reset modal to false
	handleResetCancel = () => {
		this.setState({
			resetModalisVisible: false,
		});
	};

	// perform commands like add marker, redo, undo, reset
	handleImageCommands = (status) => {
		switch (status) {
			case "resetImage":
				this.setState({
					resetModalisVisible: true,
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

			// TODO: separate 
			case "addMarker":
				this.setState({
					previousState: { ...this.state.previousState, markers: this.state.markers },
					addingMarkers: !this.state.addingMarkers,
				});
				break;
			case "submitImage":
				this.handleCommand(status);
				break;
			default:
				return;
		}
	};

	// Adds a marker to the markers array
	// x and y are the coordinates on the image
	// orientation goes from 0 (up) to 359 degrees clockwise
	addMarker = (x, y, orientation, size, color) => {
		this.setState((prevState) => ({
			markers: [...prevState.markers, { x, y, orientation, size, color }],
			addingMarkers: false,
		}));
	};

	handleMarker = (type, index, value) => {
		const prevMarkers = this.state.markers;

		switch (type) {
			case "rotate":
				prevMarkers[index] = { ...prevMarkers[index], orientation: value };
				break;
			case "resize":
				prevMarkers[index] = { ...prevMarkers[index], size: value };
				break;
			case "recolor":
				prevMarkers[index] = { ...prevMarkers[index], color: value };
				break;
			case "move":
				prevMarkers[index] = {
					...prevMarkers[index],
					x: prevMarkers[index].x + (value.x || 0),
					y: prevMarkers[index].y + (value.y || 0),
				};
				break;
			case "delete":
				prevMarkers.splice(index, 1);
				break;
			default:
				return;
		}
		this.setState({ markers: prevMarkers });
	};

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
			markers,
			addingMarkers,
			resetModalisVisible,
		} = this.state;

		return (
			<div>
				<Row>
					<Col flex={1}>
						<MessageViewer title="Message In" data={inMessage} visible={DEBUG} />
					</Col>

					<Col flex={2} align="center">
						{fingerprint ? (
							<FingerprintWindow
								className="gameContent"
								frameSrc={frameSrc}
								width={700}
								height={600}
								brightness={brightness}
								contrast={contrast}
								saturation={saturation}
								hue={hue}
								markers={markers}
								addMarker={this.addMarker}
								addingMarkers={addingMarkers}
								handleMarker={this.handleMarker}
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

				<BudgetBar
					visible={inputBudget > 0}
					isLoading={isLoading}
					usedInputBudget={usedInputBudget}
					inputBudget={inputBudget}
				/>

				<DisplayBar
					visible={displayData !== null}
					isLoading={isLoading}
					displayData={displayData}
				/>

				<ControlPanel
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
					addMarker={this.addMarker}
					brightness={brightness}
					contrast={contrast}
					saturation={saturation}
					hue={hue}
					addingMarkers={addingMarkers}
				/>

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
					visible={resetModalisVisible}
					cancelText="Keep Markers"
					footer={[
						<Button key="cancel" type="default" onClick={this.handleResetCancel}>
							Cancel
						</Button>,
						<Button key="keepMarkers" type="default" onClick={() => this.handleResetOk(false)}>
							Keep Markers
						</Button>,
						<Button key="ok" type="primary" onClick={() => this.handleResetOk(true)}>
							Reset All
						</Button>,
					]}
				>
					<p className="resetModal">Would you like to reset the markers as well?</p>
					<p className="resetModal">
						Press <b>"Reset All"</b> to clear everything
					</p>
					<p className="resetModal">
						Press <b>"Keep markers"</b> to avoid clearing markers
					</p>
				</Modal>
			</div>
		);
	}
}

export default Game;

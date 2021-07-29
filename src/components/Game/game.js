import React from "react";
import "antd/dist/antd.css";
import "./game.css";
import { message, Modal, Col, Button, Radio, Progress, Skeleton } from "antd";
import { w3cwebsocket } from "websocket";
import {
  browserName,
  osName,
  browserVersion,
  osVersion,
} from "react-device-detect";

// Import utilities
import getKeyInput from "../../utils/getKeyInput";
import {
  WS_URL,
  USER_ID,
  PROJECT_ID,
  SERVER,
  DEBUG,
} from "../../utils/constants";
import { icons } from "../../utils/icons";

// Import components
import ControlPanel from "../Control/control";
import BudgetBar from "../BudgetBar/budgetBar";
import DisplayBar from "../DisplayBar/displayBar";
import MessageViewer from "../Message/MessageViewer";
import GameWindow from "../GameWindow/gameWindow";
import FingerprintWindow from "../GameWindow/fingerprintWindow";


const pendingTime = 30;
let isResizeCalled = false;
let initialWindowWidth = 700;
let initialWindowHeight = 600;
let windowSizeRatio = 700 / 600;
let prevMouseData = {
  frameCount: 0,
  x: 0,
  y: 0,
}
let prevDimensions = {
  width: initialWindowWidth,
  height: initialWindowHeight,
}

var sample = `{"ControlPanel": {
                  "Buttons": [
                    {"First": {"text":"first", "icon": "first",
                    "image": "data:image/jpeg;base64, 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", "color": "red",
                    "bgcolor": "black", "value": "value"}},
                    {"Second": {"text":"second", "icon": "second",
                    "image": "B64Image", "color": "black",
                    "bgcolor": "gold", "value": "value"}}
                  ],
                  "Sliders": null
              }}`

class Game extends React.Component {
  state = {
    frameCount: 0, // count how many frames has received from the server
    frameId: 0, // the id of current frame
    frameRate: 30, // default FPS is 30
    inputFrameRate: 30, // this stores the input of frame rate input box
    frameSrc: "", // the image source of frame
    imageL: null, // the image source of left image component
    imageR: null, // the image source of right image component
    isLoading: !SERVER ? true : false, // if the server is ready to send out the data
    isEnd: false, // if the game is finished
    isConnection: false, // if the connection to the server is established
    gameEndVisible: false, // if the game end dialog is visible
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
    orientation: "horizontal", // default orientation is horizontal

    // Fingerprint trial configurations
    fingerprint: false, // if this is a fingerprint trial
    minMinutiae: null, // the minimum number of minutiae required to be marked per step
    resetModalVisible: false, // if the reset image dialog is visible

    // For image marking functionality
    brightness: 100, // default image brightness (out of 100)
    contrast: 100, // default image contrast (out of 100)
    saturation: 100, // default image saturation (out of 100)
    hue: 0, // default image hue rotation (out of 360)
    addingMinutiae: false, // if currently adding minutiae
    minutiae: [], // list of all available minutiae within the image

    // For the score modal
    scoreModalVisible: false, // if the score modal is visible
    score: null, // the user's score
    maxScore: 100, // the maximum score a user can get

    // For undo and redo functionality
    undoList: [], // list of states before
    undoEnabled: false, // if
    redoList: [], // list of states after
    redoEnabled: false,
    changing: false, // a flag to set if the sliders are still changing

    // Widths and heights for responsiveness
    windowWidth: 700, // default is 700, researcher can provide custom value
    windowHeight: 600, // default is 600, researcher can provide custom value
    windowSize: "responsive", // if strict, game or fingerprint window will not be responsive
    imageWidth: null,
    imageHeight: null,

    // refactor
    buttons: [],
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
          if (message.data === "done") {
            //"done" means the game has ended
            this.setState({
              isEnd: true,
              gameEndVisible: true,
            });
          } else {
            //parse the data from the websocket server
            let parsedData = JSON.parse(message.data);

            // refactor messages
            var sampleParsedData = JSON.parse(sample)

            if(sampleParsedData.ControlPanel) {
              this.setState({
                controlPanel: sampleParsedData.ControlPanel
              })
            }
            // refactor - end

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
            // Check if window size is in the response
            if (parsedData.gameWindowWidth) {
              initialWindowWidth = parsedData.gameWindowWidth;
              this.setState({
                windowWidth: parsedData.gameWindowWidth,
              });
            }
            if (parsedData.gameWindowHeight) {
              initialWindowHeight = parsedData.gameWindowHeight;
              this.setState({
                windowHeight: parsedData.gameWindowHeight,
              });
            }
            if (parsedData.gameWindowSize) {
              windowSizeRatio =
                this.state.windowWidth / this.state.windowHeight;
              this.setState({
                windowSize: parsedData.gameWindowSize,
              });
            }
            this.handleResize();                  // once new width.height and ratio has been defined, immediately run resize function

            if (
              parsedData.previousBlock &&
              parsedData.currentBlock &&
              parsedData.nextBlock
            ) {
              this.setState({
                previousBlock: {
                  ...parsedData.previousBlock,
                  image:
                    "data:image/jpeg;base64, " + parsedData.previousBlock.image,
                },
                nextBlock: {
                  ...parsedData.nextBlock,
                  image:
                    "data:image/jpeg;base64, " + parsedData.nextBlock.image,
                },
                currentBlock: {
                  ...parsedData.currentBlock,
                  image:
                    "data:image/jpeg;base64, " + parsedData.currentBlock.image,
                },
              });
            }
            //Check if Instructions in response
            if (parsedData.Instructions) {
              this.setState({
                instructions: parsedData.Instructions,
              });
            }
            //Check if Fingerprint in response
            if (parsedData.Fingerprint) {
              this.setState({
                fingerprint: parsedData.Fingerprint,
              });
            }
            //Check if Score in response
            if (parsedData.Score) {
              this.setState({
                score: parsedData.Score,
              });
            }
            //Check if Score in response
            if (parsedData.MaxScore) {
              this.setState({
                maxScore: parsedData.MaxScore,
              });
            }
            //Check if Score in response
            if (parsedData.MinMinutiae) {
              this.setState({
                minMinutiae: parsedData.MinMinutiae,
              });
            }
            //Check if frame related information in response
            if (parsedData.frame && parsedData.frameId) {
              let frame = parsedData.frame;
              let frameId = parsedData.frameId;

              if (this.state.score)
                this.setState((prevState) => ({
                  nextframeSrc: "data:image/jpeg;base64, " + frame,
                  nextframeCount: prevState.frameCount + 1,
                  nextframeId: frameId,
                }));
              else {
                this.setState((prevState) => ({
                  // Set new frame ID
                  frameSrc: "data:image/jpeg;base64, " + frame,
                  frameCount: prevState.frameCount + 1,
                  frameId: frameId,

                  // Reset minutiae and image filters
                  minutiae: [],
                  brightness: 100,
                  contrast: 100,
                  saturation: 100,
                  hue: 0,

                  // Reset undo/redo stacks and buttons
                  undoList: [],
                  redoList: [],
                  undoEnabled: false,
                  redoEnabled: false,
                }));
              }
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
						//Check if Instructions in response
						if (parsedData.Instructions) {
							this.setState({
								instructions: parsedData.Instructions,
							});
						}
						//Check if Fingerprint in response
						if (parsedData.Fingerprint) {
							this.setState({
								fingerprint: parsedData.Fingerprint,
							});
						}
						//Check if Score in response
						if (parsedData.Score) {
							this.setState({
								score: parsedData.Score,
							});
						}
						//Check if Score in response
						if (parsedData.MaxScore) {
							this.setState({
								maxScore: parsedData.MaxScore,
							});
						}
						//Check if Score in response
						if (parsedData.MinMinutiae) {
							this.setState({
								minMinutiae: parsedData.MinMinutiae,
							});
						}
						//Check if frame related information in response
						if (parsedData.frame && parsedData.frameId) {
							let frame = parsedData.frame;
							let frameId = parsedData.frameId;

							if (this.state.score)
								this.setState((prevState) => ({
									nextframeSrc: "data:image/jpeg;base64, " + frame,
									nextframeCount: prevState.frameCount + 1,
									nextframeId: frameId,
								}));
							else {
								this.setState((prevState) => ({
									// Set new frame ID
									frameSrc: "data:image/jpeg;base64, " + frame,
									frameCount: prevState.frameCount + 1,
									frameId: frameId,

									// Reset minutiae and image filters
									minutiae: [],
									brightness: 100,
									contrast: 100,
									saturation: 100,
									hue: 0,

									// Reset undo/redo stacks and buttons
									undoList: [],
									redoList: [],
									undoEnabled: false,
									redoEnabled: false,
								}));
							}
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
						gameEndVisible: true,
					});
				};
			},
			SERVER ? 0 : pendingTime * 1000
		);

		// Listen to the user's keyboard inputs
		document.addEventListener("keydown", (event) => {
			//Used to prevent arrow keys and space key from scrolling the page
			let dataToSend = getKeyInput(event.code);
			if (dataToSend.actionType !== "null") {
				event.preventDefault();
			}

			if (this.state.UIlist.includes(dataToSend.action)) {
				if (this.state.holdKey !== dataToSend.actionType) {
					this.setState({ holdKey: dataToSend.actionType });
					this.sendMessage(dataToSend);
				}
			}
      this.sendMessage({
        "KeyboardEvent": {
          "KEYDOWN": [event.key, event.key.charCodeAt(0)]
        }
      })
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
        this.sendMessage({
          "KeyboardEvent": {
            "KEYUP": [event.key]
          }
        })
		});

		// Get the client window width to make the game window responsive
		this.handleResize();
		window.addEventListener("resize", this.handleResize);
	}

	componentWillUnmount() {
		if (this.setInMessage) clearInterval(this.setInMessage);
	}

  // check every second if the resize has stopped
  resizeCalled = () => {
    var resizeCalled = setInterval(() => {
      var currWidth = this.state.windowWidth
      var currHeight = this.state.windowHeight
      if (currWidth === prevDimensions.width && currHeight === prevDimensions.height){
        // the resize has stopped. Send new dimensions to backend
        // TODO: also clear interval
        this.sendMessage({ WindowEvent:
          {
            WINDOWRESIZED: [currWidth, currHeight]
          }});
        // this.stopResizeCalled();
        clearInterval(resizeCalled);
        isResizeCalled = false;
      } else {
        prevDimensions.width = currWidth
        prevDimensions.height = currHeight
      }
    }, 1000)
  }

	handleResize = () => {
    // TODO: add a variable to check if resizeCalled setinterval has been called already
    //TODO: windowIdshould be added here
    if (!isResizeCalled) {
      isResizeCalled = true;
      this.resizeCalled()
    }
		if (this.state.windowSize !== "strict") {
			const value =
				this.state.orientation === "vertical"
				? document.documentElement.clientWidth > initialWindowWidth
					? initialWindowWidth
					: 0.8 * document.documentElement.clientWidth
				: 0.4 * document.documentElement.clientWidth > initialWindowWidth
				? initialWindowWidth
				: 0.5 * document.documentElement.clientWidth;
			let newHeight  = value / windowSizeRatio;
			this.setState({
				windowWidth: value,
				windowHeight: newHeight,
			});
		}
	}

	// Change the confirmation modal to be invisible
	// Navigate to the post-game page
	handleOk = (e) => {
		if (e.currentTarget.id === "keepMinutiae" || e.currentTarget.id === "resetAll") {
			this.pushUndo();

			this.setState({
				// Reset image filters
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
				});
			}
		} else {
			this.setState({
				gameEndVisible: false,
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
				gameEndVisible: false,
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
				minutiaList: this.normalizeMinutiae(this.state.minutiae),
			});
		} else {
			this.sendMessage({ ButtonEvent: {
        BUTTONPRESSED: status,
      }});
		}
	};

	// Change the FPS of the game
	handleFPS = (type, value) => {
    // set frame rate based on user input in the input box
    var reg = new RegExp("^[0-9]+$"); // value should only contain numbers
    if (type === "input") {
      this.setState({
        inputFrameRate: value,
      });
    }
    if (type === "enter") {
      if (value < 1 || value > 90) {
        message.error("Invalid FPS, the FPS can only between 1 - 90!");
      } else if (!reg.test(value)) {
        message.error("Invalid FPS, the FPS should be an integer value!");
      } else {
        this.setState({
          inputFrameRate: value,
          frameRate: value,
        });
        this.sendMessage({
          changeFrameRate: value,
        });
      }
    } else if (
      // set frame rate based on "increase" and "decrease" keys
      (type === "faster" && Number(this.state.frameRate) + 5 > 90) ||
      (type === "slower" && Number(this.state.frameRate) - 5 < 1)
    ) {
      message.error("Invalid FPS, the FPS can only between 1 - 90!");
    } else if (type === "faster" || type === "slower") {
      this.setState((prevState) => ({
        inputFrameRate:
          type === "faster"
            ? Number(prevState.frameRate) + 5
            : prevState.frameRate - 5,
        frameRate:
          type === "faster"
            ? Number(prevState.frameRate) + 5
            : prevState.frameRate - 5,
      }));
      this.sendMessage({
        changeFrameRate: type,
      });
    }
  };

  // Apply color filters to the image in the fingerprint window
  // - send applied filter to websocket
  handleImage = (type, value) => {
    switch (type) {
      case "brightness":
        this.setState({ brightness: value });
        break;
      case "contrast":
        this.setState({ contrast: value });
        break;
      case "saturation":
        this.setState({ saturation: value });
        break;
      case "hue":
        this.setState({ hue: value });
        break;
      default:
        return;
    }

    if (!this.state.changing) {
      this.pushUndo();
      this.setState({ redoEnabled: false, redoList: [] });
    }

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
        this.setState({
          undoEnabled: this.state.undoList.length > 1,
          redoEnabled: this.state.redoList.length > 0,
        });

        if (this.popUndo()) this.pushRedo();
        break;
      case "redo":
        this.setState({
          undoEnabled: this.state.undoList.length > 0,
          redoEnabled: this.state.redoList.length > 1,
        });

        if (this.popRedo()) this.pushUndo();
        break;
      case "addMinutia":
        this.setState({ addingMinutiae: !this.state.addingMinutiae });
        break;
      case "submitImage":
        if (
          this.state.minMinutiae &&
          this.state.minutiae.length < this.state.minMinutiae
        ) {
          this.showError(
            "Not enough minutiae",
            <p>
              You only have <b>{this.state.minutiae.length}</b> minutia
              {this.state.minutiae.length !== 1 && "e"} out of the minimum of{" "}
              <b>{this.state.minMinutiae}</b> needed
            </p>
          );
        } else {
          this.setState({ scoreModalVisible: true }, () => {
            this.handleCommand(command);
          });
        }
        break;
      default:
        this.handleCommand(command);
        return;
    }
  };

  // Pushes the current state of image filters and
  // minutia list onto undo stack
  pushUndo = () => {
    let undoList = this.state.undoList;

    const currState = {
      minutiae: this.state.minutiae,
      brightness: this.state.brightness,
      contrast: this.state.contrast,
      saturation: this.state.saturation,
      hue: this.state.hue,
    };

    undoList.push(currState);
    this.setState({ undoList, undoEnabled: true });
  };

  // Returns true if undoList has elements to pop
  // False otherwise
  popUndo = () => {
    let undoList = this.state.undoList;

    if (undoList.length < 1) return false;

    const state = undoList.pop();

    this.setState({ ...state, undoList });
    return true;
  };

  // Pushes the current state of image filters and
  // minutia list onto redo stack
  pushRedo = () => {
    let redoList = this.state.redoList;

    const currState = {
      minutiae: this.state.minutiae,
      brightness: this.state.brightness,
      contrast: this.state.contrast,
      saturation: this.state.saturation,
      hue: this.state.hue,
    };

    redoList.push(currState);
    this.setState({ redoList, redoEnabled: true });
  };

  // Returns true if redoList has elements to pop
  // False otherwise
  popRedo = () => {
    let redoList = this.state.redoList;

    if (redoList.length < 1) return false;
    const state = redoList.pop();

    this.setState({ ...state, redoList });
    return true;
  };

  // Adds a minutia to the minutiae array
  // - x and y are the coordinates on the image
  // - orientation goes from 0 (up) to 359 degrees clockwise
  // - resets adding minutia and send added minutia to websocket
  addMinutia = (x, y, orientation, size, color, type) => {
    x = parseInt(x);
    y = parseInt(y);
    this.pushUndo();

    this.setState({
      minutiae: [
        ...this.state.minutiae,
        { x, y, orientation, size, color, type },
      ],
      addingMinutiae: false,
    });
    if (this.state.fingerprint) {
      this.sendMessage({
        info: "minutia added",
        minutia: { x, y, orientation, size, color, type },
      });
    }
  };

  // create a tuple to indicate which mouse button was pressed
  // (left, center/mouse wheel, right)
  getButtonTuple = (button) => {
    if (button === 1) {
      return [1, 0, 0];
    } // left button
    else if (button === 2) {
      return [0, 0, 1];
    } // right button
    else if (button === 4) {
      return [0, 1, 0];
    } // center button/mouse wheel
    else {
      return [0, 0, 0];
    }
  };

  // calculate the difference in current vs previous mouse positions
  getMouseData = (currX, currY) => {
    let pxsMovement = [currX - prevMouseData.x, currY - prevMouseData.y]
    prevMouseData.x = currX
    prevMouseData.y = currY
    return ([pxsMovement[0], pxsMovement[1]])
  }

  // every time a new frame is recieved, send information about the mouse motion
  // also send message every time mouse up or down occurs
  sendMouseData = (eventType, x, y, button) => {
    [x, y] = [parseInt(x), parseInt(y)]

    if (this.state.frameCount !== prevMouseData.frameCount || eventType !== "MOUSEMOTION" ){
      var buttonTuple = this.getButtonTuple(button)
      var [xMovement, yMovement] = this.getMouseData(x, y)

      //TODO: windowId should be added here
      if (eventType === "MOUSEMOTION") {
        this.sendMessage({ MouseEvent:{
          MOUSEMOTION : [{x, y}, {xMovement, yMovement}, buttonTuple, button]  // button represents an integer value for which button has been pressed
        }})
      }
      else {
        this.sendMessage({ MouseEvent: {
          [eventType]: [{x, y}, buttonTuple, button]
        }})
      }
      prevMouseData.frameCount = this.state.frameCount; // set prevFrameCount to the current frame count
    }
  };

  // Edit the minutia at position index in the minutiae array
  // corresponding to the type of command and value
  // - send applied command to websocket
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

    this.setState({ minutiae: prevMinutiae });

    if (!this.state.changing) {
      this.pushUndo();
      this.setState({ redoEnabled: false, redoList: [] });
    }

    this.sendMessage({
      info: "minutia " + index + " edited: " + type,
      value,
    });
  };

  // If the sliders are still changing
  handleChanging = (changing) => {
    if (changing) this.pushUndo();
    this.setState({ changing });
  };

  // Pops up an error modal with the message
  showError = (title, message) => {
    Modal.error({
      title,
      content: message,
    });
  };

  // Scrolls to the top of the window
  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Return a minutiae array such that each minutia's
  // x and y values are accurate pixel coordinates
  normalizeMinutiae = (minutiae) => {
    return minutiae.map((minutia) => {
      const { windowWidth, windowHeight, imageWidth, imageHeight } = this.state;

      const defaultAspect = windowWidth / windowHeight;
      const imageAspect = imageWidth / imageHeight;

      if (imageAspect > defaultAspect) {
        // current width = window width and the height is scaled to that
        const scale = imageWidth / windowWidth;
        const scaledHeight = imageHeight / scale;
        const offset = (windowHeight - scaledHeight) / 2; // the y-offset from the window border
        const newMinutia = {
          x: Math.round(minutia.x * scale),
          y: Math.round((minutia.y - offset) * scale),
          orientation: minutia.orientation,
          type: minutia.type,
        };

        return newMinutia;
      } else {
        // current height = window height and the width is scaled to that
        const scale = imageHeight / windowHeight;
        const scaledWidth = imageWidth / scale;
        const offset = (windowWidth - scaledWidth) / 2; // the x-offset from the window border

        const newMinutia = {
          x: Math.round((minutia.x - offset) * scale),
          y: Math.round(minutia.y * scale),
          orientation: minutia.orientation,
          type: minutia.type,
        };

        return newMinutia;
      }
    });
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
      gameEndVisible,
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
      score,
      scoreModalVisible,
      maxScore,
      undoEnabled,
      redoEnabled,
      previousBlock,
      currentBlock,
      nextBlock,
      controlPanel,
    } = this.state;

    return (
      <div
        className={`game ${addingMinutiae ? "custom-cursor" : ""}`}
        data-testid="game"
        id="game"
      >
        <Radio.Group
          defaultValue="horizontal"
          onChange={(e) => {
            this.setState({ orientation: e.target.value });
          }}
          buttonStyle="solid"
          className={`${orientation}OrientationToggle`}
          disabled={DEBUG ? true : false}
        >
          <Radio.Button value="vertical">{icons["verticalSplit"]}</Radio.Button>
          <Radio.Button value="horizontal">
            {icons["horizontalSplit"]}
          </Radio.Button>
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
        <div className={DEBUG ? "" : `${orientation}Grid`}>
          <div className={DEBUG ? "debugGrid" : ""}>
            {DEBUG ? (
              <Col>
                <MessageViewer
                  title="Message In"
                  data={inMessage}
                  visible={DEBUG}
                />
              </Col>
            ) : null}
            {fingerprint ? (
              <FingerprintWindow
                isLoading={isLoading}
                frameSrc={frameSrc}
                progress={progress}
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
                handleChanging={this.handleChanging}
              />
            ) : (
              <GameWindow
                isLoading={isLoading}
                frameSrc={frameSrc}
                width={windowWidth || 700}
                height={windowHeight || 600}
                imageL={imageL}
                imageR={imageR}
                progress={progress}
                addMinutia={this.addMinutia}
                sendMouseData={this.sendMouseData}
                data-testid="game-window"
              />
            )}
            {DEBUG ? (
              <Col>
                <MessageViewer
                  title="Message Out"
                  data={outMessage}
                  visible={DEBUG}
                />
              </Col>
            ) : null}
          </div>
          <ControlPanel
            className="gameControlPanel"
            isEnd={isEnd}
            isLoading={isLoading}
            frameRate={frameRate}
            inputFrameRate={this.state.inputFrameRate}
            UIlist={UIlist}
            instructions={instructions}
            DEBUG={DEBUG}
            handleOk={this.handleOk}
            handleFPS={this.handleFPS}
            handleCommand={this.handleCommand}
            handleImage={this.handleImage}
            handleImageCommands={this.handleImageCommands}
            handleChanging={this.handleChanging}
            sendMessage={this.sendMessage}
            fingerprint={this.state.fingerprint}
            addMinutia={this.addMinutia}
            brightness={brightness}
            contrast={contrast}
            saturation={saturation}
            hue={hue}
            addingMinutiae={addingMinutiae}
            orientation={orientation}
            undoEnabled={undoEnabled}
            redoEnabled={redoEnabled}
            blockButtons={
              currentBlock ? [previousBlock, currentBlock, nextBlock] : null
            }
            controlPanel={controlPanel}
          />
        </div>

        <Modal
          title="Game end message"
          visible={gameEndVisible}
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
          footer={[
            <Button
              key="cancel"
              id="resetCancel"
              type="default"
              onClick={this.handleCancel}
            >
              Cancel
            </Button>,
            <Button
              key="keepMinutiae"
              id="keepMinutiae"
              type="default"
              onClick={this.handleOk}
            >
              Keep Minutiae
            </Button>,
            <Button
              key="ok"
              id="resetAll"
              type="primary"
              onClick={this.handleOk}
            >
              Reset All
            </Button>,
          ]}
        >
          <p className="resetModal">
            Would you like to reset the minutiae as well?
          </p>
          <p className="resetModal">
            Press <b>"Reset All"</b> to clear everything
          </p>
          <p className="resetModal">
            Press <b>"Keep minutiae"</b> to avoid clearing minutiae
          </p>
        </Modal>
        <Modal visible={scoreModalVisible} closable={false} footer={null}>
          {!score ? (
            <div className="scoreModal">
              <p>Please wait while we calculate your score</p>
              <Skeleton.Avatar
                active={!score}
                size={100}
                shape="circle"
                style={{
                  display: "block !important",
                  alignSelf: "center !important",
                  justifyContent: "center",
                }}
              />
              <Button
                disabled={!score}
                icon={icons["next"]}
                shape="round"
                type="primary"
              >
                Next Image
              </Button>
            </div>
          ) : (
            <div className="scoreModal">
              <h4>Your rank is</h4>
              <Progress
                width={100}
                type="circle"
                percent={1 - score / maxScore}
                strokeColor={{
                  "0%": "#108ee9",
                  "100%": "#87d068",
                }}
                format={(percent) => (
                  <div className="scoreModalProgress">
                    <p>{score}</p>
                    <div></div>
                    <p>{maxScore}</p>
                  </div>
                )}
              />
              <Button
                disabled={!score}
                icon={icons["next"]}
                shape="round"
                type="primary"
                onClick={() => {
                  this.scrollToTop();

                  this.setState((prevState) => ({
                    scoreModalVisible: false,
                    score: null,

                    // Reset the frame source
                    frameSrc: prevState.nextframeSrc,
                    frameCount: prevState.nextframeCount,
                    frameId: prevState.nextframeId,
                    nextframeCount: null,
                    nextframeSrc: null,
                    nextframeId: null,

                    // Reset minutiae list and image filters
                    minutiae: [],
                    brightness: 100,
                    contrast: 100,
                    saturation: 100,
                    hue: 0,

                    // Reset undo and redo stacks and buttons
                    undoList: [],
                    redoList: [],
                    undoEnabled: false,
                    redoEnabled: false,
                  }));
                }}
              >
                Next Image
              </Button>
            </div>
          )}
        </Modal>
      </div>
    );
  }
}

export default Game;

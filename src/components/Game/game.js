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
import CodeMirror from "@uiw/react-codemirror";
// import { javascript } from "@codemirror/lang-javascript";

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
import TextBox from "../TextBox/textBox";
import InfoPanel from "../InfoPanel/infoPanel";
import Grid from "../Grid/grid";

const pendingTime = 30;
let isResizeCalled = false;
let initialWindowWidth = 700;
let initialWindowHeight = 600;
let windowSizeRatio = 700 / 600;
let prevMouseData = {
  frameCount: 0,
  x: 0,
  y: 0,
};
let prevDimensions = {
  width: initialWindowWidth,
  height: initialWindowHeight,
};
let prevSendSize = [];

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
    textbox: false, // shows a textbox
    code_editor: false, // shows a code editor
    buttonModalVisible: false, // confirm modal for buttons
    borderColor: "default", // set the border color for the game window
    gameWindowShow: true,

    // Fingerprint trial configurations
    imageControls: false, // if true, controls like zoom
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

    //grid variables
    grid: null,
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
          //parse the data from the websocket server
          let parsedData = JSON.parse(message.data);

          if (parsedData.done) {
            this.setState({
              isEnd: true,
              gameEndVisible: true,
            });
          }

          //Check if budget bar should be loaded
          if (parsedData.inputBudget) {
            this.setState({
              inputBudget: parsedData.inputBudget,
              usedInputBudget: parsedData.usedInputBudget,
            });
          }

          // check if control panel is in parsedData
          if ("ControlPanel" in parsedData) {
            this.setState({
              controlPanel: parsedData.ControlPanel,
            });
            if (parsedData.ControlPanel) {
              this.setState({
                keys: parsedData.ControlPanel.Keys,
              });
            }
          }

          // check if GameWindow is in parsedData
          if ("GameWindow" in parsedData) {
            if (parsedData.GameWindow) {
              this.setState({
                gameWindowShow: true,
              });
              if (parsedData.GameWindow.size) {
                initialWindowWidth = parsedData.GameWindow.size[0];
                initialWindowHeight = parsedData.GameWindow.size[1];
                windowSizeRatio =
                  parsedData.GameWindow.size[0] / parsedData.GameWindow.size[1];
                this.setState({
                  windowWidth: parsedData.GameWindow.size[0],
                  windowHeight: parsedData.GameWindow.size[1],
                });
              }
              if (parsedData.GameWindow.mode) {
                this.setState({
                  windowSize: parsedData.GameWindow.mode,
                });
              }
            } else {
              this.setState({
                gameWindowShow: false,
              });
            }
          }
          this.handleResize(); // once new width.height and ratio has been defined, immediately run resize function

          //Check if Fingerprint in response
          if (parsedData.GameWindow && parsedData.GameWindow.imageControls) {
            this.setState({
              imageControls: parsedData.GameWindow.imageControls,
            });
          }

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
                image: "data:image/jpeg;base64, " + parsedData.nextBlock.image,
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
          //Check if infoPanel is in the recieved data
          if ("InfoPanel" in parsedData) {
            this.setState({
              infoPanel: parsedData.InfoPanel,
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
          //Check if Grid in response
          if ("grid" in parsedData) {
            this.setState({
              grid: parsedData.grid,
            });
          }
          //Check if frame related information in response
          if (
            parsedData.GameWindow &&
            parsedData.GameWindow.frame &&
            parsedData.GameWindow.frameId
          ) {
            let frame = parsedData.GameWindow.frame;
            let frameId = parsedData.GameWindow.frameId;
            // set new border color
            if ("borderColor" in parsedData.GameWindow) {
              this.setState({
                borderColor: parsedData.GameWindow.borderColor,
              });
            }

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

          //check if textbox is in the server's response
          if (parsedData.TextBox) {
            this.setState({
              textbox: parsedData.TextBox,
            });
          }

          //check if backend is making a request
          if (parsedData.Request) {
            if (parsedData.Request[0] === "TEXTBOX") {
              this.sendMessage({
                TextEvent: {
                  TEXTREQUEST: this.state.textAreaInput,
                },
              });
            } else if (parsedData.Request[0] === "CODEEDITOR") {
              this.sendMessage({
                CodeEvent: {
                  CODEREQUEST: this.state.code_editor.text,
                },
              });
            }
          }

          //check if CodeEditor is in the server's response
          if (parsedData.CodeEditor) {
            this.setState({
              code_editor: parsedData.CodeEditor,
            });
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
      // don't execute the following code if the user is typing in the inputbox
      if (
        document.activeElement.tagName !== "TEXTAREA" &&
        document.activeElement.className !== "cm-content"
      ) {
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

        if (this.state.keys) {
          if (!event.repeat) {
            this.sendMessage({
              // TODO: add mod event
              KeyboardEvent: {
                KEYDOWN: [event.key, event.key.charCodeAt(0)],
              },
            });
          }
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
      if (this.state.keys) {
        this.sendMessage({
          KeyboardEvent: {
            KEYUP: [event.key],
          },
        });
      }
    });

    // Get the client window width to make the game window responsive
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    if (this.setInMessage) clearInterval(this.setInMessage);
  }

  // check every second if the resize has stopped
  resizeCalled = () => {
    var resizeCalled = setInterval(() => {
      var currWidth = this.state.windowWidth;
      var currHeight = this.state.windowHeight;
      if (
        currWidth === prevDimensions.width &&
        currHeight === prevDimensions.height
      ) {
        // the resize has stopped. Send new dimensions to backend
        // TODO: also clear interval
        var currSize = [currWidth, currHeight];
        if (JSON.stringify(currSize) !== JSON.stringify(prevSendSize)) {
          this.sendMessage({
            WindowEvent: {
              WINDOWRESIZED: currSize,
            },
          });
          prevSendSize = currSize;
          isResizeCalled = false;
          clearInterval(resizeCalled);
        }
      } else {
        prevDimensions.width = currWidth;
        prevDimensions.height = currHeight;
      }
    }, 1000);
  };

  handleResize = () => {
    //TODO: windowIdshould be added here
    if (!isResizeCalled) {
      isResizeCalled = true;
      this.resizeCalled();
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
      let newHeight = value / windowSizeRatio;
      this.setState({
        windowWidth: value,
        windowHeight: newHeight,
      });
    }
  };

  // Change the confirmation modal to be invisible
  // Navigate to the post-game page
  handleOk = (e, value) => {
    if (
      e.currentTarget.id === "keepMinutiae" ||
      e.currentTarget.id === "resetAll"
    ) {
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
    } else if (value === "buttonOk") {
      this.setState({
        buttonModalVisible: false,
      });
      this.handleButton(null, this.state.buttonValue);
    }
    if (value === "gameEndOk") {
      this.setState({
        gameEndVisible: false,
      });
      this.props.action();
    }
  };

  // Change the confirmation modal to be invisible
  // Stay on the game page
  handleCancel = (e, value) => {
    // this is for the cancel button in the "reset image" modal
    if (e.currentTarget.id === "resetCancel") {
      this.setState({
        resetModalVisible: false,
      });
    } else if (value === "buttonCancel") {
      this.setState({
        buttonModalVisible: false,
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

  handleButton = (button, value) => {
    if (this.state.isLoading) {
      message.error("Please wait for the connection to be established first!");
      return;
    }

    if (button && button.Button.confirm) {
      this.setState({
        buttonModalVisible: true,
        buttonValue: value,
      });
      if (button.Button.confirmMessage) {
        this.setState({
          confirmMessage: button.Button.confirmMessage,
        });
      } else {
        this.setState({ confirmMessage: null });
      }
      return;
    }

    if (value === "submitImage") {
      this.sendMessage({
        ButtonEvent: {
          BUTTONPRESSED: value,
          minutiaList: this.normalizeMinutiae(this.state.minutiae),
        },
      });
    } else {
      this.sendMessage({
        ButtonEvent: {
          BUTTONPRESSED: value,
        },
      });
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
      this.sendMessage({
        ButtonEvent: {
          BUTTONPRESSED: status,
        },
      });
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

  resetGrid = () => {};
  setResetGrid = (handleReset) => {
    this.resetGrid = handleReset;
  };

  submitGrid = () => {};
  setSubmitGrid = (handleSubmit) => {
    this.submitGrid = handleSubmit;
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
      SliderEvent: {
        SLIDERSET: [type, value],
      },
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
    if (this.state.imageControls) {
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
    let pxsMovement = [currX - prevMouseData.x, currY - prevMouseData.y];
    prevMouseData.x = currX;
    prevMouseData.y = currY;
    return [pxsMovement[0], pxsMovement[1]];
  };

  // every time a new frame is recieved, send information about the mouse motion
  // also send message every time mouse up or down occurs
  sendMouseData = (eventType, x, y, button) => {
    [x, y] = [parseInt(x), parseInt(y)];
    var buttonTuple = this.getButtonTuple(button);
    var [xMovement, yMovement] = this.getMouseData(x, y);

    //TODO: windowId should be added here
    if (eventType === "MOUSEMOTION") {
      this.sendMessage({
        MouseEvent: {
          MOUSEMOTION: [
            { x, y },
            { xMovement, yMovement },
            buttonTuple,
            button,
          ], // button represents an integer value for which button has been pressed
        },
      });
    } else {
      this.sendMessage({
        MouseEvent: {
          [eventType]: [{ x, y }, buttonTuple, button],
        },
      });
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

  textBoxInput = (data) => {
    this.setState({
      textAreaInput: data,
    });
  };

  codeEditorInput = (text) => {
    const new_code_editor = this.state.code_editor;
    new_code_editor.text = text;
    this.setState({
      code_editor: new_code_editor,
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
      infoPanel,
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
      imageControls,
      minutiae,
      addingMinutiae,
      resetModalVisible,
      orientation,
      windowWidth,
      windowHeight,
      score,
      scoreModalVisible,
      buttonModalVisible,
      maxScore,
      undoEnabled,
      redoEnabled,
      grid,
      previousBlock,
      currentBlock,
      nextBlock,
      controlPanel,
      textbox,
      code_editor,
      gameWindowShow,
      confirmMessage,
      borderColor,
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
            {imageControls ? (
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
            ) : grid ? (
              <Grid
                grid={grid}
                sendMessage={this.sendMessage}
                setResetGrid={this.setResetGrid}
                setSubmitGrid={this.setSubmitGrid}
              />
            ) : gameWindowShow ? (
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
                borderColor={borderColor}
              />
            ) : null}
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
          <Col className="rightColumn">
            {textbox ? (
              <TextBox
                className="textBox"
                textBox={textbox}
                onChange={this.textBoxInput}
                isLoading={isLoading}
                orientation={orientation}
              />
            ) : null}
            {code_editor ? (
              <CodeMirror
                value={code_editor.text || ""}
                extensions={[]}
                onChange={(value) => {
                  this.codeEditorInput(value);
                }}
                width={code_editor.size[0] || 700}
                height={code_editor.size[1] || 600}
              />
            ) : null}
            <div
              className={textbox ? `${orientation}Panels` : "verticalPanels"}
            >
              {infoPanel ? (
                <div className={`${orientation}Info`}>
                  <InfoPanel
                    className="infoPanel"
                    infoPanel={infoPanel}
                    orientation={orientation}
                  />
                </div>
              ) : null}
              {controlPanel ? (
                <div className="control">
                  <ControlPanel
                    className="gameControlPanel"
                    isEnd={isEnd}
                    isLoading={isLoading}
                    frameRate={frameRate}
                    inputFrameRate={this.state.inputFrameRate}
                    UIlist={UIlist}
                    instructions={instructions}
                    infoPanel={infoPanel}
                    DEBUG={DEBUG}
                    handleOk={this.handleOk}
                    handleFPS={this.handleFPS}
                    handleCommand={this.handleCommand}
                    handleButton={this.handleButton}
                    handleImage={this.handleImage}
                    handleImageCommands={this.handleImageCommands}
                    handleChanging={this.handleChanging}
                    sendMessage={this.sendMessage}
                    fingerprint={this.state.imageControls}
                    addMinutia={this.addMinutia}
                    brightness={brightness}
                    contrast={contrast}
                    saturation={saturation}
                    hue={hue}
                    addingMinutiae={addingMinutiae}
                    orientation={orientation}
                    undoEnabled={undoEnabled}
                    redoEnabled={redoEnabled}
                    imageControls={imageControls}
                    blockButtons={
                      currentBlock
                        ? [previousBlock, currentBlock, nextBlock]
                        : null
                    }
                    controlPanel={controlPanel}
                  />
                </div>
              ) : null}
            </div>
          </Col>
        </div>

        <Modal
          title="Game end message"
          visible={gameEndVisible}
          onOk={(e) => this.handleOk(e, "gameEndOk")}
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
        <Modal
          visible={buttonModalVisible}
          onOk={(e) => this.handleOk(e, "buttonOk")}
          onCancel={(e) => this.handleCancel(e, "buttonCancel")}
          okText="Confirm"
          cancelText="Cancel"
        >
          <p>{confirmMessage ? confirmMessage : "Are you sure?"}</p>
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

import React from 'react';
import 'antd/dist/antd.css';
import './game.css';
import {message, Spin, Modal } from 'antd';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import {browserName,osName,browserVersion,osVersion} from 'react-device-detect';
import getKeyInput from '../utils/getKeyInput';
import {WS_URL, USER_ID, PROJECT_ID, SERVER} from '../utils/constants';
import ControlPanel from './control';

class Game extends React.Component{
    
    state = {
        frameCount : 0,
        frameId : 0,
        frameRate : 30,
        frameSrc : "",
        isLoading : true,
        isEnd : false,
        isVisible : false,
        UIlist : [],
    }

    componentDidMount() {
        //To ensure the websocket server is ready to connect
        //we try to connect the webscoket server periodically
        //for every 30 seconds until the connection has been established
        this.timer = setInterval(() => {
            //connect the websocket server
            this.websocket = new W3CWebSocket(WS_URL);
            this.websocket.onopen = () => {
                clearTimeout(this.timer);
                console.log('WebSocket Client Connected');
                this.setState(({
                    isLoading : false
                }))
                this.sendMessage({
                    userId : USER_ID,
                    projectId : PROJECT_ID
                })
            };

            //listen to the data from the websocket server
            this.websocket.onmessage = (message) => {
                //"done" means the game has ended
                if(message.data === "done"){
                    this.setState(({
                        isEnd : true,
                        isVisible : true
                    }))
                //parse the data from the websocket server
                }else{
                    let parsedData = JSON.parse(message.data);
                    if(parsedData.UI){
                        this.setState(({
                            UIlist : parsedData.UI
                        }))
                    }
                    if(parsedData.frame){
                        let frame = parsedData.frame;
                        let frameId = parsedData.frameId;
                        this.setState(prevState => ({
                            frameSrc : "data:image/jpeg;base64, " + frame,
                            frameCount : prevState.frameCount + 1,
                            frameId : frameId
                        }));
                    }
                }
            };

            //listen to the websocket closing status
            this.websocket.onclose = () => {
                console.log('WebSocket Client Closed');
            }
        }, SERVER ? 0 : 30000);

        //listen to the user's keyboard inputs
        document.addEventListener('keydown', (event) => {
            if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
                event.preventDefault();
            }
            let dataToSend = getKeyInput(event.code);
            if(this.state.UIlist.includes(dataToSend.action)){
                this.sendMessage(dataToSend);
                document.getElementById(dataToSend.action).focus();
            }
        })
    }

    //change the confirmation modal to be invisible
    //navigate to the post-game page
    handleOk = e => {
        this.setState({
          isVisible : false
        });
        this.props.action()
      };
    
    //change the confirmation modal to be invisible
    //stay on the game page
    handleCancel = e => {
        this.setState({
            isVisible : false
        });
    };

    //send data to websocket server in JSON format
    sendMessage = (data) => {
        const allData = {
            ...data,
            frameCount : this.state.frameCount,
            frameId : this.state.frameId
        }
        this.websocket.send(JSON.stringify(allData));
    }

    //send game control commands to the websocket server
    handleCommand = (status) => {
        if(this.state.isLoading){
            message.error("Please wait the connection to be established first!")
            return;
        }
        if(status === "start"){
            this.sendMessage({
                command : status,
                system : osName,
                systemVersion : osVersion,
                browser : browserName,
                browserVersion : browserVersion,
            })
        }else if (status === "stop" || status === "pause"){
            this.sendMessage({
                command : status
            })   
        }
        else{
            this.sendMessage({
                command : status
            })
        }   
    }

    //chnage the FPS of the game
    handleFPS = (speed) => {
        if((speed === "faster" && this.state.frameRate + 5 > 90) || (speed === "slower" && this.state.frameRate - 5 < 1)){
            message.error("Invalid FPS, the FPS can only between 1 - 90!")
        }else{
            this.setState(prevState => ({
                frameRate : speed === "faster" ? prevState.frameRate + 5 : prevState.frameRate - 5
            }))
            this.sendMessage({
                changeFrameRate : speed
            })
        }
    }

    render() {
        const {isLoading, frameSrc, frameRate, isEnd, UIlist} = this.state;

        return (
            <div>
                <div className="gameWindow">
                    {isLoading || !frameSrc ?
                    <Spin className="Loader" size = "large" tip="The robot is about to start the game, please wait ..." /> 
                    : <img className="gameContent" src={frameSrc} alt="frame" width="700px" height="600px" />
                    }
                </div>
                <Modal
                    title="Game end message"
                    visible={this.state.isVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    >
                    <p className="modal">The game has ended</p>
                    <p className="modal">Press <b>"Cancel"</b> to stay on this page</p>
                    <p className="modal">Press <b>"OK"</b> to move to next step</p>
                </Modal>
                {!isLoading ? 
                    <ControlPanel 
                        isEnd={isEnd} 
                        frameRate={frameRate} 
                        UIlist={UIlist} 
                        handleOk={this.handleOk} 
                        handleFPS={this.handleFPS}
                        handleCommand={this.handleCommand} 
                        sendMessage={this.sendMessage}
                /> : null
                }
            </div>
        )
    }
}

export default Game;
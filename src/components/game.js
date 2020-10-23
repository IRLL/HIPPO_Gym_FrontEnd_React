import React from 'react';
import 'antd/dist/antd.css';
import './game.css';
import {message, Modal, Progress } from 'antd';
import { w3cwebsocket } from "websocket";
import {browserName,osName,browserVersion,osVersion} from 'react-device-detect';
import getKeyInput from '../utils/getKeyInput';
import {WS_URL, USER_ID, PROJECT_ID, SERVER} from '../utils/constants';
import ControlPanel from './control';

const pendingTime = 30;

class Game extends React.Component{
    
    state = {
        frameCount : 0,
        frameId : 0,
        frameRate : 30,
        frameSrc : "",
        isLoading : !SERVER ? true : false,
        isEnd : false,
        isConnection : false,
        isVisible : false,
        UIlist : [],
        progress : 0
    }

    componentDidMount() {
        //To update the progress of loading game content
        //Since we always need to wait 30 seconds before the game
        //content get loaded, we update the progress (100/30) per second
        this.updateProgress = setInterval(() => 
            this.setState(prevState => ({
                progress : prevState.progress+(100/pendingTime)
            }))
        ,1000)
        //To ensure the websocket server is ready to connect
        //we try to connect the webscoket server periodically
        //for every 30 seconds until the connection has been established
        this.timer = setTimeout(() => {
            //connect the websocket server
            this.websocket = new w3cwebsocket(WS_URL);
            this.websocket.onopen = () => {
                //Once the websocket connection has been established
                //we remove all the unnecessary timer
                clearTimeout(this.timer);
                clearInterval(this.updateProgress);
                console.log('WebSocket Client Connected');
                this.setState(({
                    isLoading : false,
                    isConnection : true
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
                    //Check if filed UI in response
                    if(parsedData.UI){
                        this.setState(({
                            UIlist : parsedData.UI
                        }))
                    }
                    //Check if field frame in response
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
                this.setState(({
                    isConnection : false
                }))
            }
        }, SERVER ? 0 : pendingTime * 1000);

        //listen to the user's keyboard inputs
        document.addEventListener('keydown', (event) => {
            //Used to prevent arrow keys and space key from scrolling the page
            let dataToSend = getKeyInput(event.code);
            if(dataToSend.actionType !== null){
                event.preventDefault();
            }
            
            if(this.state.UIlist.includes(dataToSend.action)){
                this.sendMessage(dataToSend);
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
        if(this.state.isConnection){
            const allData = {
                ...data,
                frameCount : this.state.frameCount,
                frameId : this.state.frameId
            }
            this.websocket.send(JSON.stringify(allData));
        }
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
        const {isLoading, frameSrc, frameRate, isEnd, UIlist, progress} = this.state;

        return (
            <div>
                <div className="gameWindow">
                    {isLoading || !frameSrc ?
                    <div className="progressBar">
                        <Progress width={80} type="circle" percent={Math.round(progress)}/>
                        <p className="promptText">The robot is about to start the game, please wait ...</p> 
                    </div>
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
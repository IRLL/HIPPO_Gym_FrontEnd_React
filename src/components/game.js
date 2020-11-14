import React from 'react';
import 'antd/dist/antd.css';
import './game.css';
import {message, Modal, Row, Col } from 'antd';
import { w3cwebsocket } from "websocket";
import {browserName,osName,browserVersion,osVersion} from 'react-device-detect';
import getKeyInput from '../utils/getKeyInput';
import {WS_URL, USER_ID, PROJECT_ID, SERVER, DEBUG} from '../utils/constants';
import ControlPanel from './control';
import BudgetBar from './budgetBar';
import MessageViewer from './MessageViewer';
import GameWindow from './gameWindow';

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
        progress : 0,
        allData : null,
        inputBudget : 0,
        usedInputBudget : 0,
        receiveData : null,
        isPause : false,
        inMessage : [],
        outMessage : []
    }

    componentDidMount() {

        if(DEBUG){
            this.setInMessage = setInterval(() => {
                if(this.state.receiveData && !this.state.isPause){
                    this.setState(prevState => ({
                        inMessage : [prevState.receiveData,...prevState.inMessage]
                    }))
                }
            },1000)
        }

        //Running a check every 1/100 second(10 millisecond)
        //If allData is not null then send the message
        //otherwise just wait until next checking
        this.sendData = setInterval(() => {
            if(this.state.allData && this.state.isConnection){
                this.websocket.send(JSON.stringify(this.state.allData));
                //record every message send to the server
                if(DEBUG){
                    this.setState(prevState => ({
                        outMessage : [prevState.allData,...prevState.outMessage],
                    }))
                }
                this.setState(({allData : null}));
            }
        }, 10);

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
                    //Check if budget bar should be loaded
                    if(parsedData.inputBudget && parsedData.usedInputBudget){
                        this.setState(({
                            inputBudget : parsedData.inputBudget,
                            usedInputBudget : parsedData.usedInputBudget
                        }))
                    }
                    //Check if filed UI in response
                    if(parsedData.UI){
                        this.setState(({
                            UIlist : parsedData.UI
                        }))
                    }
                    //Check if field frame in response
                    if(parsedData.frame && parsedData.frameId){
                        let frame = parsedData.frame;
                        let frameId = parsedData.frameId;
                        this.setState(prevState => ({
                            frameSrc : "data:image/jpeg;base64, " + frame,
                            frameCount : prevState.frameCount + 1,
                            frameId : frameId
                        }));
                    }
                    //record every message received from the server
                    if(DEBUG){
                        this.setState(({
                            receiveData : parsedData
                        }))
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

    componentWillUnmount() {
        clearInterval(this.sendData);
        if(this.setInMessage) clearInterval(this.setInMessage);
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
            this.setState(({
                allData : allData
            }))
        }
    }

    //send game control commands to the websocket server
    handleCommand = (status) => {

        const {isLoading, inputBudget, usedInputBudget} = this.state;

        if(isLoading){
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
        }else{
            if(status === 'pause') this.setState(prevState => ({isPause : !prevState.isPause}));
            if(["good","bad"].includes(status) && inputBudget > 0){
                if(usedInputBudget <= inputBudget){
                    this.setState(prevState => ({
                        usedInputBudget : prevState.usedInputBudget + 1
                    }))
                }else{
                    message.error("You have consumed all the reward budget!",3);
                    return;
                }
            }
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
        const {inMessage, outMessage, isLoading, frameSrc, frameRate, isEnd, UIlist, progress, isVisible, inputBudget, usedInputBudget} = this.state;

        return (
            <div>
                <Row>
                    <Col flex={1}><MessageViewer title="Message In" data={inMessage} visible={DEBUG} /></Col>

                    <Col flex={2}><GameWindow isLoading={isLoading} frameSrc={frameSrc} progress={progress} /></Col>

                    <Col flex={1}><MessageViewer title="Message Out" data={outMessage} visible={DEBUG} /></Col>
                </Row>
                
                <BudgetBar visible={inputBudget>0} isLoading={isLoading} usedInputBudget={usedInputBudget} inputBudget={inputBudget} /> 
                
                <ControlPanel 
                    isEnd={isEnd} 
                    isLoading={isLoading}
                    frameRate={frameRate} 
                    UIlist={UIlist} 
                    handleOk={this.handleOk} 
                    handleFPS={this.handleFPS}
                    handleCommand={this.handleCommand} 
                    sendMessage={this.sendMessage}
                />

                <Modal
                    title="Game end message"
                    visible={isVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    >
                    <p className="modal">The game has ended</p>
                    <p className="modal">Press <b>"Cancel"</b> to stay on this page</p>
                    <p className="modal">Press <b>"OK"</b> to move to next step</p>
                </Modal>
            </div>
        )
    }
}

export default Game;
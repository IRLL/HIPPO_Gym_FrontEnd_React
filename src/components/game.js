import React from 'react';
import 'antd/dist/antd.css';
import './game.css';
import {CaretRightOutlined,PauseOutlined,ArrowUpOutlined,ArrowDownOutlined,ArrowLeftOutlined,
    ArrowRightOutlined, ReloadOutlined, UpOutlined, DownOutlined, StopOutlined,
    CloudUploadOutlined,CloudDownloadOutlined, SendOutlined} from '@ant-design/icons';
import { Button,message, Input, Spin, Tooltip, Modal, Row, Col } from 'antd';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import {browserName,osName,browserVersion,osVersion} from 'react-device-detect';
import getKeyInput from '../utils/getKeyInput';
import {WS_URL,USER_ID, PROJECT_ID} from '../utils/constants';

class Game extends React.Component{
    
    state = {
        isStart : false,
        frameCount : 0,
        frameId : 0,
        frameRate : 30,
        frameSrc : "",
        isLoading : true,
        isEnd : false,
        isVisible : false,
        UIlist : []
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
                this.setState(({
                    isEnd : true,
                    isVisible : true
                }))
            }
        }, 30000);

        //listen to the user's keyboard inputs
        document.addEventListener('keydown', (event) => {
            if([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
                event.preventDefault();
            }
            this.sendMessage(getKeyInput(event.code));
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
    handleCommand(status){
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
            this.setState(prevState => ({
                isStart : !prevState.isStart
            }))
        }else if (status === "stop" || status === "pause"){
            this.sendMessage({
                command : status
            })   
            this.setState(prevState => ({
                isStart : !prevState.isStart,
            }));
        }
        else{
            this.sendMessage({
                command : status
            })
        }   
    }

    //chnage the FPS of the game
    handleFPS(speed){
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
        const {isLoading, frameSrc, isStart, frameRate, isEnd} = this.state;
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
                    <p>The game has ended</p>
                    <p>Press <b>Cancel</b> to stay on this page</p>
                    <p>Press <b>OK</b> to move to next step</p>
                </Modal>
                
                <div className="controlPanel">
                    <div className="panelContainer">
                    <Row gutter={[4, 8]}>
                        <Col span={2} />
                        <Col span={4} >
                            <Tooltip placement="left" title="Move Up" arrowPointAtCenter>
                                <Button shape="round" size="large" icon={<ArrowUpOutlined />} onClick={() => this.sendMessage({actionType : "mousedonw",action : "up"})}/>
                            </Tooltip></Col>
                        <Col span={5} >
                        {isStart ? <Button shape="round" type="danger" icon={<PauseOutlined  />} size='large' onClick={() => this.handleCommand("pause")}>Pause</Button> 
                            : <Button shape="round" type="primary"  icon={<CaretRightOutlined />} size='large' onClick={() => this.handleCommand("start")}>Start</Button>
                        }
                        </Col>
                        <Col span={5} ><Button shape="round" type="danger" icon={<StopOutlined  />} size='large' onClick={() => this.handleCommand("stop")}>Stop</Button></Col>
                        <Col span={4} ><Button shape="round" type="primary" className="resetButton"  icon={<ReloadOutlined />} size='large' onClick={() => this.handleCommand("reset")}>Reset</Button></Col>
                        <Col span={2} ><Button className="badButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.handleCommand("bad")}>Bad</Button></Col>
                    </Row>
                    <Row gutter={[4, 8]}>
                        <Col span={4} >
                            <Tooltip placement="bottom" title="Move Left" arrowPointAtCenter>
                                <Button shape="round" size="large" icon={<ArrowLeftOutlined />} onClick={() => this.sendMessage({actionType : "mousedown", action :"left"})}/>
                            </Tooltip>
                        </Col>
                        <Col span={2} >
                            <Tooltip placement="top" title="Move Right" arrowPointAtCenter>
                                <Button shape="round" size="large" icon={<ArrowRightOutlined />} onClick={() => this.sendMessage({actionType : "mousedown" , action : "right"})}/>
                            </Tooltip></Col>
                        <Col span={5} ><Button className="onlineButton" shape="round" icon={<CloudUploadOutlined />} type="primary" size='large' onClick={() => this.handleCommand("trainOnline")}>Train Online</Button></Col>
                        <Col span={5} ><Button className="offlineButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.handleCommand("trainOffline")}>Train Offline</Button></Col>
                        <Col span={4} ><Button className="goodButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.handleCommand("good")}>Good</Button></Col>                    </Row>
                    <Row gutter={[4,8]}>
                        <Col span={2} />
                        <Col span={4} >
                            <Tooltip placement="right" title="Move Down" arrowPointAtCenter>
                                <Button shape="round" size="large" icon={<ArrowDownOutlined />} onClick={() => this.sendMessage({actionType : "mousedown",action : "down"})}/>
                            </Tooltip></Col>
                            <Col span={5}><Input className="fpsInput" defaultValue={30} value={frameRate} suffix="FPS"/></Col>
                            <Col span={5}>
                                <Tooltip placement="bottom" title="Increase the FPS" arrowPointAtCenter>
                                    <Button shape="round" size="large" icon={<UpOutlined />} onClick={() => this.handleFPS("faster")}/>
                                </Tooltip>
                                <Tooltip placement="bottom" title="Decrease the FPS" arrowPointAtCenter>
                                    <Button shape="round" size="large" icon={<DownOutlined />} onClick={() => this.handleFPS("slower")}/>
                                </Tooltip>
                            </Col>
                            <Col span={4}>
                                {isEnd ? <Tooltip placement="bottom" title="Move to next step" arrowPointAtCenter>
                                            <Button type="primary" shape="round" size="large" icon={<SendOutlined />} onClick={this.handleOk}>Next</Button>
                                        </Tooltip> : null}
                            </Col>
                    </Row>
                    </div>
                </div>
            </div>
        )}
}

export default Game;
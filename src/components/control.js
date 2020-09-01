import React from 'react';
import 'antd/dist/antd.css';
import './control.css';
import {CaretRightOutlined,PauseOutlined,ArrowUpOutlined,ArrowDownOutlined,ArrowLeftOutlined,
    ArrowRightOutlined, ReloadOutlined, UpOutlined, DownOutlined, StopOutlined,
    CloudUploadOutlined,CloudDownloadOutlined, SendOutlined} from '@ant-design/icons';
import { Button, Input, Tooltip, Row, Col } from 'antd';

class ControlPanel extends React.Component{

    render(){
        const {isStart,isEnd, frameRate, UIlist} = this.props;

        const firstRow = [];
        const secondRow = [];
        const thirdRow = [];

        const elements = {
            up : <Col span={4} >
            <Tooltip placement="left" title="Move Up" arrowPointAtCenter>
                <Button shape="round" size="large" icon={<ArrowUpOutlined />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "up"})}/>
            </Tooltip></Col>,
            down : <Col span={4} >
            <Tooltip placement="right" title="Move Down" arrowPointAtCenter>
                <Button shape="round" size="large" icon={<ArrowDownOutlined />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "down"})}/>
            </Tooltip></Col>,
            left : <Col span={4} >
                    <Tooltip placement="bottom" title="Move Left" arrowPointAtCenter>
                        <Button shape="round" size="large" icon={<ArrowLeftOutlined />} onClick={() => this.props.sendMessage({actionType : "mousedown", action :"left"})}/>
                    </Tooltip>
                </Col>,
            right : <Col span={2} >
            <Tooltip placement="top" title="Move Right" arrowPointAtCenter>
                <Button shape="round" size="large" icon={<ArrowRightOutlined />} onClick={() => this.props.sendMessage({actionType : "mousedown" , action : "right"})}/>
            </Tooltip></Col>,
            start : <Col >
            {isStart ? <Button shape="round" type="danger" icon={<PauseOutlined  />} size='large' onClick={() => this.props.handleCommand("pause")}>Pause</Button> 
                : <Button shape="round" type="primary"  icon={<CaretRightOutlined />} size='large' onClick={() => this.props.handleCommand("start")}>Start</Button>
            }
            </Col>,
            stop :  <Col ><Button shape="round" type="danger" icon={<StopOutlined  />} size='large' onClick={() => this.props.handleCommand("stop")}>Stop</Button></Col>,
            reset :  <Col ><Button shape="round" type="primary" className="resetButton"  icon={<ReloadOutlined />} size='large' onClick={() => this.props.handleCommand("reset")}>Reset</Button></Col>,
            good : <Col ><Button className="goodButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.props.handleCommand("good")}>Good</Button></Col>, 
            bad : <Col ><Button className="badButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.props.handleCommand("bad")}>Bad</Button></Col>,
            trainOnline : <Col ><Button className="onlineButton" shape="round" icon={<CloudUploadOutlined />} type="primary" size='large' onClick={() => this.props.handleCommand("trainOnline")}>Train Online</Button></Col>,
            trainOffline : <Col ><Button className="offlineButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.props.handleCommand("trainOffline")}>Train Offline</Button></Col>,
            fpsSet : <Col ><Input className="fpsInput" defaultValue={30} value={frameRate} suffix="FPS"/></Col>,
            fpsUp : <Col>
                    <Tooltip placement="bottom" title="Increase the FPS" arrowPointAtCenter>
                        <Button shape="round" size="large" icon={<UpOutlined />} onClick={() => this.props.handleFPS("faster")}/>
                    </Tooltip>
                    </Col>,
            fpsDown : <Col><Tooltip placement="bottom" title="Decrease the FPS" arrowPointAtCenter>
                            <Button shape="round" size="large" icon={<DownOutlined />} onClick={() => this.props.handleFPS("slower")}/>
                        </Tooltip>
                      </Col>
        }

        UIlist.forEach(ele =>{
            if(["up","start","stop","reset","good"].includes(ele)){
                firstRow.push(elements[ele])
            }
            if(['left','right','trainOnline','trainOffline','bad'].includes(ele)){
                secondRow.push(elements[ele]);
            }
            if(['down','fpsSet','fpsUp','fpsDown'].includes(ele)){
                thirdRow.push(elements[ele])
            }
        })
        return(
            <div className="controlPanel">
                <div className="panelContainer">
                <Row gutter={[4, 8]}>
                    <Col span={2} />
                    {firstRow}
                </Row>
                <Row gutter={[4, 8]}>
                    {secondRow}                 
                </Row>
                <Row gutter={[4,8]}>
                    <Col span={2} />
                    {thirdRow}
                    <Col >
                    {isEnd ? <Tooltip placement="bottom" title="Move to next step" arrowPointAtCenter>
                                <Button type="primary" shape="round" size="large" icon={<SendOutlined />} onClick={this.props.handleOk}>Next</Button>
                            </Tooltip> : null}
                    </Col>
                </Row>
                </div>
            </div>
        )
    }

}

export default ControlPanel;
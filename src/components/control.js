import React from 'react';
import 'antd/dist/antd.css';
import './control.css';
import {CaretRightOutlined,PauseOutlined, ReloadOutlined, UpOutlined,
    DownOutlined, StopOutlined, CloudUploadOutlined,CloudDownloadOutlined,
    SendOutlined,CheckOutlined,CloseOutlined} from '@ant-design/icons';
import { Button, Input, Tooltip, Row, Col } from 'antd';
import {ImArrowLeft2,ImArrowRight2,ImArrowUp2,ImArrowDown2,ImArrowUpLeft2,
    ImArrowUpRight2,ImArrowDownRight2,ImArrowDownLeft2} from "react-icons/im";
import {GrVulnerability} from 'react-icons/gr';

class ControlPanel extends React.Component{

    render(){
        const {isStart,isEnd, frameRate, UIlist} = this.props;

        const elements = {
            leftUp : <Col span={2} >
                        {UIlist.includes('leftUp') ? <Button shape="round" size="large" icon={<ImArrowUpLeft2 />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "leftUp"})}/> : null}
                    </Col>,
            up : <Col span={2} >
                    {UIlist.includes("up") ? <Button shape="round" size="large" icon={<ImArrowUp2 />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "up"})}/> : null}
                </Col>,
            rightUp : <Col span={2} >
                        {UIlist.includes("rightUp") ? <Button shape="round" size="large" icon={<ImArrowUpRight2 />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "rightUp"})}/> : null}
                    </Col>,
            leftDown : <Col span={2} >
                        {UIlist.includes("leftDown") ? <Button shape="round" size="large" icon={<ImArrowDownLeft2 />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "leftDown"})}/> : null}
                        </Col>,
            down : <Col span={2} >
                        {UIlist.includes("down") ? <Button shape="round" size="large" icon={<ImArrowDown2 />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "down"})}/> : null}
                    </Col>,
            rightDown : <Col span={2} >
                            {UIlist.includes("rightDown") ? <Button shape="round" size="large" icon={<ImArrowDownRight2 />} onClick={() => this.props.sendMessage({actionType : "mousedown",action : "rightDown"})}/> : null}
                        </Col>,
            left :  <Col span={2} >
                        {UIlist.includes("left") ? <Button shape="round" size="large" icon={<ImArrowLeft2 />} onClick={() => this.props.sendMessage({actionType : "mousedown", action :"left"})}/> : null}
                    </Col>,
            right : <Col span={2} >
                        {UIlist.includes("right") ? <Button shape="round" size="large" icon={<ImArrowRight2 />} onClick={() => this.props.sendMessage({actionType : "mousedown" , action : "right"})}/> : null}
                    </Col>,
            fire : <Col span={2} >
                        {UIlist.includes("fire") ? <Button shape="round" size="large" icon={<GrVulnerability />} onClick={() => this.props.sendMessage({actionType : "mousedown" , action : "fire"})}/> : null}
                    </Col>,
            start : <Col>
                        {isStart ? <Button shape="round" type="danger" icon={<PauseOutlined  />} size='large' onClick={() => this.props.handleCommand("pause")}>Pause</Button> 
                            : <Button shape="round" type="primary"  icon={<CaretRightOutlined />} size='large' onClick={() => this.props.handleCommand("start")}>Start</Button>
                        }
                    </Col>,
            stop :  <Col><Button shape="round" type="danger" icon={<StopOutlined  />} size='large' onClick={() => this.props.handleCommand("stop")}>Stop</Button></Col>,
            reset :  <Col><Button shape="round" type="primary" className="resetButton"  icon={<ReloadOutlined />} size='large' onClick={() => this.props.handleCommand("reset")}>Reset</Button></Col>,
            good : <Col><Button className="goodButton" shape="round" type="primary" size='large' icon={<CheckOutlined />} onClick={() => this.props.handleCommand("good")}>Good</Button></Col>, 
            bad : <Col><Button className="badButton" shape="round" type="primary" size='large' icon={<CloseOutlined />} onClick={() => this.props.handleCommand("bad")}>Bad</Button></Col>,
            trainOnline : <Col><Button className="onlineButton" shape="round" icon={<CloudUploadOutlined />} type="primary" size='large' onClick={() => this.props.handleCommand("trainOnline")}>Train Online</Button></Col>,
            trainOffline : <Col><Button className="offlineButton" shape="round" type="primary" size='large' icon={<CloudDownloadOutlined />} onClick={() => this.props.handleCommand("trainOffline")}>Train Offline</Button></Col>,
            fpsSet : <Col><Input className="fpsInput" defaultValue={30} value={frameRate} suffix="FPS"/></Col>,
            fpsUp : <Col>
                        <Tooltip placement="bottom" title="Increase the FPS by 5" arrowPointAtCenter>
                            <Button shape="round" size="large" icon={<UpOutlined />} onClick={() => this.props.handleFPS("faster")}/>
                        </Tooltip>
                    </Col>,
            fpsDown : <Col>
                        <Tooltip placement="bottom" title="Decrease the FPS by 5" arrowPointAtCenter>
                            <Button shape="round" size="large" icon={<DownOutlined />} onClick={() => this.props.handleFPS("slower")}/>
                        </Tooltip>
                      </Col>
        }

        const firstRow = [elements['leftUp'],elements['up'],elements['rightUp']];
        const secondRow = [elements['left'],elements['fire'],elements['right']];
        const thirdRow = [elements['leftDown'],elements['down'],elements['rightDown']];

        UIlist.forEach(ele =>{
            if(["start","stop","reset","good"].includes(ele)){
                firstRow.push(elements[ele])
            }
            if(['trainOnline','trainOffline','bad'].includes(ele)){
                secondRow.push(elements[ele]);
            }
            if(['fpsSet','fpsUp','fpsDown'].includes(ele)){
                thirdRow.push(elements[ele])
            }
        })
        return(
            <div className="controlPanel">
                <div className="panelContainer">
                <Row gutter={[4, 8]}>
                    {firstRow}
                </Row>
                <Row gutter={[4, 8]}>
                    {secondRow}                 
                </Row>
                <Row gutter={[4,8]}>
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
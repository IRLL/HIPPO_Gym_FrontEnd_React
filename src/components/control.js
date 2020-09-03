import React from 'react';
import 'antd/dist/antd.css';
import './control.css';
import { Button, Input, Tooltip, Row, Col } from 'antd';
import {icons} from '../utils/icons';
import capitalize from '../utils/capitalize';

class ControlPanel extends React.Component{

    render(){
        const {isStart,isEnd, frameRate, UIlist} = this.props;
        const directions = ['left','leftUp','up','rightUp','down','leftDown','rightDown','fire','right'];
        const commands = ['stop','reset','good','bad','trainOnline','trainOffline']

        const elements = {
            start : <Col>
                        {isStart ? <Button shape="round" type="danger" icon={icons['pause']} size='large' onClick={() => this.props.handleCommand("pause")}>Pause</Button> 
                            : <Button shape="round" type="primary"  icon={icons['start']} size='large' onClick={() => this.props.handleCommand("start")}>Start</Button>
                        }
                    </Col>,
            fpsSet : <Col><Input className="fpsInput" defaultValue={30} value={frameRate} suffix="FPS"/></Col>,
            fpsUp : <Col>
                        <Tooltip placement="bottom" title="Increase the FPS by 5" arrowPointAtCenter>
                            <Button shape="round" size="large" icon={icons['fpsUp']} onClick={() => this.props.handleFPS("faster")}/>
                        </Tooltip>
                    </Col>,
            fpsDown : <Col>
                        <Tooltip placement="bottom" title="Decrease the FPS by 5" arrowPointAtCenter>
                            <Button shape="round" size="large" icon={icons['fpsDown']} onClick={() => this.props.handleFPS("slower")}/>
                        </Tooltip>
                      </Col>
        }
        directions.forEach((dir) => {
            elements[dir] = 
                <Col span={2} >
                    {UIlist.includes(dir) ? <Button shape="round" size="large" icon={icons[dir]} onClick={() => this.props.sendMessage({actionType : "mousedown",action : dir})}/> : null}
                </Col>
        })
        commands.forEach((command) => {
            elements[command] =
                <Col>
                    <Button shape="round" type="primary" className={`${command}Button`}  icon={icons[command]} size='large' onClick={() => this.props.handleCommand(command)}>{capitalize(command)}</Button>
                </Col>
        })

        const firstRow = [elements['leftUp'],elements['up'],elements['rightUp'],<Col span={1} />];
        const secondRow = [elements['left'],elements['fire'],elements['right'],<Col span={1}/>];
        const thirdRow = [elements['leftDown'],elements['down'],elements['rightDown'],<Col span={1}/>];

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
                                <Button type="primary" shape="round" size="large" icon={icons['next']} onClick={this.props.handleOk}>Next</Button>
                            </Tooltip> : null}
                    </Col>
                </Row>
                </div>
            </div>
        )
    }

}

export default ControlPanel;
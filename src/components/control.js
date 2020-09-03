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
        const fps = ['fpsUp','fpsDown','fpsSet']
        const defaultButtons = [...directions,...fps];
        const UIFiltered = UIlist.filter(ele => !defaultButtons.includes(ele));

        const elements = {
            start : <Col>
                        {isStart ? <Button shape="round" type="danger" icon={icons['pause']} size='large' onClick={() => this.props.handleCommand("pause")}>Pause</Button> 
                            : <Button shape="round" type="primary"  icon={icons['start']} size='large' onClick={() => this.props.handleCommand("start")}>Start</Button>
                        }
                    </Col>,
            fpsSet : <Col span={4}>
                        {UIlist.includes('fpsSet') ? <Input className="fpsInput" defaultValue={30} value={frameRate} suffix="FPS"/> : null}
                    </Col>,
            fpsUp : <Col span={4}>{UIlist.includes('fpsUp') ?
                        <Tooltip placement="bottom" title="Increase the FPS by 5" arrowPointAtCenter>
                            <Button shape="round" className="fpsUpButton" size="large" icon={icons['fpsUp']} onClick={() => this.props.handleFPS("faster")}>Increase</Button>
                        </Tooltip> : null}
                    </Col>,
            fpsDown : <Col span={4}>{UIlist.includes('fpsDown') ? 
                        <Tooltip placement="bottom" title="Decrease the FPS by 5" arrowPointAtCenter>
                            <Button shape="round" className="fpsDownButton" size="large" icon={icons['fpsDown']} onClick={() => this.props.handleFPS("slower")}>Decrease</Button>
                        </Tooltip> : null}
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

        const firstRow = [elements['leftUp'],elements['up'],elements['rightUp'],elements['fpsUp']];
        const secondRow = [elements['left'],elements['fire'],elements['right'],elements['fpsSet']];
        const thirdRow = [elements['leftDown'],elements['down'],elements['rightDown'],elements['fpsDown']];

        UIFiltered.forEach((ele,idx) =>{
            if(idx % 3 === 0){
                firstRow.push(elements[ele])
            }else if(idx % 3 === 1){
                secondRow.push(elements[ele])
            }else if(idx % 3 === 2){
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
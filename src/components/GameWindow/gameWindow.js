import React from 'react';
import {Progress} from 'antd';
import './gameWindow.css';
import 'antd/dist/antd.css';


class GameWindow extends React.Component {

    render() {
        const {isLoading, frameSrc, progress} = this.props;

        return (
            <div className= "gameWindow" >
                {isLoading || !frameSrc ?
                    <div className="progressBar">
                        <Progress width={80} type="circle" percent={Math.round(progress)}/>
                        <p className="promptText">The robot is about to start the game, please wait ...</p> 
                    </div>
                    : <img className="gameContent" src={frameSrc} alt="frame" width="700px" height="600px" />
                }
            </div>
        )
    }
}

export default GameWindow;
import React from 'react';
import {Progress} from 'antd';
import './gameWindow.css';
import 'antd/dist/antd.css';


class GameWindow extends React.Component {

    render() {
        const {isLoading, frameSrc, progress, imageL, imageR} = this.props;

        return (
            <div className="container" >
                <div className="imageContainer" > 
                    {imageL ? <img src={imageL} className="imageComponent" alt="imageLeft" width="400px" height="400px" /> : null}
                </div>
                <div className= "gameWindow" >
                    {isLoading || !frameSrc ?
                        <div className="progressBar">
                            <Progress width={80} type="circle" percent={Math.round(progress)}/>
                            <p className="promptText">The robot is about to start the game, please wait ...</p> 
                        </div>
                        : <img className="gameContent" src={frameSrc} alt="frame" width="700px" height="600px" />
                    }
                </div>
                <div className="imageContainer" > 
                    {imageR ? <img src={imageR} className="imageComponent" alt="imageRight" width="400px" height="400px" /> : null}
                </div> 
            </div>
        )
    }
}

export default GameWindow;
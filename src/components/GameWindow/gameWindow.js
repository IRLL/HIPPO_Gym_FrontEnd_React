import React from 'react';
import {Progress} from 'antd';
import './gameWindow.css';
import 'antd/dist/antd.css';

import Webcam from "react-webcam";

class GameWindow extends React.Component {

    render() {
        const {isLoading, frameSrc, progress, imageL, imageR, webcamLeft, webcamRight,setRef} = this.props;

        return (
            <div className="container" >
              {webcamLeft || imageL ?
                <div className="imageContainer" >
                    { webcamLeft ?
                        <div className="webcam">
                            <Webcam
                                audio={false}
                                ref={setRef}
                                screenshotFormat="image/jpeg"
                                // videoConstraints={videoConstraints}
                            />
					              </div>
                    : null}
                    {imageL ? <img src={imageL} className="imageComponent" alt="imageLeft" width="400px" height="400px" /> : null}
                </div>
                :null}
                <div className="gameWindow" >
                    {isLoading || !frameSrc ?
                        <div className="progressBar">
                            <Progress width={80} type="circle" percent={Math.round(progress)}/>
                            <p className="promptText">The robot is about to start the game, please wait ...</p>
                        </div>
                        : <img className="gameContent" src={frameSrc} alt="frame" width="700px" height="600px" />
                    }
                </div>
                {webcamRight || imageR ?
                  <div className="imageContainer" >
                      { webcamRight ?
                          <div className="webcam">
                              <Webcam
                                  audio={false}
                                  ref={setRef}
                                  screenshotFormat="image/jpeg"
                                  // videoConstraints={videoConstraints}
                              />
                          </div>
                      : null}
                      {imageR ? <img src={imageR} className="imageComponent" alt="imageRight" width="400px" height="400px" /> : null}
                </div>
                : null}
            </div>
        )
    }
}

export default GameWindow;
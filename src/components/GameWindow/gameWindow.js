import React from 'react';
import {Progress} from 'antd';
import './gameWindow.css';
import 'antd/dist/antd.css';

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";

class GameWindow extends React.Component {

    render() {
        const {isLoading, frameSrc, progress, imageL, imageR, addMinutia, width, height} = this.props;

        return (
          <Zoom>
            {(zoom) => (
              <div className="container" >
                {imageL ?
                  <div className="imageContainer" >
                      {<img src={imageL} className="imageComponent" alt="imageLeft" width="400px" height="400px" />}
                  </div>
                  :null }
                  <div className="gameWindow"
                    onClick={(event) => {
                      const point = localPoint(event);
                      addMinutia(
                        point.x,
                        point.y - 0.65625,
                      )
                    }}
                  >
                      {isLoading || !frameSrc ?
                          <div className="progressBar">
                              <Progress width={80} type="circle" percent={Math.round(progress)}/>
                              <p className="promptText">The robot is about to start the game, please wait ...</p>
                          </div>
                          : <img className="gameContent" src={frameSrc} alt="frame" width={width} height={height} />
                      }
                  </div>
                  {imageR ?
                  <div className="imageContainer" >
                      {<img src={imageR} className="imageComponent" alt="imageRight" width="400px" height="400px" />}
                  </div>
                  : null}
              </div>
            )}
          </Zoom>
        )
    }
}

export default GameWindow;
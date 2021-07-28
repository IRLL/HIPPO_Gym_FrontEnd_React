import React from 'react';
import {Progress} from 'antd';
import './gameWindow.css';
import 'antd/dist/antd.css';

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";

class GameWindow extends React.Component {

  // Reference: https://dev.to/leonardoschmittk/how-to-make-a-mouse-ripple-click-effect-with-css-js-and-html-in-2-steps-2fcf
  applyCursorRippleEffect = (e) => {
    const ripple = document.createElement("div");

    ripple.className = "ripple";
    document.body.appendChild(ripple);

   ripple.style.left = `${e.clientX}px`;
   ripple.style.top = `${e.clientY}px`;

    ripple.style.animation = "ripple-effect .4s  linear";
    ripple.onanimationend = () => document.body.removeChild(ripple);
 }

  render() {
      const {isLoading, frameSrc, progress, imageL, imageR, addMinutia, width, height, sendMouseData} = this.props;
      return (
        <Zoom>
          {(zoom) => (
            // for ripple effect add an onclick function to the div and call applyCursorRippleEffect()
            <div className="container">
              {imageL ?
                <div className="imageContainer" >
                    {<img src={imageL} className="imageComponent" alt="imageLeft" width="400px" height="400px" />}
                </div>
                :null }
                <div className="gameWindow"
                  onMouseDown={(event) => {
                    event.preventDefault()
                    const point = localPoint(event);
                    sendMouseData(
                      "mouse down",
                      point.x,
                      point.y - 0.65625,
                      event.buttons,
                    )
                  }}
                  onMouseMove={(event) => {
                    event.preventDefault()
                    const point = localPoint(event);
                    sendMouseData(
                      "mouse move",
                      point.x,
                      point.y - 0.65625,
                      event.buttons,
                    )
                  }}
                  onMouseUp={(event) => {
                    event.preventDefault()
                    const point = localPoint(event);
                    sendMouseData(
                      "mouse up",
                      point.x,
                      point.y - 0.65625,
                      event.buttons,
                    )
                  }}
                  // prevent context menu from popping up when right mouse button is clicked in the gamewindow
                  onContextMenu={(event) => {
                    event.preventDefault();
                    return false;
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
import React from 'react';
import {Progress} from 'antd';
import './fingerprintWindow.css';

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";
import { RectClipPath } from "@vx/clip-path";

class FingerprintWindow extends React.Component {
    render() {
        const {frameSrc, isLoading, progress, width, height, brightness, contrast, saturation, hue} = this.props;

        const initialTransform = {
            scaleX: 1.27,
            scaleY: 1.27,
            translateX: -211.62,
            translateY: 162.59,
            skewX: 0,
            skewY: 0
        };

        return (
        <div className="gameWindow">
        {isLoading || !frameSrc ?
            <div className="progressBar">
                <Progress width={80} type="circle" percent={Math.round(progress)}/>
                <p className="promptText">The robot is about to start the game, please wait ...</p> 
            </div> :
            <Zoom
                width={width}
                height={height}
                scaleXMin={1 / 2}
                scaleXMax={4}
                scaleYMin={1 / 2}
                scaleYMax={4}
                transformMatrix={initialTransform}
            >
                {zoom => {
                    return (
                    <div className="fingerprintWindowContainer">
                        <svg
                            width={width}
                            height={height}
                            style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
                        >
                            <g transform={zoom.toString()}>
                                <image 
                                    alt="frame"
                                    href={frameSrc}
                                    width={width}
                                    height={height}
                                    style={{filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg)`}}
                                />
                            </g>
                            <rect
                                width={width}
                                height={height}
                                fill="transparent"
                                onTouchStart={zoom.dragStart}
                                onTouchMove={zoom.dragMove}
                                onTouchEnd={zoom.dragEnd}
                                onMouseDown={zoom.dragStart}
                                onMouseMove={zoom.dragMove}
                                onMouseUp={zoom.dragEnd}
                                onMouseLeave={() => {
                                    if (zoom.isDragging) zoom.dragEnd();
                                }}
                                onDoubleClick={(event) => {
                                    const point = localPoint(event) || { x: 0, y: 0 };
                                    zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
                                }}
                            />
                            
                            <RectClipPath id="zoom-clip" width={width} height={height} />
                            <g
                                clipPath="url(#zoom-clip)"
                                transform={`
                                    scale(0.25)
                                    translate(${width * 4 - width - 60} ${height * 4 - height - 60})`}
                                className="fingerprintMinimap"
                            >
                                <rect width={width} height={height} fill="#1a1a1a" />
                                <image alt="frame" href={frameSrc} width={width} height={height}/>
                                <rect
                                    width={width}
                                    height={height}
                                    fill="white"
                                    fillOpacity={0.2}
                                    stroke="white"
                                    strokeWidth={4}
                                    transform={zoom.toStringInvert()}
                                />
                            </g>
                        </svg>
                        <div className="fingerprintControls">
                            <button
                                className="fingerprintBtn"
                                onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                            >
                                +
                            </button>
                            <button
                                className="fingerprintBtn fingerprintBottomBtn"
                                onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                            >
                                -
                            </button>
                            <button className="fingerprintBtn fingerprintResizeBtn" onClick={zoom.center}>
                                Center
                            </button>
                            <button className="fingerprintBtn fingerprintResizeBtn" onClick={zoom.clear}>
                                Clear
                        </button>
                        </div>
                    </div>
                )}}
            </Zoom>
        }
        
        </div>)
    }
}


export default FingerprintWindow;
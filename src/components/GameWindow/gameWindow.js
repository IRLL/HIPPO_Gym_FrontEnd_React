import React, {useState} from 'react';
import {Progress} from 'antd';
import './gameWindow.css';
import 'antd/dist/antd.css';

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";
import { RectClipPath } from "@vx/clip-path";

class GameWindow extends React.Component {

    render() {
        const {isLoading, frameSrc, progress, imageL, imageR, fingerprint} = this.props;

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
                        : fingerprint ? <Fingerprint frameSrc={frameSrc} width={700} height={600}/>
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

class Fingerprint extends React.Component {
    render() {
        const {frameSrc, width, height} = this.props;

        const bg = "#0a0a0a";

        const initialTransform = {
            scaleX: 1.27,
            scaleY: 1.27,
            translateX: -211.62,
            translateY: 162.59,
            skewX: 0,
            skewY: 0
        };

        return (
            <>
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
                <div className="relative">
                    <svg
                        width={width}
                        height={height}
                        style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
                    >
                        <RectClipPath id="zoom-clip" width={width} height={height} />
                        <rect width={width} height={height} rx={14} fill={bg} />
                        <g transform={zoom.toString()}>
                            <image alt="frame" href={frameSrc} width={width} height={height} />
                        </g>
                        <rect
                            width={width}
                            height={height}
                            rx={14}
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
                        
                        <g
                            clipPath="url(#zoom-clip)"
                            transform={`
                                scale(0.25)
                                translate(${width * 4 - width - 60} ${height * 4 - height - 60})`}
                        >
                            <rect width={width} height={height} fill="#1a1a1a" />
                            <image alt="frame" href={frameSrc} />
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
                    <div className="controls">
                    <button
                        className="btn btn-zoom"
                        onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                    >
                        +
                    </button>
                    <button
                        className="btn btn-zoom btn-bottom"
                        onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                    >
                        -
                    </button>
                    <button className="btn btn-lg" onClick={zoom.center}>
                        Center
                    </button>
                    <button className="btn btn-lg" onClick={zoom.reset}>
                        Reset
                    </button>
                    <button className="btn btn-lg" onClick={zoom.clear}>
                        Clear
                    </button>
                    </div>
                </div>
            )}}
            </Zoom>
            <style jsx>{`
                
            `}</style>
            </>
        )
    }
}

export default GameWindow;
import React from "react";
import { Progress, Popover, Button, Slider, Tooltip, Radio } from "antd";
import { icons } from "../../utils/icons";
import "./fingerprintWindow.css";

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";
import { RectClipPath } from "@vx/clip-path";

// Reference: https://vx-demo.vercel.app/zoom-iu
class FingerprintWindow extends React.Component {
	state = {
		currMarker: null,
		move: false,
		moving: false,
		defaultColor: "blue",
		defaultSize: 50,
	};

	render() {
		const { currMarker } = this.state;

		const {
			frameSrc,
			isLoading,
			progress,
			width,
			height,
			brightness,
			contrast,
			saturation,
			hue,
			markers,
			addingMarkers,
			addMarker,
			handleMarker,
		} = this.props;

		// Slider when rotate is selected from popup menu
		const rotationSlider = (
			<Slider
				defaultValue={markers[currMarker] ? markers[currMarker].orientation : 0}
				min={0}
				max={359}
				onChange={(value) => handleMarker("rotate", currMarker, value)}
			/>
		);

		// Slider when resize is selected from popup menu
		const sizeSlider = (
			<Slider
				defaultValue={markers[currMarker] ? markers[currMarker].size : 50}
				min={0}
				max={100}
				onChange={(value) => {
					handleMarker("resize", currMarker, value);
					this.setState({ defaultSize: value });
				}}
			/>
		);

		// Menu when recolor is selected from popup menu
		const colorPicker = (
			<Radio.Group
				defaultValue="blue"
				onChange={(e) => {
					handleMarker("recolor", currMarker, e.target.value);
					this.setState({ defaultColor: e.target.value });
				}}
				className="colorPicker"
			>
				<Radio.Button value="blue" className="blueButton">
					Blue
				</Radio.Button>
				<Radio.Button value="green" className="greenButton">
					Green
				</Radio.Button>
				<Radio.Button value="yellow" className="yellowButton">
					Yellow
				</Radio.Button>
				<Radio.Button value="red" className="redButton">
					Red
				</Radio.Button>
				<Radio.Button value="orange" className="orangeButton">
					Orange
				</Radio.Button>
			</Radio.Group>
		);

		// Menu when marker type is selected from popup menu
		const markerType = (
			<Radio.Group
				defaultValue={markers[currMarker] ? markers[currMarker].type : "unknown"}
				onChange={(e) => {
					handleMarker("changeType", currMarker, e.target.value);
				}}
			>
				<Radio value="bifurcation">Bifurcation</Radio>
				<Radio value="ending">Ending</Radio>
				<Radio value="unknown">Unknown</Radio>
			</Radio.Group>
		);

		// Popup menu when a marker is clicked on
		const popupMenu = (
			<div className="popupMenu">
				<Tooltip placement="bottom" title="Rotate Marker">
					<Popover trigger="click" content={rotationSlider} title="Rotate Marker">
						<Button type="default" icon={icons["rotateImage"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Resize Marker">
					<Popover trigger="click" content={sizeSlider} title="Resize Marker">
						<Button type="default" icon={icons["resizeImage"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Move Marker">
					<Button
						type={this.state.move ? "primary" : "default"}
						icon={icons["moveMarker"]}
						onClick={() => this.setState((prevState) => ({ move: !prevState.move }))}
					/>
				</Tooltip>
				<Tooltip placement="bottom" title="Change Color">
					<Popover trigger="click" content={colorPicker} title="Change Color">
						<Button type="default" icon={icons["recolorMarker"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Categorize Marker">
					<Popover trigger="click" content={markerType} title="Categorize Marker">
						<Button type="default" icon={icons["markerType"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Delete Marker">
					<Button
						type="default"
						icon={icons["resetImage"]}
						style={{ color: "red" }}
						onClick={() => handleMarker("delete", currMarker, null)}
					/>
				</Tooltip>
			</div>
		);

		// If the frame has not loaded, show the loading screen
		if (isLoading || !frameSrc)
			return (
				<div className="progressBar">
					<Progress width={80} type="circle" percent={Math.round(progress)} />
					<p className="promptText">The robot is about to start the game, please wait ...</p>
				</div>
			);

		return (
			<Zoom
				width={width}
				height={height}
				scaleXMin={1 / 2}
				scaleXMax={10}
				scaleYMin={1 / 2}
				scaleYMax={10}
			>
				{(zoom) => (
					<div className="fingerprintWindowContainer">
						<svg
							width={width}
							height={height}
							style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
						>
							{/* Image with filters applied */}
							<g transform={zoom.toString()}>
								<image
									alt="frame"
									href={frameSrc}
									width={width}
									height={height}
									style={{
										filter: `brightness(${brightness}%) 
                                                contrast(${contrast}%)
                                                saturate(${saturation}%) 
                                                hue-rotate(${hue}deg)`,
									}}
								/>
							</g>

							{/* Overlay for sensing zoom controls */}
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
								onClick={(event) => {
									const point = localPoint(event);
									const transformedPt = zoom.applyInverseToPoint(point);
									if (addingMarkers) {
										addMarker(
											transformedPt.x,
											transformedPt.y,
											270,
											this.state.defaultSize,
											this.state.defaultColor,
											"unknown"
										);
									}
								}}
								onDoubleClick={(event) => {
									const point = localPoint(event) || { x: 0, y: 0 };
									zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
								}}
								className={addingMarkers ? "pointerCursor" : ""}
							/>

							{/* Markers overlay */}
							<g transform={zoom.toString()}>
								{markers.map((marker, i) => (
									<Popover trigger="click" content={popupMenu} key={`marker${i}`}>
										<image
											alt="marker"
											x={marker.x - Math.round(marker.size / 2)}
											y={marker.y - Math.round(marker.size / 2)}
											width={marker.size}
											className={this.state.moving ? "moveCursor" : ""}
											height={marker.size}
											href={process.env.PUBLIC_URL + `./fingerprint_marker_${marker.color}.svg`}
											onClick={() => this.setState({ currMarker: i })}
											style={{
												transform: `rotate(${marker.orientation}deg)`,
												transformOrigin: `${marker.x}px ${marker.y}px`,
											}}
											onMouseMove={(e) => {
												if (this.state.moving) {
													const point = zoom.applyInverseToPoint(localPoint(e));
													console.log(point);
													handleMarker("move", currMarker, point);
												}
											}}
											onTouchMove={(e) => {
												if (this.state.moving) {
													const point = zoom.applyInverseToPoint(localPoint(e));
													handleMarker("move", currMarker, point);
												}
											}}
											onMouseDown={() => this.state.move && this.setState({ moving: true })}
											onTouchStart={() => this.state.move && this.setState({ moving: true })}
											onMouseUp={() => this.state.move && this.setState({ moving: false })}
											onTouchEnd={() => this.state.move && this.setState({ moving: false })}
											onMouseLeave={() => this.setState({ moving: false })}
										/>
									</Popover>
								))}
							</g>

							{/* Minimap */}
							{/* Clip the minimap to be just the field of view */}
							<RectClipPath id="zoom-clip" width={width} height={height} />
							<g
								clipPath="url(#zoom-clip)"
								transform={`
									scale(0.25)
									translate(${width * 4 - width - 60} ${height * 4 - height - 60})`}
								className="fingerprintMinimap"
							>
								<rect width={width} height={height} fill="#1a1a1a" />
								<image
									alt="frame"
									href={frameSrc}
									width={width}
									height={height}
									// Apply filters to mini-map
									style={{
										filter: `brightness(${brightness}%) 
                                        	contrast(${contrast}%)
                                        	saturate(${saturation}%) 
                                        	hue-rotate(${hue}deg)`,
									}}
								/>
								{/* Add markers to minimap */}
								{markers.map((marker, i) => (
									<image
										alt="marker"
										x={marker.x - Math.round(marker.size / 2)}
										y={marker.y - Math.round(marker.size / 2)}
										width={marker.size}
										height={marker.size}
										href={process.env.PUBLIC_URL + `./fingerprint_marker_${marker.color}.svg`}
										style={{
											transform: `rotate(${marker.orientation}deg)`,
											transformOrigin: `${marker.x}px ${marker.y}px`,
										}}
									/>
								))}

								{/* Minimap field of view indication rectangle */}
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

						{/* Zoom Controls */}
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
							<button className="fingerprintBtn fingerprintResizeBtn" onClick={zoom.clear}>
								Center
							</button>
						</div>
					</div>
				)}
			</Zoom>
		);
	}
}

export default FingerprintWindow;

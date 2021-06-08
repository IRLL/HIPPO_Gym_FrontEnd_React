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
		currMinutia: null,
		move: false,
		moving: false,
		defaultColor: "blue",
		defaultSize: 50,
	};

	render() {
		const { currMinutia } = this.state;

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
			minutiae,
			addingMinutiae,
			addMinutia,
			handleMinutia,
		} = this.props;

		// Slider when rotate is selected from popup menu
		const rotationSlider = (
			<Slider
				defaultValue={minutiae[currMinutia] ? minutiae[currMinutia].orientation : 0}
				min={0}
				max={359}
				onChange={(value) => handleMinutia("rotate", currMinutia, value)}
			/>
		);

		// Slider when resize is selected from popup menu
		const sizeSlider = (
			<Slider
				defaultValue={minutiae[currMinutia] ? minutiae[currMinutia].size : 50}
				min={0}
				max={100}
				onChange={(value) => {
					handleMinutia("resize", currMinutia, value);
					this.setState({ defaultSize: value });
				}}
			/>
		);

		// Menu when recolor is selected from popup menu
		const colorPicker = (
			<Radio.Group
				defaultValue="blue"
				onChange={(e) => {
					handleMinutia("recolor", currMinutia, e.target.value);
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

		// Menu when minutia type is selected from popup menu
		const minutiaType = (
			<Radio.Group
				defaultValue={minutiae[currMinutia] ? minutiae[currMinutia].type : "unknown"}
				onChange={(e) => {
					handleMinutia("changeType", currMinutia, e.target.value);
				}}
			>
				<Radio value="bifurcation">Bifurcation</Radio>
				<Radio value="ending">Ending</Radio>
				<Radio value="unknown">Unknown</Radio>
			</Radio.Group>
		);

		// Popup menu when a minutia is clicked on
		const popupMenu = (
			<div className="popupMenu">
				<Tooltip placement="bottom" title="Rotate Minutia">
					<Popover trigger="click" content={rotationSlider} title="Rotate Minutia">
						<Button type="default" icon={icons["rotateImage"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Resize Minutia">
					<Popover trigger="click" content={sizeSlider} title="Resize Minutia">
						<Button type="default" icon={icons["resizeImage"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Move Minutia">
					<Button
						type={this.state.move ? "primary" : "default"}
						icon={icons["moveMinutia"]}
						onClick={() => this.setState((prevState) => ({ move: !prevState.move }))}
					/>
				</Tooltip>
				<Tooltip placement="bottom" title="Change Color">
					<Popover trigger="click" content={colorPicker} title="Change Color">
						<Button type="default" icon={icons["recolorMinutia"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Categorize Minutia">
					<Popover trigger="click" content={minutiaType} title="Categorize Minutia">
						<Button type="default" icon={icons["minutiaType"]} />
					</Popover>
				</Tooltip>
				<Tooltip placement="bottom" title="Delete Minutia">
					<Button
						type="default"
						icon={icons["resetImage"]}
						style={{ color: "red" }}
						onClick={() => handleMinutia("delete", currMinutia, null)}
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
									if (addingMinutiae) {
										addMinutia(
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
								className={addingMinutiae ? "pointerCursor" : ""}
							/>

							{/* Minutiae overlay */}
							<g transform={zoom.toString()}>
								{minutiae.map((minutia, i) => (
									<Popover trigger="click" content={popupMenu} key={`minutia${i}`}>
										<image
											alt="minutia"
											x={minutia.x - Math.round(minutia.size / 2)}
											y={minutia.y - Math.round(minutia.size / 2)}
											width={minutia.size}
											className={this.state.moving ? "moveCursor" : ""}
											height={minutia.size}
											href={process.env.PUBLIC_URL + `./fingerprint_minutia_${minutia.color}.svg`}
											onClick={() => this.setState({ currMinutia: i })}
											style={{
												transform: `rotate(${minutia.orientation}deg)`,
												transformOrigin: `${minutia.x}px ${minutia.y}px`,
											}}
											onMouseMove={(e) => {
												if (this.state.moving) {
													const point = zoom.applyInverseToPoint(localPoint(e));
													console.log(point);
													handleMinutia("move", currMinutia, point);
												}
											}}
											onTouchMove={(e) => {
												if (this.state.moving) {
													const point = zoom.applyInverseToPoint(localPoint(e));
													handleMinutia("move", currMinutia, point);
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
								{/* Add minutiae to minimap */}
								{minutiae.map((minutia, i) => (
									<image
										key={`minutia${i}`}
										alt="minutia"
										x={minutia.x - Math.round(minutia.size / 2)}
										y={minutia.y - Math.round(minutia.size / 2)}
										width={minutia.size}
										height={minutia.size}
										href={process.env.PUBLIC_URL + `./fingerprint_minutia_${minutia.color}.svg`}
										style={{
											transform: `rotate(${minutia.orientation}deg)`,
											transformOrigin: `${minutia.x}px ${minutia.y}px`,
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

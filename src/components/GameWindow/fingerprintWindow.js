import React from "react";
import { Progress, Popover, Button, Slider, Tooltip, Radio } from "antd";
import { icons } from "../../utils/icons";
import capitalize from "../../utils/capitalize";
import round from "../../utils/round";
import "./fingerprintWindow.css";

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";
import { RectClipPath } from "@vx/clip-path";
import { Text } from "@vx/text";

// Reference: https://vx-demo.vercel.app/zoom-iu
class FingerprintWindow extends React.Component {
	state = {
		currMinutia: null,
		moving: false,
		defaultColor: "blue",
		defaultSize: 30,
	};

	render() {
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
			handleChanging,
			minutiaeShown,
			feedbackShown,
		} = this.props;

		// If the frame has not loaded, show the loading screen
		if (isLoading || !frameSrc)
			return (
				<div className="gameWindow">
					<div className="progressBar">
						<Progress width={80} type="circle" percent={Math.round(progress)} />
						<p className="promptText">The robot is about to start the game, please wait ...</p>
					</div>
				</div>
			);

		const { currMinutia } = this.state;

		// Slider when rotate is selected from popup menu
		const rotationSlider = (
			<div
				onMouseDown={() => handleChanging(true)}
				onMouseUp={() => {
					handleChanging(false);
				}}
			>
				<Slider
					defaultValue={minutiae[currMinutia] ? minutiae[currMinutia].orientation : 270}
					min={0}
					max={359}
					step={1}
					onChange={(value) => handleMinutia("rotate", currMinutia, value)}
				/>
			</div>
		);

		// Slider when resize is selected from popup menu
		const sizeSlider = (
			<div
				onMouseDown={() => handleChanging(true)}
				onMouseUp={() => {
					handleChanging(false);
				}}
			>
				<Slider
					defaultValue={minutiae[currMinutia] ? minutiae[currMinutia].size : 50}
					min={0}
					max={100}
					onChange={(value) => {
						handleMinutia("resize", currMinutia, value);
						this.setState({ defaultSize: value });
					}}
				/>
			</div>
		);

		// Menu when recolor is selected from popup menu
		const colors = ["blue", "yellow", "orange"];
		const colorPicker = (
			<Radio.Group
				defaultValue="blue"
				onChange={(e) => {
					handleMinutia("recolor", currMinutia, e.target.value);
					this.setState({ defaultColor: e.target.value });
				}}
				className="colorPicker"
			>
				{colors.map((color, i) => (
					<Radio.Button value={color} key={`${color}Button`} className={`${color}Button`}>
						{capitalize(color)}
					</Radio.Button>
				))}
			</Radio.Group>
		);

		// Menu when minutia type is selected from popup menu
		const types = ["Bifurcation", "Ending", "Unknown"];
		const minutiaType = (
			<Radio.Group
				defaultValue={minutiae[currMinutia] ? minutiae[currMinutia].type : "Unknown"}
				onChange={(e) => {
					handleMinutia("changeType", currMinutia, e.target.value);
				}}
			>
				{types.map((type) => (
					<Radio key={type} value={type}>
						{type}
					</Radio>
				))}
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
				<Tooltip placement="bottom" title="Change Color">
					<Popover trigger="click" content={colorPicker} title="Change Color">
						<Button type="default" icon={icons["recolorMinutia"]} />
					</Popover>
				</Tooltip>
				{/* <Tooltip placement="bottom" title="Categorize Minutia">
					<Popover trigger="click" content={minutiaType} title="Categorize Minutia">
						<Button type="default" icon={icons["minutiaType"]} />
					</Popover>
				</Tooltip> */}
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

		return (
			<Zoom
				data-testid="fingerprint-window"
				width={width}
				height={height}
				scaleXMin={1 / 2}
				scaleXMax={10}
				scaleYMin={1 / 2}
				scaleYMax={10}
			>
				{(zoom) => (
					<div className="fingerprintWindowContainer" id="fingerprint-window">
						<svg
							width={width}
							height={height}
							style={{ cursor: zoom.isDragging ? "grabbing" : "grab" }}
						>
							{/* Image with filters applied */}
							<g transform={zoom.toString()}>
								<image
									id="image-overlay"
									alt="fingerprint image"
									href={frameSrc}
									width={width}
									height={height}
									filter={`brightness(${brightness}%)
                                        contrast(${contrast}%)
                                        saturate(${saturation}%)
                                        hue-rotate(${hue}deg)`}
									onLoad={zoom.clear} // recenter the image when a new one loads
								/>
							</g>

							{/* Overlay for sensing zoom controls */}
							<rect
								id="fingerprint-overlay"
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
											transformedPt.y - 0.65625, // add y-offset
											270,
											this.state.defaultSize,
											this.state.defaultColor,
											"Unknown"
										);
										this.setState({ currMinutia: minutiae.length });
									}
								}}
								onContextMenu={(event) => {
									event.preventDefault();
									const point = localPoint(event);
									const transformedPt = zoom.applyInverseToPoint(point);
									addMinutia(
										transformedPt.x,
										transformedPt.y - 0.65625, // add y-offset
										270,
										this.state.defaultSize,
										this.state.defaultColor,
										"Unknown"
									);
									this.setState({ currMinutia: minutiae.length });
								}}
								onDoubleClick={(event) => {
									const point = localPoint(event) || { x: 0, y: 0 };
									zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
								}}
								className={addingMinutiae ? "custom-cursor" : ""}
							/>

							{/* Minutiae overlay */}
							<g transform={zoom.toString()}>
								{minutiae.map((minutia, i) => (
									<Popover
										trigger="click"
										content={popupMenu}
										key={`minutia${i}`}
										defaultVisible={true}
									>
										{minutiaeShown && (
											<image
												alt="minutia"
												x={minutia.x - Math.round(minutia.size / 2)}
												y={minutia.y - Math.round(minutia.size / 2)}
												width={minutia.size}
												className={`feedback ${this.state.moving ? "moveCursor" : ""}`}
												feedback={minutia.scoreChange ? round(minutia.scoreChange, 2) : "N/A"}
												height={minutia.size}
												href={
													process.env.PUBLIC_URL +
													`./fingerprint_minutia_${
														feedbackShown && minutia.feedbackColor
															? minutia.feedbackColor
															: minutia.color
													}.svg`
												}
												onClick={() => this.setState({ currMinutia: i })}
												style={{
													transform: `rotate(${minutia.orientation}deg)`,
													transformOrigin: `${minutia.x}px ${minutia.y}px`,
												}}
												onMouseMove={(e) => {
													if (this.state.moving) {
														e.preventDefault();
														const point = zoom.applyInverseToPoint(localPoint(e));
														handleMinutia("move", i, point);
													}
												}}
												onTouchMove={(e) => {
													if (this.state.moving) {
														const point = zoom.applyInverseToPoint(localPoint(e));
														handleMinutia("move", i, point);
													}
												}}
												onDragStart={(e) => e.preventDefault()}
												onMouseDown={() => handleChanging(true) || this.setState({ moving: true })}
												onTouchStart={() => handleChanging(true) || this.setState({ moving: true })}
												onMouseUp={() => handleChanging(false) || this.setState({ moving: false })}
												onTouchEnd={() => handleChanging(false) || this.setState({ moving: false })}
												onMouseLeave={() =>
													handleChanging(false) || this.setState({ moving: false })
												}
											/>
										)}
									</Popover>
								))}
							</g>

							{/* Minutiae overlay */}
							{!!feedbackShown
								? minutiae.map((minutia, i) => (
										<g transform={zoom.toString()}>
											<svg
												width="62"
												height="25"
												x={minutia.x + Math.round(minutia.size / 2)}
												y={minutia.y - Math.round(minutia.size / 2)}
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M9.95198 4.64661C9.95198 2.43747 11.7428 0.646606 13.952 0.646606H57.6125C59.8217 0.646606 61.6125 2.43747 61.6125 4.64661V20C61.6125 22.2091 59.8217 24 57.6125 24H13.952C11.7428 24 9.95198 22.2091 9.95198 20V19.7366C9.95198 18.308 9.19 16.9878 7.95294 16.2731L0.852417 12.171L7.80344 8.54137C9.12403 7.85179 9.95198 6.48544 9.95198 4.99565V4.64661Z"
													fill="black"
													stroke="white"
													strokeOpacity="0.27"
													fill-opacity="0.27"
												/>
												<text className="svgText" x="22" y="17" fillOpacity="0.75">
													{minutia.scoreChange ? round(minutia.scoreChange, 2) : "N/A"}
												</text>
											</svg>
										</g>
								  ))
								: null}

							{/* Minimap */}
							{/* Clip the minimap to be just the field of view */}
							<RectClipPath id="zoom-clip" width={width} height={height} />
							<g
								clipPath="url(#zoom-clip)"
								transform={`
									scale(0.25)
									translate(${width * 4 - width - 60} ${height * 4 - height - 60})`}
								className="fingerprintMinimap notAllowedCursor"
							>
								<rect width={width} height={height} fill="#1a1a1a" className="notAllowedCursor" />
								<image
									alt="frame"
									href={frameSrc}
									width={width}
									height={height}
									// Apply filters to mini-map
									filter={`brightness(${brightness}%) 
                                        	contrast(${contrast}%)
                                        	saturate(${saturation}%) 
                                        	hue-rotate(${hue}deg)`}
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
									onMouseDown={(e) => {
										this.setState({ miniMapMoving: true, minimapStart: localPoint(e) });
									}}
									onMouseMove={(e) => {
										if (this.state.miniMapMoving) {
											const { minimapStart } = this.state;
											const point = localPoint(e);
											const transformedPt = {
												x: point.x - minimapStart.x,
												y: point.y - minimapStart.y,
											};

											zoom.translate({
												translateX: -4 * transformedPt.x,
												translateY: -4 * transformedPt.y,
											});

											this.setState({ minimapStart: point });
										}
									}}
									onMouseUp={() => {
										this.setState({ miniMapMoving: false });
									}}
									onMouseLeave={() => {
										if (this.state.miniMapMoving) this.setState({ miniMapMoving: false });
									}}
									className="grabCursor"
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

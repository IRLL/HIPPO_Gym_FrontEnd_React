import React from "react";
import "antd/dist/antd.css";

import { Zoom } from "@vx/zoom";
import { localPoint } from "@vx/event";

class LabelledImage extends React.Component {
	render() {
		const {
			frameSrc,
			markers,
			markersOther,
			minutiaeColor,
			minutiaeColorOther,
			minutiaSize,
			width,
			height,
			scale,
			filters,
		} = this.props;

		const { brightness, saturation, contrast, hue } = filters;

		const opacity = markersOther ? 0.9 : 1;

		const size = { width: scale * width, height: scale * height };

		const marker = (minutia, i, color) => (
			<image
				key={`minutia${i}`}
				alt="minutia"
				x={minutia.x - Math.round(minutiaSize / 2)}
				y={minutia.y - Math.round(minutiaSize / 2)}
				width={minutiaSize}
				height={minutiaSize}
				href={process.env.PUBLIC_URL + `./fingerprint_minutia_${color}.svg`}
				style={{
					transform: `rotate(${minutia.orientation}deg)`,
					transformOrigin: `${minutia.x}px ${minutia.y}px`,
					opacity: `${opacity}`,
				}}
			/>
		);

		return (
			<Zoom
				width={size.width}
				height={size.height}
				scaleXMin={1 / 2}
				scaleXMax={10}
				scaleYMin={1 / 2}
				scaleYMax={10}
			>
				{(zoom) => (
					<svg width={size.width} height={size.height} style={{ backgroundColor: "black" }}>
						<g style={{ transform: `scale(${scale}) ${zoom.toString()}` }}>
							<image
								alt="frame"
								href={frameSrc}
								filter={`brightness(${brightness}%) 
                    contrast(${contrast}%)
                    saturate(${saturation}%) 
                    hue-rotate(${hue}deg)`}
							/>
							{markers && markers.map((minutia, i) => marker(minutia, i, minutiaeColor))}
							{markersOther &&
								markersOther.map((minutia, i) => marker(minutia, i, minutiaeColorOther))}
							{/* Overlay for sensing zoom controls */}
						</g>
						<rect
							id="zoom-overlay"
							width={size.width}
							height={size.height}
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
					</svg>
				)}
			</Zoom>
		);
	}
}

export default LabelledImage;

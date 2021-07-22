import React from "react";
import "antd/dist/antd.css";

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
			<svg width={size.width} height={size.height}>
				<g style={{ transform: `scale(${scale})` }}>
					<image
						alt="frame"
						href={frameSrc}
						filter={`brightness(${brightness}%) 
                                contrast(${contrast}%)
                                saturate(${saturation}%) 
                            	hue-rotate(${hue}deg)`}
					/>
					{markers && markers.map((minutia, i) => marker(minutia, i, minutiaeColor))}
					{markersOther && markersOther.map((minutia, i) => marker(minutia, i, minutiaeColorOther))}
				</g>
			</svg>
		);
	}
}

export default LabelledImage;

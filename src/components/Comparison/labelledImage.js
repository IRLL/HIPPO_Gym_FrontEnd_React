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
		} = this.props;

		const opacity = markersOther ? 0.5 : 1;

		const size = { width: scale * width, height: scale * height };

		return (
			<svg width={size.width} height={size.height}>
				<g style={{ transform: `scale(${scale})` }}>
					<image alt="frame" href={frameSrc} />
					{markers &&
						markers.map((minutia, i) => (
							<image
								key={`minutia${i}`}
								alt="minutia"
								x={minutia.x - Math.round(minutiaSize / 2)}
								y={minutia.y - Math.round(minutiaSize / 2)}
								width={minutiaSize}
								height={minutiaSize}
								href={process.env.PUBLIC_URL + `./fingerprint_minutia_${minutiaeColor}.svg`}
								style={{
									transform: `rotate(${minutia.orientation}deg)`,
									transformOrigin: `${minutia.x}px ${minutia.y}px`,
									opacity: `${opacity}`,
								}}
							/>
						))}
					{markersOther &&
						markersOther.map((minutia, i) => (
							<image
								key={`minutia${i}`}
								alt="minutia"
								x={minutia.x - Math.round(minutiaSize / 2)}
								y={minutia.y - Math.round(minutiaSize / 2)}
								width={minutiaSize}
								height={minutiaSize}
								href={process.env.PUBLIC_URL + `./fingerprint_minutia_${minutiaeColorOther}.svg`}
								style={{
									transform: `rotate(${minutia.orientation}deg)`,
									transformOrigin: `${minutia.x}px ${minutia.y}px`,
									opacity: `${opacity}`,
								}}
							/>
						))}
				</g>
			</svg>
		);
	}
}

export default LabelledImage;

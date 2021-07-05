import React from "react";
import "antd/dist/antd.css";
import "./comparison.css";
import { Radio, Row, Col } from "antd";
import LabelledImage from "./labelledImage";

class Comparison extends React.Component {
	state = {
		sideBySide: true,
		idx: 0,
	};

	render() {
		const { frameSrc, expertMarkers, userMarkers } = this.props;
		const { idx, sideBySide } = this.state;
		const minutiaSize = 20;
		const width = 400,
			height = 400;

		const userColor = "blue";
		const expertColor = "red";

		return (
			<div className="comparisonContainer">
				{/* Controls */}
				<Row justify="space-between" gutter={[16, 8]}>
					{/* Display style */}
					<Col>
						<Radio.Group
							defaultValue={true}
							onChange={(e) => {
								this.setState({ sideBySide: e.target.value });
							}}
							buttonStyle="solid"
						>
							<Radio.Button value={true}>Side-by-Side Comparison</Radio.Button>
							<Radio.Button value={false}>Overlay Comparison</Radio.Button>
						</Radio.Group>
					</Col>

					{/* Expert markers */}
					<Col>
						<Radio.Group
							defaultValue={0}
							onChange={(e) => {
								this.setState({ idx: e.target.value });
							}}
						>
							<Radio.Button value={0}>Expert 1</Radio.Button>
							<Radio.Button value={1}>Expert 2</Radio.Button>
						</Radio.Group>
					</Col>
				</Row>

				{/* Legend */}
				<Row gutter={[16, 8]}>
					<Col>
						<img
							alt="minutia"
							src={process.env.PUBLIC_URL + `./fingerprint_minutia_${userColor}.svg`}
							style={{ transform: "rotate(270deg)" }}
						/>
						<span>Your minutiae</span>
					</Col>
					<Col>
						<img
							alt="minutia"
							src={process.env.PUBLIC_URL + `./fingerprint_minutia_${expertColor}.svg`}
							style={{ transform: "rotate(270deg)" }}
						/>
						<span>Expert minutiae</span>
					</Col>
				</Row>

				{/* Images */}
				{sideBySide ? (
					<Row justify="space-between" gutter={16}>
						{/* User markers */}
						<Col>
							<LabelledImage
								scale={0.75}
								frameSrc={frameSrc}
								markers={userMarkers}
								minutiaeColor={userColor}
								minutiaSize={minutiaSize}
								width={width}
								height={height}
							/>
						</Col>

						{/* Expert markers */}
						<Col>
							<LabelledImage
								scale={0.75}
								frameSrc={frameSrc}
								markers={expertMarkers[idx]}
								minutiaeColor={expertColor}
								minutiaSize={minutiaSize}
								width={width}
								height={height}
							/>
						</Col>
					</Row>
				) : (
					/* User markers */
					<Row justify="center">
						<LabelledImage
							scale={0.75}
							frameSrc={frameSrc}
							markers={userMarkers}
							markersOther={expertMarkers[idx]}
							minutiaeColor={userColor}
							minutiaeColorOther={expertColor}
							minutiaSize={minutiaSize}
							width={width}
							height={height}
						/>
					</Row>
				)}
			</div>
		);
	}
}

export default Comparison;

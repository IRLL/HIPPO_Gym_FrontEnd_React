import React from "react";
import "antd/dist/antd.css";
import "./comparison.css";
import { Radio, Row, Col, Button, Popover, Tooltip, Slider } from "antd";
// import { Radio, Row, Col, Button, Popover, Tooltip, Slider, Menu, Dropdown } from "antd";
import LabelledImage from "./labelledImage";
import { icons } from "../../utils/icons";
// import { DownOutlined } from "@ant-design/icons";

class Comparison extends React.Component {
	state = {
		sideBySide: true,
		idx: 0,
		brightness: 100,
		contrast: 100,
		saturation: 100,
		hue: 0,
	};

	handleFilters = (filter, value) => {
		switch (filter) {
			case "brightness":
				this.setState({ brightness: value });
				break;
			case "contrast":
				this.setState({ contrast: value });
				break;
			case "saturation":
				this.setState({ saturation: value });
				break;
			case "hue":
				this.setState({ hue: value });
				break;
			default:
				break;
		}
	};

	componentDidMount() {
		// const { userMarkers } = this.props;
		// this.setState({ userMarkers: userMarkers[userMarkers.length - 1] });
	}

	render() {
		const { frameSrc, expertMarkers, userMarkers } = this.props;
		// const { idx, sideBySide, brightness, contrast, saturation, hue, userMarkers } = this.state;
		const { idx, sideBySide, brightness, contrast, saturation, hue } = this.state;

		const minutiaSize = 20,
			scale = 0.85,
			width = 400,
			height = 400;

		const userColor = "blue",
			expertColor = "yellow";

		const filters = [
			{ name: "brightness", min: 0, max: 1000, default: brightness },
			{ name: "contrast", min: 0, max: 500, default: contrast },
			{ name: "saturation", min: 0, max: 100, default: saturation },
			{ name: "hue", min: 0, max: 360, default: hue },
		];

		const popupMenu = (
			<div className="popupMenu">
				{filters.map((filter) => (
					<Tooltip key={filter.name} placement="bottom" title={`Adjust ${filter.name}`}>
						<Popover
							trigger="click"
							content={
								<Slider
									defaultValue={filter.default}
									min={filter.min}
									max={filter.max}
									onChange={(value) => {
										this.handleFilters(filter.name, value);
									}}
								/>
							}
							title={`Adjust ${filter.name}`}
						>
							<Button type="default" icon={icons[filter.name]} />
						</Popover>
					</Tooltip>
				))}
			</div>
		);

		// const dropdownMenu = (
		// 	<Menu>
		// 		{this.props.userMarkers.map((marker, i) => (
		// 			<Menu.Item
		// 				key={i}
		// 				onClick={() => {
		// 					this.setState({ userMarkers: this.props.userMarkers[i] });
		// 				}}
		// 			>
		// 				Edition {i + 1}
		// 			</Menu.Item>
		// 		))}
		// 	</Menu>
		// );

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
							<Radio.Button value={true}>Side-by-Side</Radio.Button>
							<Radio.Button value={false}>Overlay</Radio.Button>
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

					{/* User Markers */}
					{/* <Col>
						<Dropdown overlay={dropdownMenu}>
							<Button>
								Your Markers <DownOutlined />
							</Button>
						</Dropdown>
					</Col> */}
				</Row>

				{/* Legend */}
				<Row gutter={[16, 8]} align="middle" justify="space-between">
					<Col>
						<img
							alt="minutia"
							src={process.env.PUBLIC_URL + `./fingerprint_minutia_${userColor}.svg`}
							style={{ transform: "rotate(270deg)" }}
						/>
						<span style={{ marginRight: 16 }}>Your minutiae</span>
						<img
							alt="minutia"
							src={process.env.PUBLIC_URL + `./fingerprint_minutia_${expertColor}.svg`}
							style={{ transform: "rotate(270deg)" }}
						/>
						<span>Expert minutiae</span>
					</Col>
					<Col>
						<Popover trigger="click" content={popupMenu}>
							<Button shape="circle" icon={icons["settings"]} type="primary" />
						</Popover>
					</Col>
				</Row>

				{/* Expert Score */}
				{/* <Row justify="end">
					<span className="blueFont">Expert Score: {expertMarkers[idx]["score"]}</span>
				</Row> */}

				{/* Images */}
				{sideBySide ? (
					<Row justify="space-between" gutter={16}>
						{/* User markers */}
						<Col>
							<LabelledImage
								scale={scale}
								frameSrc={frameSrc}
								markers={userMarkers}
								minutiaeColor={userColor}
								minutiaSize={minutiaSize}
								width={width}
								height={height}
								filters={{ brightness, contrast, saturation, hue }}
							/>
						</Col>

						{/* Expert markers */}
						<Col>
							<LabelledImage
								scale={scale}
								frameSrc={frameSrc}
								markers={expertMarkers[idx]["minutiae"]}
								minutiaeColor={expertColor}
								minutiaSize={minutiaSize}
								width={width}
								height={height}
								filters={{ brightness, contrast, saturation, hue }}
							/>
						</Col>
					</Row>
				) : (
					/* User markers */
					<Row justify="center">
						<LabelledImage
							scale={scale}
							frameSrc={frameSrc}
							markers={userMarkers}
							markersOther={expertMarkers[idx]["minutiae"]}
							minutiaeColor={userColor}
							minutiaeColorOther={expertColor}
							minutiaSize={minutiaSize}
							width={width}
							height={height}
							filters={{ brightness, contrast, saturation, hue }}
						/>
					</Row>
				)}
			</div>
		);
	}
}

export default Comparison;

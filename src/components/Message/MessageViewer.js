import React from "react";
import { Empty } from "antd";
import ReactJson from "react-json-view";
import "antd/dist/antd.css";
import "./message.css";

class MessageViewer extends React.Component {
	render() {
		const { title, visible, data } = this.props;

		const objectList = [];
		data.forEach((obj, index) => {
			objectList.push(
				<ReactJson
					collapsed
					iconStyle="triangle"
					src={obj}
					name={data.length - index}
					key={index}
				/>
			);
		});

		let messageWindow = (
			<div className="messageContainer">
				<p className="messageTitle">{title}</p>
				{objectList.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : objectList}
			</div>
		);

		return <div>{visible ? messageWindow : null}</div>;
	}
}

export default MessageViewer;

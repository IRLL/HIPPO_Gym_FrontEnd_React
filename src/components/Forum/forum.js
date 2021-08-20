import React from "react";
import { Button, Tooltip } from "antd";
import "antd/dist/antd.css";
import "./forum.css";
import ReactHtmlParser from "react-html-parser";

class Forum extends React.Component {
	state = {
		submittable: true,
	};

	componentDidMount() {
		if (this.props.content.includes("You may exit now")) {
			this.setState({ submittable: false });
		}

		// Add year-picker functionality
		const yearpicker = document.querySelector("#yearpicker");
		if (yearpicker) {
			const start = 1900;
			const end = new Date().getFullYear() - 16;
			for (let i = end; i > start; i--) {
				let year = document.createElement("option");
				year.innerText = i;
				year.setAttribute("value", i);
				yearpicker.appendChild(year);
			}
		}

		// // Make textareas updatable with react
		// const textareas = document.querySelectorAll("textarea");
		// if (textareas) {
		// 	const textArray = [];
		// 	for (let i = 0; i < textareas.length; i++) {
		// 		textArray.push("");
		// 	}
		// 	this.setState({ textareas: textArray });
		// 	textareas.forEach((textarea, i) => {
		// 		textarea.value = this.state.textareas[i];
		// 		textarea.addEventListener("change", (e) => {
		// 			const areas = [...this.state.textareas];
		// 			areas[i] = e.target.value;
		// 			this.setState({ textareas: areas });
		// 		});
		// 	});
		// }
	}

	render() {
		const { is400Error, content } = this.props;

		return (
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					this.props.action(e);
				}}
				className="formContainer"
			>
				<div>
					{ReactHtmlParser(content)}
					<br />
					{!is400Error && this.state.submittable ? (
						<Tooltip
							placement="top"
							title="Submit the form and navigate to next step"
							arrowPointAtCenter
						>
							<Button
								className="submitButton"
								shape="round"
								size="large"
								type="primary"
								htmlType="submit"
							>
								Submit
							</Button>
						</Tooltip>
					) : null}
				</div>
			</form>
		);
	}
}

export default Forum;

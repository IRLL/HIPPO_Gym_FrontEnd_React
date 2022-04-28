import React from "react";
import {Button, Tooltip} from "antd";
import "antd/dist/antd.css";
import "./forum.css";
import transform from "./transform"
import ReactHtmlParser from "react-html-parser";

class Forum extends React.Component {
	state = {
		submitable: true,
	};

	componentDidMount() {
		if (this.props.content.includes("You may exit now")) {
			this.setState({ submitable: false });
		}
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
					{ReactHtmlParser(content, new transform())}
        </div>
        {!is400Error && this.state.submitable ? (
          <div className="submitButtonContainer">
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
          </div>
        ) : null}
      </form>
    );
	}
}

export default Forum;

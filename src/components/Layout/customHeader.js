import React from "react";
import "antd/dist/antd.css";
import "./header.css";
import {Layout} from "antd";

const {Header} = Layout;

class CustomHeader extends React.PureComponent {
	render() {
		return (
			<Header className="header">
        <div className="logo">
          <a href="https://irll.ca/" target="_blank" rel="noopener noreferrer">
            <img src={process.env.PUBLIC_URL + "/irll-logo.png"} alt="IRLL Logo" />
          </a>
        </div>
			</Header>
		);
	}
}

export default CustomHeader;

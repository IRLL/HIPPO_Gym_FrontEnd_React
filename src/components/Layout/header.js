import React from "react";
import "antd/dist/antd.css";
import "./header.css";
import { Divider } from "antd";

class Header extends React.PureComponent {
	render() {
		return (
			<header className="header">
				<div className="header-images">
					<a className="irllLogo" href="https://irll.ca/" target="_blank" rel="noopener noreferrer">
						<img src={process.env.PUBLIC_URL + "/irll-logo.png"} alt="irll-logo" height="100" />
					</a>
					<a
						className="irllLogo"
						href="https://tec.mx/es"
						target="_blank"
						rel="noopener noreferrer"
					>
						<img
							src={process.env.PUBLIC_URL + "/nuevo-logo-tec-de-monterrey.jpg"}
							alt="itesm-logo"
							height="100"
						/>
					</a>
				</div>
				<Divider />
			</header>
		);
	}
}

export default Header;

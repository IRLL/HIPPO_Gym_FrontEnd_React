import React from "react";
import "antd/dist/antd.css";
import "./footer.css";
import {Row, Col} from "antd";
import {Layout} from "antd";

const {Footer} = Layout;

class CustomFooter extends React.PureComponent {
	render() {
		return (
			<Footer className="footer">
				<Row align="bottom">
					<Col flex={1}>
						<div className="footerContent">
							<div>
								© 2020 The Intelligent Robot Learning Lab.
								<br />
								We are proudly affiliated with the{" "}
								<a
									className="Link"
									href="https://ualberta.ca"
									target="_blank"
									rel="noopener noreferrer"
								>
									University of Alberta
								</a>
								,
								<a
									className="Link"
									href="http://rlai.ualberta.ca/"
									target="_blank"
									rel="noopener noreferrer"
								>
									{" "}
									RLAI
								</a>
								, and{" "}
								<a
									className="Link"
									href="https://amii.ca"
									target="_blank"
									rel="noopener noreferrer"
								>
									Amii
								</a>
								.
							</div>
						</div>
					</Col>
					<Col>
						<div className="footerImages">
							<a href="https://ualberta.ca" target="_blank" rel="noopener noreferrer">
								<img
									className="UAlogo"
									src={process.env.PUBLIC_URL + "/ualberta.png"}
									alt="ualberta-logo"
									height="40"
								/>
							</a>
							<a href="https://amii.ca" target="_blank" rel="noopener noreferrer">
								<img
									className="AmiiLogo"
									src={process.env.PUBLIC_URL + "/amii.png"}
									alt="amii-logo"
									height="60"
								/>
							</a>
						</div>
					</Col>
				</Row>
			</Footer>
		);
	}
}

export default CustomFooter;

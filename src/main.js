import React from "react";
import "antd/dist/antd.css";
import "./main.css";
import axios from "axios";
import { Spin, BackTop } from "antd";
import { Helmet } from "react-helmet";
import Header from "./components/Layout/header";
import Footer from "./components/Layout/footer";
import Forum from "./components/Forum/forum";
import Game from "./components/Game/game";
import Error400 from "./components/Error/error";
import { RLAPI, SERVER, PROJECT_ID, USER_ID, REDIRECT, CSS_PATH } from "./utils/constants";

class Main extends React.Component {
	state = {
		formContent: "", //html body content
		isLoading: SERVER ? false : true, //used to wait for http requests finished
		isGame: SERVER ? true : false, //if current page is the game page
		isWait: false, //if the websocket server has been resolved
		is400Error: false, //if there are any error occur
		ifRedirect: SERVER && REDIRECT ? true : false, //if redirect to another url after game ends
		loadingMessages: ["Waiting for the robot to wake up..."],
		loadingMessageIndex: 0,
	};

	loadingMessageInterval;
	iterations = 0;

	componentDidMount() {
		if (!SERVER) this.fetchFormData(); //if server is not specified, load the form data
		//if css file is specified, apply the css to the page

		this.loadingMessageInterval = setInterval(() => {
			const i = this.state.loadingMessageIndex;
			const length = this.state.loadingMessages.length;
			this.setState({
				loadingMessageIndex: (i + 1) % length,
			});
			this.iterations++;
		}, 5000);
	}

	componentDidUpdate(prevState) {
		//always scroll the page to the top when moving to next page
		if (prevState.formContent !== this.state.formContent && prevState.formContent) {
			window.scrollTo(0, 0);
		}

		if (this.iterations >= 10) {
			clearInterval(this.loadingMessageInterval);
		}
	}

	//send GET requests to api endpoint
	//fetch html content of each page
	fetchFormData = () => {
		axios
			.get(RLAPI, {
				params: {
					projectId: PROJECT_ID,
					userId: USER_ID,
				},
			})
			.then((res) => {
				//"show_game_page" means the next page will be the game page
				if (res.data.page === "show_game_page") {
					this.setState({
						isGame: true,
						isWait: false,
					});
					if (this.wait) clearInterval(this.wait);

					//"wait" means the websocket's ip address has not been resolved yet
				} else if (res.data.page !== "wait") {
					this.setState({
						formContent: res.data.page,
						isLoading: false,
					});
				}
			})
			.catch((error) => {
				//projectId does not exist error
				if (error.response) {
					if (error.response.status === 400) {
						this.setState({
							isLoading: false,
							is400Error: true,
						});
					}
				}
			});
	};

	gameEndHandler = () => {
		//fetch the content of next page if redirect url is not specified
		if (!this.state.ifRedirect) {
			//change the game status
			this.setState({
				isGame: false,
			});
			this.fetchFormData();
			//if redirect url is specified
		} else {
			window.open(REDIRECT, "_self"); //to open new page
		}
	};

	//submit the form content and fetch the next page
	handleSubmit = (event) => {
		this.setState({
			isLoading: true,
		});

		//collect the user's input from the form
		const form = event.target;
		const data = {};
		for (let element of form.elements) {
			if (element.tagName === "BUTTON") {
				continue;
			}
      if (element.type === "radio") {
        const radios = form.elements[element.name];
        data[element.name] = radios.value;
        continue;
      }
			data[element.name] = element.value;
		}
		//submit the user's input by sending the POST requests
		axios
			.post(RLAPI, data, {
				params: {
					projectId: PROJECT_ID,
					userId: USER_ID,
				},
			})
			.then((res) => {
				//"show_game_page" means the websocket's DNS has been resolved
				//ready to go to the game page
				if (res.data.page === "show_game_page") {
					this.setState({
						isGame: true,
					});
				} else if (res.data.page === "wait") {
					//we check if the websocket's DNS has been resolved periodically
					//for every 30 seconds
					this.wait = setInterval(() => {
						if (!this.state.isGame) this.fetchFormData();
					}, 30000);
					this.setState({
						isWait: true,
					});
				} else {
					this.setState({
						formContent: res.data.page,
						isLoading: false,
					});
				}
			})
			.catch((error) => {
				//projectId does not exist error
				if (error.response) {
					if (error.response.status === 400) {
						this.setState({
							isLoading: false,
							is400Error: true,
						});
					}
				}
			});
	};

	render() {
		const {
			isLoading,
			formContent,
			isGame,
			isWait,
			is400Error,
			loadingMessages,
			loadingMessageIndex: i,
		} = this.state;

		let preGame;
		if (is400Error) {
			preGame = (
				<div className="errorPage">
					<Error400 />
				</div>
			);
		} else {
			preGame = (
				<div className="forumContainer">
					{isLoading ? (
						<Spin
							className="Loader"
							size="large"
							tip={isWait ? loadingMessages[i] : "Loading next step, please wait ..."}
						/>
					) : (
						<Forum content={formContent} action={this.handleSubmit} is400Error={is400Error} />
					)}
				</div>
			);
		}

		return (
			<div>
				<BackTop />
				{CSS_PATH ? (
					<Helmet>
						<link rel="stylesheet" href={CSS_PATH} />
					</Helmet>
				) : null}
				<div className="main">
					<Header />
					{!isGame ? preGame : <Game action={this.gameEndHandler} />}
					<Footer />
				</div>
			</div>
		);
	}
}

export default Main;

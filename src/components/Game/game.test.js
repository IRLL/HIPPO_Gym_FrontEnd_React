import React from "react";
import ReactDOM from "react-dom";
import Game from "./game";
import { createBrowserHistory } from "history";
import { Router } from "react-router";
import { render, screen, waitForElement, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Main from "../../main";

afterEach(cleanup);

it("renders without crashing", async () => {
	const div = document.createElement("div");
	ReactDOM.render(<Game></Game>, div);
});

it("logs the test location", async () => {
	// Server is assumed to be running on localhost:5000
	// change SERVER_PATH constant if that is not the case
	const SERVER_PATH = "ws://localhost:5000";

	// Create test environment by pushing the server path
	// into the pathname
	const history = createBrowserHistory();
	history.push(`/?server=${SERVER_PATH}`);

	render(
		<Router history={history}>
			<Main></Main>
		</Router>
	);
	// screen.debug();
	await waitForElement(() => expect(screen.getByTestId("control-panel")));

	// waitForElement(() => expect(screen.getByTestId("fingerprint-window")));

	// setTimeout(() => waitForElement(() => expect(screen.getByTestId("fingerprint-window"))), 1);

	// const fingerprintWindow = await screen.getByTestId("fingerprint-window");

	// await waitForElement(() => expect(fingerprintWindow));
	// const brightness = await screen.getByText("Brightness");
	// await waitForElement(() => expect(brightness));

	console.log(window.location.href);
});

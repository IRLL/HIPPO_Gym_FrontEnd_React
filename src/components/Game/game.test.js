import React from "react";
import ReactDOM from "react-dom";
import { render, screen, waitForElement, cleanup, unmount } from "@testing-library/react";

beforeEach(() => {
	// Server is assumed to be running on localhost:5000
	// change SERVER_PATH constant if that is not the case
	const SERVER_PATH = "ws://localhost:5000";
	const url = `http://localhost:5001/?projectId=video&server=${SERVER_PATH}`;

	delete window.location;
	window.location = new URL(url);
});

afterEach(cleanup);

it("renders without crashing", async () => {
	const Game = require("./game").default;

	const div = document.createElement("div");
	ReactDOM.render(<Game></Game>, div);
});

// it("logs the test location", async () => {
// 	// A require is used here instead of import to allow
// 	// window locatioin to be set before importing
// 	// const Main = require("../../main").default;
// 	jest.useFakeTimers();
// 	const Game = require("./game").default;

// 	// Render the main component
// 	render(<Game></Game>);

// 	// // Wait for the game component to mount
// 	// const game = screen.getByTestId("game");
// 	// await waitForElement(() => expect(game));

// 	// // Wait for the control panel to mount
// 	// const controlPanel = screen.getByTestId("control-panel");
// 	// await waitForElement(() => expect(controlPanel));

// 	// // Wait for the fingerprint window to mount
// 	const fingerprintWindow = await screen.getByTestId("fingerprint-window");
// 	// setTimeout(() => waitForElement(screen.getByTestId("fingerprint-window")), 30000);

// 	await waitForElement(() => expect(fingerprintWindow));

// 	unmount();

// 	// // Test if the UI buttons are being mounted
// 	// const brightness = await screen.getByText("Brightness");
// 	// await waitForElement(() => expect(brightness));
// });

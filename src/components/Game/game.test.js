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

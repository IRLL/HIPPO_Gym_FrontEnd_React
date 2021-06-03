import React from "react";
import ReactDOM from "react-dom";
import FingerprintWindow from "./fingerprintWindow";
import { render, screen, waitForElement, cleanup, unmount } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import frameSrc from "./test_image.jpg";

let minutiae = [];

const addMinutia = (x, y, orientation, size, color, type) => {
	minutiae.push({ x, y, orientation, size, color, type });
};

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<FingerprintWindow minutiae={[]} />, div);
});

beforeEach(() => {
	minutiae = [];
});

it("adds a minutia when addMinutia is true", () => {
	render(
		<FingerprintWindow
			minutiae={minutiae}
			addingMinutiae={true}
			isLoading={false}
			frameSrc={frameSrc}
			width={700}
			height={600}
			addMinutia={addMinutia}
		/>
	);

	const mainWindow = screen.getByTestId("fingerprint-overlay");

	const priorLength = minutiae.length;

	// when you click on the screen, minutiae gets an additional minutia
	userEvent.click(mainWindow);

	// length of minutiae increases by 1
	expect(minutiae.length == priorLength + 1);
});

it("doesnt add a minutia when addMinutia is false", () => {
	render(
		<FingerprintWindow
			minutiae={minutiae}
			addingMinutiae={false}
			isLoading={false}
			frameSrc={frameSrc}
			width={700}
			height={600}
			addMinutia={addMinutia}
		/>
	);

	const mainWindow = screen.getByTestId("fingerprint-overlay");

	const priorLength = minutiae.length;

	// when you click on the screen, minutiae gets an additional minutia
	userEvent.click(mainWindow);

	// length of minutiae doesn't change
	expect(minutiae.length == priorLength);
});

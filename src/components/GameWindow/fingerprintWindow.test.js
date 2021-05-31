import React from "react";
import ReactDOM from "react-dom";
import FingerprintWindow from "./fingerprintWindow";

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(<FingerprintWindow minutiae={[]}></FingerprintWindow>, div);
});

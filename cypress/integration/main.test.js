describe("Connection with websocket is good", () => {
	it("Connects with the websocket", () => {
		cy.visit("/?server=ws://localhost:5000&debug=true");

		cy.intercept("GET", "http://localhost:5001/**");

		cy.get("#addMinutia").click();

		// let windowWidth, windowHeight, imageWidth, imageHeight;

		// cy.get('[id="image-overlay"]').then((el) => {
		// 	const windowRect = el[0].getBoundingClientRect();
		// 	windowWidth = windowRect.width;
		// 	windowHeight = windowRect.height;

		// 	const imageString = el[0].href.baseVal;
		// 	const img = new Image();
		// 	img.src = imageString;
		// 	img.onload = () => {
		// 		imageWidth = img.width;
		// 		imageHeight = img.height;
		// 		console.log("image wxh", imageWidth, imageHeight, "window wxh", windowWidth, windowHeight);

		// 		const minutia = denormalize(
		// 			{ x: 10, y: 10 },
		// 			windowWidth,
		// 			windowHeight,
		// 			imageWidth,
		// 			imageHeight
		// 		);

		// 	};
		// });

		// TODO: remove hardcoded values and resolve async issue above to get realtime values
		const window = { width: 700, height: 600 };
		const image = { width: 400, height: 400 };

		const minutia = denormalize(
			{ x: 30, y: 30 },
			window.width,
			window.height,
			image.width,
			image.height
		);

		cy.get("#fingerprint-overlay").click(minutia.x, minutia.y);
		cy.get("#submitImage").click();
	});
});

// Given a marker in the correct position
// Returns one scaled and offset relative to the canvas
const denormalize = (minutia, windowWidth, windowHeight, imageWidth, imageHeight) => {
	const defaultAspect = windowWidth / windowHeight;
	const imageAspect = imageWidth / imageHeight;

	if (imageAspect > defaultAspect) {
		// the width = window width and the height is scaled to that
		const scale = imageWidth / windowWidth;
		const scaledHeight = imageHeight / scale;
		const offset = (windowHeight - scaledHeight) / 2; // the y-offset from the window border
		const newMinutia = {
			x: minutia.x / scale,
			y: minutia.y / scale + offset,
		};

		return newMinutia;
	} else {
		// the height = window height and the width is scaled to that
		const scale = imageHeight / windowHeight;
		const scaledWidth = imageWidth / scale;
		const offset = (windowWidth - scaledWidth) / 2; // the x-offset from the window border

		console.log("offset = ", offset);
		console.log("scale = ", scale);

		const newMinutia = {
			x: minutia.x / scale + offset,
			y: minutia.y / scale,
		};

		return newMinutia;
	}
};

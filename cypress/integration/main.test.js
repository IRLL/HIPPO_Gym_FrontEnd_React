describe("Fingerprint window functions correctly", () => {
	const websocket_string = "ws://localhost:5000";

	it("Connects successfully with the websocket", () => {
		// Visit the specified server
		cy.visit(`/?server=${websocket_string}`);

		// Make sure that the fingerprint window container is correctly mounted
		// instead of loading message
		cy.get("#fingerprint-window");
	});

	it("Adds minutia to the correct place", () => {
		// Visit debug to view messages
		cy.visit(`/?server=${websocket_string}&debug=true`);

		cy.waitForReact();

		// click on add minutia
		cy.get("#addMinutia").click();

		// coordinates of the pixel we would like to click on
		const position = { x: 10, y: 10 };

		// default widths and heights (incase fetching variables fails)
		let window = { width: 700, height: 600 };
		let image = { width: 400, height: 400 };

		cy.get("#image-overlay")
			.then(async (el) => {
				const windowRect = el[0].getBoundingClientRect();
				window = { width: windowRect.width, height: windowRect.height };

				const imageString = el[0].href.baseVal;
				const img = new Image();
				img.src = imageString;
				img.onload = () => {
					image = { width: img.width, height: img.width };
				};
			})
			.then(() => {
				cy.wait(500).then(() => {
					const minutia = denormalize(
						position,
						window.width,
						window.height,
						image.width,
						image.height
					);

					cy.get("#fingerprint-overlay").click(minutia.x, minutia.y);
					cy.get("#submitImage").click();
				});
			});

		cy.getReact("Game")
			.getCurrentState()
			.then((state) => {
				for (const message in state.outMessage) {
					if (message.command === "submitImage") {
						// expect that the submitted image has the same posiitons that we clicked
						expect(message.minutiaList[0]).to.equal(position);
					}
				}
			});
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

		const newMinutia = {
			x: minutia.x / scale + offset,
			y: minutia.y / scale,
		};

		return newMinutia;
	}
};

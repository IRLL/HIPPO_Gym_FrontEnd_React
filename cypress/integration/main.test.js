describe("Connection with websocket is good", () => {
	it("Connects with the websocket", () => {
		cy.visit("/?server=ws://localhost:5000&debug=true");
		cy.get("#addMinutia").click();

		cy.get('[id="fingerprint-overlay"]').then((el) => {
			console.log("window coordinates", el[0].getBoundingClientRect());
		});

		cy.get('[id="image-overlay"]').then((el) => {
			console.log("inner image coordinates", el[0].getBoundingClientRect());
		});
	});
});

import React from 'react';
import ReactDOM from 'react-dom';
import DisplayBar from './displayBar';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<DisplayBar ></DisplayBar>, div);
})
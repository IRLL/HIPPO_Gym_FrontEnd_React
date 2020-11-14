import React from 'react';
import ReactDOM from 'react-dom';
import Error400 from './error';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<Error400 ></Error400>, div);
})
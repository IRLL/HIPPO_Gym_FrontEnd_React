import React from 'react';
import ReactDOM from 'react-dom';
import CustomHeader from './customHeader';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<CustomHeader ></CustomHeader>, div);
})

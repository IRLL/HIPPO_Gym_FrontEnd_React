import React from 'react';
import ReactDOM from 'react-dom';
import CustomFooter from './customFooter';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<CustomFooter ></CustomFooter>, div);
})

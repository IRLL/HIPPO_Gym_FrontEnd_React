import React from 'react';
import ReactDOM from 'react-dom';
import Forum from './forum';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<Forum ></Forum>, div);
})
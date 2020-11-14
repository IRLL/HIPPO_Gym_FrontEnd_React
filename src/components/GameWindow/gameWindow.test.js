import React from 'react';
import ReactDOM from 'react-dom';
import GameWindow from './gameWindow';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<GameWindow ></GameWindow>, div);
})
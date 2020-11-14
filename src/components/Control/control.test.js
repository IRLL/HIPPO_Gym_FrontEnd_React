import React from 'react';
import ReactDOM from 'react-dom';
import ControlPanel from './control';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<ControlPanel UIlist={[]}></ControlPanel>, div);
})
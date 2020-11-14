import React from 'react';
import ReactDOM from 'react-dom';
import MessageViewer from './messageViewer';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<MessageViewer data={[]} title="Message"></MessageViewer>, div);
})
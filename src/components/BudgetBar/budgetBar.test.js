import React from 'react';
import ReactDOM from 'react-dom';
import BudgetBar from './budgetBar';

it("renders without crashing", () => {
    const div = document.createElement('div');
    ReactDOM.render(<BudgetBar usedInputBudget={0} inputBudget={20}></BudgetBar>, div);
})
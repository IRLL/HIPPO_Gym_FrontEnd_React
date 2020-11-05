import React from 'react';
import 'antd/dist/antd.css';
import './budgetBar.css';
import {Progress } from 'antd';

class BudgetBar extends React.Component{

    render(){
        const {visible, isLoading, consumedbudget, totalBudget} = this.props;

        return (
            <div>
                 {visible && !isLoading ?
                    <div className="budgetBar" >
                        <Progress 
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }} percent={Math.round(consumedbudget/totalBudget)} 
                        showInfo={false}
                        /> 
                        <p className="budgetCount">{`${consumedbudget}/${totalBudget}`}</p>
                    </div> : null
                }
            </div>
        )
    }
}

export default BudgetBar;
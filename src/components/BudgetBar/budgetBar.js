import React from 'react';
import 'antd/dist/antd.css';
import './budgetBar.css';
import {Progress } from 'antd';

class BudgetBar extends React.PureComponent{

    render(){
        const {visible, isLoading, usedInputBudget, inputBudget} = this.props;

        return (
            <div>
                 {visible && !isLoading ?
                    <div className="budgetBar" >
                        <strong>Reward Budget</strong>
                        <Progress 
                            strokeColor={{'0%': '#108ee9','100%': '#87d068',}} 
                            percent={(usedInputBudget/inputBudget)*100} 
                            showInfo={false}
                        /> 
                        <p className="budgetCount">{`${usedInputBudget}/${inputBudget}`}</p>
                    </div> : null
                }
            </div>
        )
    }
}

export default BudgetBar;
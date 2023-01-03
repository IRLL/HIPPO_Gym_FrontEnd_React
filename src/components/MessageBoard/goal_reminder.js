import React, { useState } from 'react';
const GoalReminder = ({goal_reminder, setCTDisplay}) => {
    const [selected, setSelected] = useState(false);
    const [selVal, setSelVal] = useState(null);
    const [timeSel, setTimeSel] = useState(null);
    const handleSubmit = event => {
        event.preventDefault();
        if(selected){
            var t = new Date().toLocaleTimeString();
           setCTDisplay(true, selVal, timeSel, t); 

           setSelected(false);
           setSelVal(null);
           setTimeSel(null);
        }else{
            setCTDisplay(false, selVal, timeSel, null); 
        }
    }

    const handleSelected = event => {
        setSelVal(event.currentTarget.id);
        var t = new Date().toLocaleTimeString();
        setTimeSel(t);
        setSelected(true);
    }
    var headerMessage;
    if(goal_reminder){
        headerMessage = <h3>As a reminder, the objective of this study is to learn how to make decisions that are aligned with the best long-term reward. Instead of making long-term decisions based solely on immediate pleasure. </h3>;

    }else if(goal_reminder){
        headerMessage = <h3>As a reminder, the objective of this study is to learn how to make decisions that are aligned with the best long-term reward. Instead of making long-term decisions based solely on immediate pleasure. </h3>;

    }
    if(goal_reminder||goal_reminder){
       return(
        <div id="confidenceTest">
            {headerMessage}
            <form onSubmit={handleSubmit}>
                <div id="cLabels">
                </div>
                <div id='content'>
                    <div>
                        <input name='opt' type="radio" id="0" onChange={handleSelected}></input>
                        <label htmlFor="0"></label>
                    </div>
                </div>

                <button id="goal_submit" type='submit'>done</button>
            </form>
        </div>
        ) 
    }else{
        return <div></div>
    }
}

export default GoalReminder;

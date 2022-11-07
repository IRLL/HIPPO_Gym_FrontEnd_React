import React, { useState } from 'react';
const ConfidenceTest = ({ctest, ctest2, setCTDisplay}) => {
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
    if(ctest){
        headerMessage = <h3>How confident are you in this decision?</h3>;
    }else if(ctest2){
        headerMessage = <h3>How confident are you about your performance this round?</h3>;
    }
    if(ctest||ctest2){
       return(
        <div id="confidenceTest">
            {headerMessage}
            <form onSubmit={handleSubmit}>
                <div id="cLabels">
                    <h4>least confident</h4>
                    <h4>most confident</h4>  
                </div>
                <div id='content'>
                    <div>
                        <input name='opt' type="radio" id="0" onChange={handleSelected}></input>
                        <label htmlFor="0">0</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="1" onChange={handleSelected}></input>
                        <label htmlFor="1">1</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="2" onChange={handleSelected}></input>
                        <label htmlFor="2">2</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="3" onChange={handleSelected}></input>
                        <label htmlFor="3">3</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="4" onChange={handleSelected}></input>
                        <label htmlFor="4">4</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="5" onChange={handleSelected}></input>
                        <label htmlFor="5">5</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="6" onChange={handleSelected}></input>
                        <label htmlFor="6">6</label>
                    </div>
                    <div>   
                        <input name='opt' type="radio" id="7" onChange={handleSelected}></input>
                        <label htmlFor="7">7</label>
                    </div>
                </div>

                <button id="confidence_submit" type='submit'>done</button>
            </form>
        </div>
        ) 
    }else{
        return <div></div>
    }
}

export default ConfidenceTest;

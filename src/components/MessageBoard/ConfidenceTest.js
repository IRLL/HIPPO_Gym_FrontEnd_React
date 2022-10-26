import React, { useState } from 'react';
const ConfidenceTest = ({ctest, setCTDisplay}) => {
    // const [submitted, setSubmit] = useState(false);
    const handleSubmit = event => {
        event.preventDefault();
        // setSubmit(true);
        setCTDisplay();
    }

    if(ctest == true){
       return(
        <div id="confidenceTest">
            <h3>How confident are you with your decisions this round?</h3>
            <form onSubmit={handleSubmit}>
                <div id="cLabels">
                    <h4>least confident</h4>
                    <h4>most confident</h4>  
                </div>
                <div id='content'>
                    <div>
                        <input name='opt' type="radio" id="0"></input>
                        <label htmlFor="0">0</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="1"></input>
                        <label htmlFor="1">1</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="2"></input>
                        <label htmlFor="2">2</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="3"></input>
                        <label htmlFor="3">3</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="4"></input>
                        <label htmlFor="4">4</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="5"></input>
                        <label htmlFor="5">5</label>
                    </div>
                    <div>
                        <input name='opt' type="radio" id="6"></input>
                        <label htmlFor="6">6</label>
                    </div>
                    <div>   
                        <input name='opt' type="radio" id="7"></input>
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

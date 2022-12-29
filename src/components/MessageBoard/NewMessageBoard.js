import React, { useState } from 'react';
import cross from '../images/cross.png';
import q from '../images/q.png';
import q_hover from '../images/q_hover.png'
const MessageBoard = ({message, longMessage, setBoardDisplayed, currStatus}) => {
    const [displayBoard, setDisplayBoard] = useState(false);
    const handleMoreInfoClick = () => {
        setBoardDisplayed();
        setDisplayBoard(true);
    }
    const handleQHover = () => {
        document.getElementById("q_image").src = q_hover;
    }
    const handleQunhover = () => {
        document.getElementById("q_image").src = q;
    }
    const handleCrossOffBoard = () => {
        setBoardDisplayed();
        setDisplayBoard(false);
    }
    if(message == "INSTRUCTIONS"){
        if(!displayBoard){
            if(currStatus){
                return(
                    <div id="messageBoard">
                        <div id="message">
                            <h4>{longMessage}</h4>
                        </div>
                    </div>
                )
            }else{
                return <div></div>
            }
        }
    }else{
        if(!displayBoard){
            if(message != "" && longMessage != ""){
              return(
                <div id="shortMessageGroup">
                    <h1 id="short_message">{message}</h1>
                    <img id="q_image" src={q} onClick = {handleMoreInfoClick} onMouseOver = {handleQHover} onMouseOut = {handleQunhover}/>
                </div>
                )  
            }else if(message != ""){
                return(
                    <div id="shortMessageGroup">
                        <h1 id="short_message">{message}</h1>
                    </div>
                )  
            }else{
                return <div></div>
            }
        }else{
            return(
                <div id="messageBoard">
                    <img src={cross} onClick = {handleCrossOffBoard}/>
                    <div id="message">
                        <h4>{longMessage}</h4>
                    </div>
                </div>
            )
        }
    }
}

export default MessageBoard;

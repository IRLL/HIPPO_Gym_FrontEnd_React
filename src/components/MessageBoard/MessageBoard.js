import React, { useState } from 'react';
const MessageBoard = ({message, setBoardDisplayed}) => {
    const [displayBoard, setDisplayBoard] = useState(false);

    if(!displayBoard){
        return(
            <div id="shortMessageGroup">
                <h1 id="short_message">{message}</h1>
            </div>
        )
    }
}

export default MessageBoard;

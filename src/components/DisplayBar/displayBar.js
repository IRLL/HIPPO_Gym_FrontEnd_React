import React from 'react';
import 'antd/dist/antd.css';
import './displayBar.css';
import capitalize from '../../utils/capitalize';

class DisplayBar extends React.PureComponent{

    render(){
        const {visible, isLoading, display} = this.props;

        let messageList = [];
        for(let key in display){
            messageList.push(
                <div key={key} className="displayMessage" ><strong>{capitalize(key)}</strong> : {display[key]}</div>
            )
        }

        return (
            <div className="displayContainer">
                {visible && !isLoading ?
                <div className="messageList" >
                    {messageList}
                </div> : null}
            </div>
        )
    }
}

export default DisplayBar;
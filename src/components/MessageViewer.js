import React from 'react';
import 'antd/dist/antd.css';
import ReactJson from 'react-json-view'
import './message.css';
import {Empty} from 'antd';

class MessageViewer extends React.Component{
    
    render() {

        const {title, visible, data} = this.props;

        const objectList = [];
        data.forEach((obj,index) => {
            objectList.push(
                <ReactJson collapsed iconStyle="triangle" src={obj} name={data.length-index} />
            )
        })

        let messageWindow = 
            <div className="messageContainer">
                <p className="messageTitle">{title}</p>
                {objectList.length === 0 ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : objectList}
            </div> 

        return (
            <div >
                {visible ? messageWindow : null}
            </div>
        )
    }
}

export default MessageViewer;
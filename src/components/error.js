import React from 'react';
import "antd/dist/antd.css";
import './error.css';
import {Result} from 'antd';

class Error400 extends React.Component {

    render(){
        return (
            <div>
                <Result
                    className="errorResponse"
                    status="404"
                    title="The projectId is not valid or does not exist, please try again!"
                />
            </div>
        )
    }
}

export default Error400;
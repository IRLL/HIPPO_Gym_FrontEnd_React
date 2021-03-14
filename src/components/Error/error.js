import React from 'react';
import "antd/dist/antd.css";
import './error.css';
import {Result, Input, Button} from 'antd';
import { ProjectOutlined, SendOutlined } from '@ant-design/icons';

class Error400 extends React.Component {

    state = {
        projectId : null,
        redirect : false
    }

    handleChange = (e) => {
        this.setState(({
            projectId : e.target.value
        }))
    }

    navigate = () => {
        let host = window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port: '');
        if(this.state.projectId){
            window.location.replace(`${host}/?projectId=${this.state.projectId}`);
        }
    }

    render(){
        return (
            <div className="container" >
                <Result
                    className="errorResponse"
                    status="404"
                    title="The projectId is not valid or does not exist, please input the correct one!"
                />
                <div>
                    <strong>ProjectId : </strong>
                    <Input 
                        prefix={<ProjectOutlined />}
                        className="projectIdInput"
                        onChange={this.handleChange} 
                        placeholder="Enter the valid projectId"
                    />
                    <Button 
                        className="goButton" 
                        onClick={this.navigate}
                        size="large" 
                        type="primary" 
                        shape="round"
                        icon={<SendOutlined />}
                    >Go
                    </Button>
                </div>
            </div>
        )
    }
}

export default Error400;
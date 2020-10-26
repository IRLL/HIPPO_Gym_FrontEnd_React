import React from 'react';
import 'antd/dist/antd.css';
import './header.css';
import {Divider, Steps, Row, Col} from 'antd';

const { Step } = Steps;

class Header extends React.Component{

    state = {
        steps : ["Consent Form","Qualification Test","SHiB onlien tutorial survey", "Pac-Man Game", "Ending"]
    }

    render(){
        let allSteps = [];
        this.state.steps.forEach((step) => {
            allSteps.push(<Step key={step} title={step} />)
        })
        return (
            <header className="header">
                <Row>
                    <Col flex={1}>
                    <a className="irllLogo" href="https://irll.ca/" target="_blank" rel="noopener noreferrer">
                        <img src={process.env.PUBLIC_URL + '/irll-logo.png'}  alt="irll-logo" width="276" height="150"/>
                    </a>
                    </Col>
                    <Col flex={4}>
                    <Steps className="stepBar" current={this.props.step} >
                        {allSteps}
                    </Steps>
                    </Col>
                </Row>
                <Divider />
            </header>
        )
    }
}

export default Header;

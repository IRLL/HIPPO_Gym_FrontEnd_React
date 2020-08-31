import React from 'react';
import 'antd/dist/antd.css';
import './footer.css';
import {Divider, Row, Col} from 'antd';

class Footer extends React.Component{

    render() {
        return (
            <footer>
                <Divider />
                <Row>
                    <Col flex={3}>
                        <p className="footerContent">
                        © 2020 The Intelligent Robot Learning Lab.<br />
                        We are proudly affiliated with the <a className="Link" href="https://ualberta.ca" target="_blank" rel="noopener noreferrer">University of Alberta</a>,
                        <a className="Link" href="http://rlai.ualberta.ca/" target="_blank" rel="noopener noreferrer"> RLAI</a>, and <a className="Link" href="https://amii.ca" target="_blank" rel="noopener noreferrer">Amii</a>.
                        </p>
                    </Col>
                    <Col flex={2}>
                        <img className="UAlogo" src={process.env.PUBLIC_URL + '/ualberta.png'} alt="ualberta-logo" width="213" height="50"/>
                        <img className="AmiiLogo" src={process.env.PUBLIC_URL + '/amii.png'} alt="amii-logo" width="97" height="75"/>
                    </Col>
                </Row>
            </footer>
        )
    }
}

export default Footer;
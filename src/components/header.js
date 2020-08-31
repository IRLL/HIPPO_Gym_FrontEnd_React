import React from 'react';
import 'antd/dist/antd.css';
import './header.css';
import {Divider} from 'antd';

class Header extends React.Component{

    render(){
        return (
            <header>
                <a className="irllLogo" href="https://irll.ca/" target="_blank" rel="noopener noreferrer">
                    <img src={process.env.PUBLIC_URL + '/irll-logo.png'}  alt="irll-logo" width="276" height="150"/>
                </a>
                <Divider />
            </header>
        )
    }
}

export default Header;
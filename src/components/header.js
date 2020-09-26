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
                <ul className="menu">
                    <li><a href="https://irll.ca/" target="_blank" rel="noopener noreferrer">Home</a></li>
                    <li><a href="https://irll.ca/projects/" target="_blank" rel="noopener noreferrer">Research</a></li>
                    <li><a href="https://irll.ca/publications/" target="_blank" rel="noopener noreferrer">Publication</a></li>
                    <li><a href="https://irll.ca/team/" target="_blank" rel="noopener noreferrer">Team</a></li>
                    <li><a href="https://irll.ca/vacancies/" target="_blank" rel="noopener noreferrer">Vacancies</a></li>
                    <li><a href="https://irll.ca/sponsers/" target="_blank" rel="noopener noreferrer">Sponsers</a></li>
                    <li><a href="https://irll.ca/news/" target="_blank" rel="noopener noreferrer">News</a></li>
                </ul> 
                <Divider />
            </header>
        )
    }
}

export default Header;
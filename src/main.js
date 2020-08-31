import React from 'react';
import "antd/dist/antd.css";
import './main.css';
import axios from 'axios';
import {Spin, message} from 'antd';
import Header from './components/header';
import Footer from './components/footer';
import Forum from './components/forum';
import Game from './components/game';
import {RLAPI, PROJECT_ID, USER_ID} from './utils/constants';

class Main extends React.Component{

    state = {
        formContent : "",        //html content
        userId : USER_ID,
        projectId : PROJECT_ID,
        isLoading : true,        //used to wait for http requests finished
        isGame : false,          //if current page is the game page
        isWait : false,          //if the websocket server has been resolved
        isEnd : false,           //if the game is ended,
        ifError : false,
    }

    componentDidMount(){
        this.fetchFormData();
    }

    //send GET requests to api endpoint
    //fetch html content of each page
    fetchFormData = () => {
        axios.get(RLAPI,{
            params : {
                projectId : this.state.projectId,
                userId : this.state.userId
            }
        }).then(res => {
            //"show_game_page" means the next page will be the game page
            if(res.data === "show_game_page"){
                this.setState(({
                    isGame : true,
                    isWait : false
                }))
            //"wait" means the websocket's DNS has not been resolved yet
            }else if(res.data !== "wait"){
                this.setState(({
                    formContent : res.data,
                    isLoading : false
                }))
            }
        }).catch((error) => {
            this.setState(({
                isLoading : false,
                isError : true
            }));
            if(error.response){
                if (error.response.status === 400){
                    message.error(`The projectId is not valid or does not exist, please try again!`,5)
                }
            }
        })
    }

    gameEndHandler = () =>{
        //change the game status
        this.setState(({
            isGame : false,
            isEnd : true
        }))
        //fetch the content of next page
        this.fetchFormData();
    }

    handleSubmit = (event) => {
        this.setState(({
            isLoading : true
        }))

        //collect the user's input from the forum
        const form = event.target;
        const data = {}
        for (let element of form.elements) {
          if (element.tagName === 'BUTTON') { continue; }
          data[element.name] = element.value;
        }

        //submit the user's input by sending the POST requests
        axios.post(RLAPI,data,{
            params : {
                projectId : this.state.projectId,
                userId : this.state.userId
            }
        }).then(res => {
            //"show_game_page" means the websocket's DNS has been resolved
            //ready to go to the game page
            if(res.data === "show_game_page"){
                this.setState(({
                    isGame : true,
                }))
            }else if(res.data === "wait"){
                //we check if the websocket's DNS has been resolved periodically
                //for every 30 seconds 
                this.wait = setInterval(() => {
                    if(!this.state.isGame){
                        this.fetchFormData();
                    }
                },30000)
                this.setState(({
                    isWait : true
                }))
            }else{
                this.setState(({
                    formContent : res.data,
                    isLoading : false
                }))
            }
        }).catch((error) => {
            if(error.response){
                if (error.response.status === 400){
                    message.error(`The projectId is not valid or does not exist, please try again!`,5)
                }
            }
        });
    }

    componentWillUnmount(){
        clearTimeout(this.wait);
    }

    render(){
        const {isLoading,formContent,isGame,isWait, isEnd, isError} = this.state;

        const preGame = <div className="forumContainer">
                            {isLoading && !isError ? 
                            <Spin className="Loader" size = "large" tip={isWait ?  
                                "Waitting for the robot to wake up, please wait ..." :
                                "Loading next step, please wait ..."} 
                            /> :
                            <Forum content={formContent} action={this.handleSubmit} isEnd={isEnd} isError={isError}/> 
                            }
                        </div>
                            
        return (
            <div className="mainContainer">
                <Header />
                {!isGame ? preGame : <Game action={this.gameEndHandler} />}
                <Footer />
            </div>   
        )
    }
}

export default Main;
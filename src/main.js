import React from 'react';
import "antd/dist/antd.css";
import './main.css';
import axios from 'axios';
import {Spin, Result} from 'antd';
import Header from './components/header';
import Footer from './components/footer';
import Forum from './components/forum';
import Game from './components/game';
import {RLAPI, SERVER, PROJECT_ID, USER_ID, REDIRECT, CSS_PATH} from './utils/constants';

class Main extends React.Component{

    state = {
        formContent : "",                                 //html body content
        userId : USER_ID,
        projectId : PROJECT_ID,
        isLoading : SERVER ? false : true,                //used to wait for http requests finished
        isGame : SERVER ? true : false,                   //if current page is the game page
        isWait : false,                                   //if the websocket server has been resolved
        isEnd : false,                                    //if the game is ended,
        ifError : false,                                  //if there are any error occur
        ifRedirect : SERVER && REDIRECT ? true : false,   //if redirect to another url after game ends,
        step : 0
    }

    componentDidMount(){
        if(!SERVER) this.fetchFormData();
        if(CSS_PATH) this.setCSS();
    }

    componentDidUpdate(prevState){
        //always scroll the page to the top when moving to next page
        if(prevState.formContent !== this.state.formContent){
            window.scrollTo(0, 0);
        }
    }

    //apply the external css file to the page
    setCSS = () => {
        let head  = document.getElementsByTagName('head')[0];
        let link  = document.createElement('link');
        link.rel  = 'stylesheet';
        link.type = 'text/css';
        link.href = CSS_PATH;
        link.media = 'all';
        head.appendChild(link);
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
            if(res.data.page === "show_game_page"){
                this.setState(({
                    isGame : true,
                    isWait : false
                }))
                if(this.wait) clearInterval(this.wait);
                
            //"wait" means the websocket's ip address has not been resolved yet
            }else if(res.data.page !== "wait"){
                this.setState(({
                    formContent : res.data.page,
                    isLoading : false
                }))
            }
        }).catch((error) => {
            //handle projectId does not exist error
            if(error.response){
                if (error.response.status === 400){
                    this.setState(({
                        isLoading : false,
                        isError : true
                    }));
                }
            }
        })
    }

    gameEndHandler = () =>{
        //fetch the content of next page
        if(!this.state.ifRedirect){
             //change the game status
            this.setState(({
                isGame : false,
                isEnd : true
            }))
            this.setState(prevState => ({
                step : prevState.step+1
            }));
             this.fetchFormData();
        }else {
            window.open(REDIRECT, "_self") //to open new page
        }
    }

    //submit the form content and fetch the next page
    handleSubmit = (event) => {
        this.setState(({
            isLoading : true
        }))
        this.setState(prevState => ({
            step : prevState.step+1
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
            if(res.data.page === "show_game_page"){
                this.setState(({
                    isGame : true,
                }))
            }else if(res.data.page === "wait"){
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
                    formContent : res.data.page,
                    isLoading : false
                }))
            }
        }).catch((error) => {
            //handle projectId does not exist error
            if(error.response){
                if (error.response.status === 400){
                    this.setState(({
                        isLoading : false,
                        isError : true
                    }))
                }
            }
        });
    }

    render(){
        const {isLoading,formContent,isGame,isWait, isEnd, isError, step} = this.state;
        let preGame;
        if(isError){
            preGame = 
            <Result
                className="errorResponse"
                status="404"
                title="The projectId is not valid or does not exist, please try again!"
            />
        }else{
            preGame = 
                <div className="forumContainer">
                    {isLoading ? 
                    <Spin className="Loader" size = "large" tip={isWait ?  
                        "Waitting for the robot to wake up, please wait ..." :
                        "Loading next step, please wait ..."} 
                    /> :
                    <Forum content={formContent} action={this.handleSubmit} isEnd={isEnd} isError={isError}/> 
                    }
                </div>
        }
             
        return (
            <div className="mainContainer">
                <Header step={step} />
                {!isGame ? preGame : <Game action={this.gameEndHandler} />}
                <Footer />
            </div>   
        )
    }
}

export default Main;

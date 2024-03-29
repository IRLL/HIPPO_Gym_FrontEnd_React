# HIPPO Gym 
##### Human Input Parsing Platform for Openai Gym
[hippogym.irll.net](https://hippogym.irll.net)

Written by [Nick Nissen](https://nicknissen.com), Payas Singh, Nadeen Mohammed, and Yuan Wang
Supervised by [Matt Taylor](https://drmatttaylor.net) and Neda Navi
For the Intelligent Robot Learning Laboratory [(IRLL)](https://irll.ca) at the University of Alberta [(UofA)](https://ualberta.ca)
Supported by the Alberta Machine Intelligence Institute [(AMII)](https://amii.ca)

For questions or support contact us at [hippogym.irll@gmail.com](mailto:hippogym.irll@gmail.com)

The HIPPO Gym Project contains 4 repositories:

1. The main framework: [HIPPO_Gym](https://github.com/IRLL/HIPPO_Gym)

2. The AWS code and instructions: [HIPPO_Gym_AWS](https://github.com/IRLL/HIPPO_Gym_AWS)

3. The React Front End: [HIPPO_Gym_React_FrontEnd](https://github.com/IRLL/HIPPO_Gym_FrontEnd_React)

4. The SSL Certificate Getter: [HIPPO_Gym_SSL](https://github.com/IRLL/HIPPO_Gym_SSL)

For members of the IRLL or anyone whose organization has already setup the AWS infrastructure, the only repo required is #1.

Anyone is welcome to use the front-end deployed to [irll.net](https://irll.net)


# Real time and Muti-modal Software Framework for Reinforcement Learning

What behind our framework
===============
This project is related to the researh where a human can help teach a software agent to learn faster.For example, you have someone play a game of Mario, and use this demonstration to help the agent to learn. Or, you have someone watch an agent playing Mario and interrupt to say "you should have jumped here". Or, you have someone watch an agent playing Mario and interrupt to say "you just messed up here." In the past, we've focused on doing things locally - building an interface for these kind of interactions isn't so bad when you just have someone sit down in front of a laptop. But, ideally, we'd be able to run these kinds of experiments over the web.

What our framework can do
===============
* Interact with Turkers recruited via Amazon’s Mechanical Turk, as well as human subjects recruited from other venues
* Support multiple forms of human guidance, including explicit reward, action advice, demonstrations, and shaping reward function construction.
* Handle bi-directional requests, where guidance can be initiated by either the human teacher or the student agent. 
* Allow for real-time interaction with a live agent, as well as pre-recorded agent behaviors.
* Allow a person to go forward and backward in time to provide human guidance at different points in previous trajectories
* Be compatible with at least 3 tasks implemented in OpenAI gym.

How it works
===============

## Demo Video
[HIPPO Gym Demo Video](https://youtu.be/KeMzhGU9LWE) (Updated on 2021-04-28)

In this demo video, we provided no other parameters in the original query. There are two pages before the game page and two pages after. The first page is a consent form that requires the user to agree the agreement before they move to the next step. In the second step, there is a qualification test to see if the user meet all the requirements for this project. The next page is the game page which is also the main page that used to play the game and train the agent. After the game ends, there is a survey page ask about the whole experience of this framework. The last page is a "thank you" page to thank the research participants.

## API
### 1.Get the first pre-game page through ``https://api.irll.net/next/`` GET
```
params : {
    #Id assigned to different projects
    "projectId" : ,
    #Generated by uuidv4
    "userId" : 
}
```
Response status code and body format:

**200 OK**
```
{   
    # html content body
    "page" : ,
    # css content to apply on the page
    "css" :  ,
}
```
**400 Bad Request**
```
{
    "Project ID Not Found"
}
```
### 2.Submit a form and get the next pre-game page through ``https://api.irll.net/next`` POST
Request format
```
params : {
        #Id assigned to different projects
        "projectId" : ,
        #Generated by uuidv4
        "userId" : 
    }
form content example
{
    "race" : "Asian",
    "country" : "Canada",
    "language" : "English"
}
```
#### Response status code and body format:
**200 OK**
```
{
    # html content body
    "page" : ,
    # available css styles that applies on the page 
    "css" :  ,
}
```

## URL Query parameters
* projectId(**required**) : projectId is assigned by each researcher, and it is uniquely identifiers a project
* css(**optional**) : An url that points to a public css file on the internet. This field is used if you want to apply your own styles to this framework.
* server(**optional**) : An url that points to a back end server. This field is used if you don't want to use the default back end server.
* debug(**optional**) : This mode is used to display the incoming and outgoing messages on the page, it is not enabled by default. In most of the time, the researchers will not need to use this mode. 
* redirect(**optional**) : This field is used to set the redirect link after the game ends.
* userId(**optional**) : Unique uuid used to uniquely identifiers an user.

Getting started
===============

The following instructions will get you a copy of this project and you can run the project on your local machine.

### Prerequisites

You need to install the following software:

* Node

* npm

### Clone

* Clone this repo to your local machine
*  `git clone https://github.com/IRLL/HIPPO_Gym_FrontEnd_React.git`


### Structure
    
[main.js](./src/main.js)
```javascript
fetchFormData()
```
Function used to send **GET** requests to our api endpoint and receive the html contents of pre-game and post-game pages.
```javascript
gameEndHandler()
```
Function used to set the game state to be end and request the content of next page.
```javascript
handleSubmit(event)
```
Function used to handle the form data after the user click the "Submit" button. This function will send POST requests to the back end and set the response as the content of the next page.

[Routes.js](./src/Routes.js)
A router used to manage all the routes of our framework. Currently, we only have one route which is the root one("/"). In the future, we may introduce more routes to our framework.

[forum.js](./src/components/Forum/forum.js)
Forum component, used to render the html contents that fetched from the back end and includes a "Submit" button to submit the form's data.

[game.js](./src/components/Game/game.js)
Game componet that include all the elements that needed to play the game on the web. In this component, we are using websocket to communicate with our back end server, which makes our framework real time. There are two main parts in this component, the first is the game window. We render every game frames that received from the web socket in this window. The second part is the game control panel, we have 4 directions button and buttons to start, stop and stop the game, etc.
```javascript
handleOk()
handleCancel()
```
Functions used to handle the visibility of the confirmation model.By default, the model does not appear, it is visible to the user when the game ends.
```javascript
sendMessage(data)
```
Function used to send data to the websocket server in JSON format.
```javascript
handleCommand(status)
```
Function used to send essential game control commands to the websocket server. The commands we have are : start,pause,stop and reset, etc.
```javascript
handleFPS(speed)
```
Function used to control the FPS(frame per second) of the game. The default value is 30 and the increment or the decrement when each time the user press the button is 5. The allowed range of the FPS is between 5 - 90 for now.

[gameWindow.js](./src/components/GameWindow/gameWindow.js)
Game window component, a component used to render every frames from the server. Before the game starts, there is a loading component inside the window. After the game is ready to start, the first frame of the game will be rendered.

[control.js](./src/components/Control/control.js)
ControlPanel component includes all the elements that neeeded to control the game. For example, we have direction control buttons and "start", "stop","reset", etc.
We have introduced the selective UI to our ControlPanel to meet different requirements for each project. Researcher can select the control buttons they want for their project.

**Control components we have right now:**
- Game control
    - Left
    - LeftUp
    - LeftDown
    - Right
    - RightUp
    - RightDown
    - Up
    - Down
    - Fire
- Train Control
    - Start
    - Pause
    - Stop
    - Reset
    - Train Online
    - Train Offline
    - Good
    - Bad
    - Fps Up
    - Fps Down
    - Fps Set
    
[budgetBar.js](./src/components/BudgetBar/budgetBar.js)
Budget Bar component, used to render the usedInputBudget and inputBudget. This component is visible if there are limits on the number of times that the user can give the feedback by clicking the "good" and "bad" buttons.

[displayBar.js](./src/components/DisplayBar/displayBar.js)
Display Bar component, used to render extra inforamtion that the researcher want to display on the game page. For example, the researcher can choose to display the score of the last game, the number of total episodes and the remaining episodes.

[error.js](./src/components/Error/error.js)
Error component, this component is only visible to the user if there are errors in the query parameters.

[MessageViewer.js](./src/components/Message/MessageViewer.js)
Message viewer is used when debug mode is set to true in the query parameters. By enabling the debug mode, all incoming and outgoing messages will be showed on the page.
 
[header.js](./src/components/Layout/header.js)
Header component that will be rendered on every pages of our framework. We only have a irll logo and a step bar to indicate the current step for now.

[footer.js](./src/components/Layout/footer.js)
Footer component that will be rendered on every pages of our framework. We have logos for ualberta and amii.

#### Setup

> Install the packages required for frontend 

```shell
$ npm install 
```

### Run

> Run frontend in the browser

```shell
$ npm start
```

### Build

> Build the code for production
```
$ npm run build
```

### Dependencies

* [react](https://www.npmjs.com/package/react) 
> The main Javascript library we are using for building user interfaces.
* [react-icons](https://www.npmjs.com/package/react-icons)
> npm package that allows us to include only the popular icons that our project is using.
* [react-device-detect](https://www.npmjs.com/package/react-device-detect)
> npm package that used to detect the type of device of user for better user experience
* [react-html-parser](https://www.npmjs.com/package/react-html-parser)
> npm package that used to convert HTML strings into React components. Avoids the use of dangerouslySetInnerHTML and converts standard HTML elements, attributes and inline styles into their React equivalents.
* [react-router](https://www.npmjs.com/package/react-router)
> npm package that used to provide routing in React.
* [antd](https://www.npmjs.com/package/antd)
> Ant-design is an enterprise-class UI design language and React UI library.Most of our framework's UI design based on this library.
* [websocket](https://www.npmjs.com/package/websocket)
> npm package that used to build web-socket connection with our backend server. We are relying on web-socket to receive the game frames and communicating between the front end and the back end.
* [axios](https://www.npmjs.com/package/axios)
> npm package that used to send GET and POST request to our api endpoints
* [uuid](https://www.npmjs.com/package/uuid)
> npm package used to generate uuid(universally unique identifier). We use uuidv4 in our project as the userId to identify each user uniquelly.
* [react-helmet](https://www.npmjs.com/package/react-helmet)
> npm package  that is a reusable React component will manage all of your changes to the document head.

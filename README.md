# HIPPO Gym 
##### Human Input Parsing Platform for Openai Gym

Written by [Nick Nissen](https://nicknissen.com) and Yuan Wang
Supervised by [Matt Taylor](https://drmatttaylor.net) and Neda Navi
For the Intelligent Robot Learning Laboratory [(IRLL)](https://irll.ca) at the University of Alberta [(UofA)](https://ualberta.ca)
Supported by the Alberta Machine Intelligence Institure [(AMII)](https://amii.ca)

For questions or support contact us at [hippogym.irll@gmail.com](mailto:hippogym.irll@gmail.com)

The HIPPO Gym Project contains 3 repositories:

1. The main framework: [HIPPO_Gym](https://github.com/IRLL/HIPPO_Gym)

2. The AWS code and instructions: [HIPPO_Gym_AWS](https://github.com/IRLL/HIPPO_Gym_AWS)

3. The React Front End: [HIPPO_Gym_React_FrontEnd](https://github.com/IRLL/HIPPO_Gym_FrontEnd_React)

For members of the IRLL, CMPUT656, or anyone whose organization has already setup the AWS infrastructure, the only repo required is #1.

# Real time and Muti-modal Software Framework for Reinforcement Learning

What behind our framework
===============
This project is related to the researh where a human can help teach a software agent to learn faster.For example, you have have someone play a game of Mario, and use this demonstration to help the agent learn. Or, you have have someone watch an agent playing Mario and interrupt to say "you should have jumped here". Or, you have someone watch an agent playing Mario and interrupt to say "you just messed up here." In the past, we've focused on doing things locally - building an interface for these kind of interactions isn't so bad when you just have someone sit down in front of a laptop. But, ideally, we'd be able to run these kinds of experiments over the web.

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
https://youtu.be/FbG0uGlwDoQ

In this demo video, we used our demo projectId = demo_1.4.1 and we provided no other parameters in the original query. There are three pages before the game page and one page after. The first page is a consent form that requires the user to agree the agreement before they move to the next step. In the second step, there is a qualification test to see if the user meet all the requirements for this project. The thrid step is a survey for the user to answer. The next is the game page which is also the main page that used to play the game and train the agent. After the game ends, there is a "thank you" page to thank the research participants.

## API
### 1.Get the first pre-game page ``https://api.irll.net/next/`` GET
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
### 2.Submit the forms and get the next pre-game page ``https://api.irll.net/next`` POST
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
Getting started
===============

The following instructions will get you a copy of this project and you can run the project on your local machine.

### Prerequisites

You need to install the following software:

* Node

* npm

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

### Clone

* Clone this repo to your local machine using `git clone https://github.com/IRLL-Org/RL_framework_frontend.git`

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

[forum.js](./src/components/forum.js)
Forum component, used to render the html contents that fetched from the back end and includes a "Submit" button to submit the form's data.

[game.js](./src/components/game.js)
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

[control.js](./src/components/control.js)
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
 
[header.js](./src/components/header.js)
Header component that will be rendered on every pages of our framework. We only have a irll logo for now.

[footer.js](./src/components/footer.js)
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

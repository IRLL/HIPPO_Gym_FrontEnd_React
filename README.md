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

Getting started
===============

The following instructions will get you a copy of this project and you can run the project on your local machine.

### Prerequisites

You need to install the following software:

* Node

* npm

### Dependencies

* react 
> The main Javascript library we are using for building user interfaces.
* react-device-detect
> npm package that used to detect the type of device of user for better user experience
* react-html-parser
> npm package that used to convert HTML strings into React components. Avoids the use of dangerouslySetInnerHTML and converts standard HTML elements, attributes and inline styles into their React equivalents.
* react-router
> npm package that used to provide routing in React.
* antd
> Ant-design is an enterprise-class UI design language and React UI library.Most of our framework's UI design based on this library.
* websocket
> npm package that used to build web-socket connection with our backend server. We are relying on web-socket to receive the game frames and communicating between the front end and the back end.
* axios
> npm package that used to send GET and POST request to our api endpoints
* uuid
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
Function used to control the FPS(frame per second) of the game. The default value is 30 and the increment or the decrement of each time the user press the button is 5. The allowed range of the FPS is between 5 - 90 for now.

[header.js](./src/components/header.js)
Header component that will be rendered on every pages of our framework. We only have a irll logo for now.

[footer.js](./src/components/footer.js)
Footer component that will be rendered on every pages of our framework. We have logos for ualberta and amii.

#### Setup

> Install the package for frontend 

```shell
$ npm install 
```

### Run

> Run frontend 

```shell
$ npm start
```

### Build
```
$ npm run build
```

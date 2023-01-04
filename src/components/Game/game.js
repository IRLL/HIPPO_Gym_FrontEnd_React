import React from "react";
import { fabric } from "fabric";
import './game.css'
import NewMessageBoard from "../MessageBoard/NewMessageBoard";
import ConfidenceTest from "../MessageBoard/ConfidenceTest";
import GoalReminder from "../MessageBoard/goal_reminder"
import Header from "../MessageBoard/Header";
import aeroplane from '../images/aeroplane.png';
import myData from "../data/increasing_prs.json";
import up from "../images/up.png";
import down from "../images/down.png";
import left from "../images/left.png";
import right from "../images/right.png";
import controller from "../images/controller.png";
import moreinfo from "../images/moreinfo.png";
import { w3cwebsocket } from "websocket";
import {
  WS_URL,
  USER_ID,
  PROJECT_ID,
  SERVER,
  DEBUG,
} from "../../utils/constants";
import { BsReplyAll } from "react-icons/bs";
const outer_node_ids = [3,4, 7,8,11,12];
const mid_node_ids = [2,6,10];
const inner_node_ids = [1,5, 9];
var clicked_nodes =new Array;
var use_delay = true;
var global_message = "global message";
var global_long_message = "global message";
//testing
function add_clicked_node_to_list(value)
{
   console.log('adding', value, 'to clicked nodes list')
   clicked_nodes.push(value);//push function will insert values in the list array
   console.log('updated clicked_nodes', clicked_nodes)
}
function clear_array(array)
{
    clicked_nodes.length = 0
    console.log('cleared clicked_nodes', clicked_nodes)
}
 

class circleObject {
  constructor(x, y, id, value, pos, r){
      this.maxVal = null;
      this.minVal = null;
      this.x = x;
      this.y = y;
      this.r = r;
      this.id = id;
      this.value = value;
      this.next = null;
      this.prev = null;
      this.shouldNotBeSelected = false;
      this.selected = false;
      this.pos = pos;
      this.visited = false;

      this.canvas = 0;
      this.o = new fabric.Circle({
          radius: this.r,
          fill: 'white',
          stroke: 'black',
          left: this.x,
          top: this.y,
          originX: 'center',
          originY: 'center'
      })
  }

  getRadius(){
    return this.r;
  }

  highlightNode(canvas){
      canvas.remove(this.o);
      this.o = new fabric.Circle({
          radius: this.r,
          fill: 'blue',
          left: this.x,
          top: this.y,
          originX: 'center',
          originY: 'center'
      })
      this.o.selectable = false
      this.o.hoverCursor = "pointer";
      canvas.add(this.o);
  }

  redraw(canvas, color){
      if(this.selected === false){
        canvas.remove(this.o);
         this.o = new fabric.Circle({
              radius: this.r,
              fill: 'white',
              stroke: color,
              left: this.x,
              top: this.y,
              originX: 'center',
              originY: 'center'
          })
          this.o.left = this.x;
          this.o.top = this.y;
          this.o.selectable = false;
          this.o.hoverCursor = "pointer";
          canvas.add(this.o); 
          canvas.sendBackwards(this.o);
      }else{
        this.drawText(canvas, color);
      } 
  }

  getSelected(){
      return this.selected;
  }

  doNotExplore(){
      this.shouldNotBeSelected = true;
  }

  explored(){
      return this.shouldNotBeSelected;
  }

  setNext(node){
      if(this.next === null){
          this.next = [];
          this.next.push(node);
      }else{
          this.next.push(node);
      }
      
  }

  setPrev(node){
      this.prev = node;
  }

  getNext(){
      return this.next;
  }

  getPrev(){
      return this.prev;
  }

  drawCircle(canvas){
      this.o.selectable = false;
      this.o.hoverCursor = "pointer";
      canvas.add(this.o);
      canvas.renderAll();
  }

  resizeNode(canvas, radius){
      if(!this.selected && !this.visited){
          this.r = radius;
          this.o.setRadius(radius);
          this.o.left = this.x;
          this.o.top = this.y;
          this.o.selectable = false;
          this.o.hoverCursor = "pointer";
          canvas.add(this.o);
      }else{
          this.o._objects[1].fontSize = radius/2;
          this.r = radius;
          this.o._objects[0].setRadius(radius);
          this.o = new fabric.Group([this.o._objects[0], this.o._objects[1]],{
              left: this.x,
              top: this.y,
              selectable: false,
              originX: 'center',
              originY: 'center',
          });
          this.o.hoverCursor = "pointer";
          canvas.add(this.o);
      }
  }

  drawText(canvas, color){
      canvas.remove(this.o);
      var circle = new fabric.Circle({
          radius: this.r,
          fill: 'white',
          stroke: color,
          originX: 'center',
          originY: 'center'
      })
      var text = new fabric.Text(this.value.toString(), {
          originX: 'center',
          originY: 'center',
          fontSize: this.r/2,
          fontFamily: 'Arial',
          fill: color
      });
      this.o = new fabric.Group([circle, text],{
          left: this.x,
          top: this.y,
          selectable: false,
          originX: 'center',
          originY: 'center'
      });
      this.o.hoverCursor = "cursor";
      canvas.add(this.o);
      canvas.sendBackwards(this.o);
  }

  getx(){
      return this.x;
  }

  gety(){
      return this.y;
  }

  getID(){
      return this.id;
  }

  getValue(){
      return this.value;
  }

  checkClicked(g, xpos,ypos){
    if(g){
      if(xpos<=this.x+20 && xpos>=this.x-20 && ypos<=this.y+20 && ypos>=this.y-20){
          return true;
      }
    }else{
      if(xpos<=this.x+50 && xpos>=this.x-50 && ypos<=this.y+50 && ypos>=this.y-50){
        return true;
      }
    } 
    return false;
  }
}

const pendingTime = 30;
class Game extends React.Component{
  state = {
    message: "",
    inspectorMessage: "",
    isLoading: !SERVER ? true : false, // if the server is ready to send out the data,
    isConnection: false, // if the connection to the server is established
    progress: 0, // the status of the server
  }
  // Send data to websocket server in JSON format
  sendMessage = (data) => {
    if (this.state.isConnection) {
      this.websocket.send(JSON.stringify(data));
    }
  };

  constructor(props){
    super(props);
    this.checkClickedObject = this.checkClickedObject.bind(this);
    this.displayGraph = this.displayGraph.bind(this);
    this.createAgent = this.createAgent.bind(this);
    this.removeHighlight = this.removeHighlight.bind(this);
    this.changeMessageBoardDisplayed = this.changeMessageBoardDisplayed.bind(this);
    this.manageKeyPress = this.manageKeyPress.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.setController = this.setController.bind(this);
    this.setMoreInfo = this.setMoreInfo.bind(this);
    this.changeCTDisplayed = this.changeCTDisplayed.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.inHighlight = this.inHighlight.bind(this);
    //this.checkClickedObject = this.checkClickedObject.bind(this);
    this.highlightOptimalPath = this.highlightOptimalPath.bind(this);
    this.addDelay = this.addDelay.bind(this);
    this.endDelay = this.endDelay.bind(this);
    this.endHeader = this.endHeader.bind(this);
    // this.checkForSubOptimal = this.checkForSubOptimal.bind(this);
    this.rerenderCanvas = this.rerenderCanvas.bind(this);
    this.count = 0;
    this.score = 50;
    this.totNumRound = 0;
    this.numRound = 0;

    // controller 
    this.controller = false;

    //instructions
    this.moreinfo = false;
    this.instr = "INSTRUCTIONS"
    this.instructionMessage = "In this study, you can practice your planning skills to make better decisions. You will navigate an airplane across a network of airports (white circles). Each circle has a value denoting how profitable it is to fly there. When you move the plane to a circle (a node), the value of the node is revealed and added to your total score. Each node in the game either contains a reward of up to $48 and a loss of up to -$48. If you want to reveal the value of the node without having to move the airplane, simply click on a node. However, this will cost $1. When you are ready to choose a path for your airplane, you can move the plane with the arrow keys, but only in the direction of the arrows between the nodes.";
  }

  initialize(){
    this.cWidth = document.body.clientWidth;
    this.cHeight = document.body.clientHeight;  
    this.adjList = [];
    this.gameState = [0, "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];
    this.nodesList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.graphInfo = null;
    this.graphValues = null;
    this.listOfLeaves = [];
    // this.prevHighlightList = [];
    // this.highlightList = [];

    // this.canMove = false;
    this.moved = false;
    this.avatar = null;
    this.avatarX = this.cWidth;
    this.avatarY = this.cHeight;
    this.avatarNode = null;
    // this.changeAvatarPos = 0;

    this.message = "";
    this.longMessage = "";
    this.messageBoardDisplayed = false;
    this.inspectorMessage = "";

    this.avatarWidth = null;
    this.opt_act = null;

    this.timeoutOn = false;

    this.feedback = true;
    this.isLargeGraph = false;
    this.pts = this.score;

    this.structure = [[0, [5], [1], [9]], 
                      [5, [6]], 
                      [1, "None", [2]], 
                      [9, "None", "None", [10]], 
                      [10, "None", [11], "None", [12]], 
                      [2, [3], "None", [4]], 
                      [6, "None", [7], "None", [8]]]

    // this.highestVal = null;
    // this.qVals = null;

    this.ctest = false;
    this.goal_reminder = false;
    this.ctestNum = 0;
    this.ctestMistakeNum = 0;
    this.ctestChosenDecision = false;
    this.ctestDisplayed = false;

    this.displayHeading = false;

    this.numNodes = 0;
    this.prevHighlight = [];
    this.highlight = [];
    this.highlightCopy = [];
    this.paths = {};
    this.largestLeaf = null;
    this.adjList = [];

    this.done = false;

    this.gameOver = false;
    this.enoughInfo = false;

    this.timeoutOn = false;
    this.timeout = null;
    
    this.hasOpenedNodes = false;
    this.selectedNode = null;
  }

  manageKeyPress(key){
    this.gameOver = true;
    if(this.inspectorMessage !== ""){
        this.inspectorMessage = ""
        this.setState({inspectorMessage: this.inspectorMessage});
    }
    if(!this.timeoutOn && !this.messageBoardDisplayed){
        if(key === 'Space'){
            // save e
            this.time = new Date().toLocaleTimeString();
            var message = "hit space: " + this.time;
            this.sendMessage({save: message});
        if(this.state.gameOver && !this.ctest2displayed){
            this.setState({
                message: "",
                gameOver: false,
                isConnection: true
            }, ()=>{
                this.sendMessage({
                command: "NEW GAME"
                });
            });
        }else if(this.ctest2displayed){
            this.inspectorMessage = "please answer to continue..."
            this.setState({inspectorMessage: this.inspectorMessage});
        }
        }else{
            // remove highlight
            this.removeHighlight()
            // save f
            this.time = new Date().toLocaleTimeString();
            if(!this.state.gameOver && !this.ctestDisplayed){
                if(this.avatarNode !== null){
                    if(this.avatarNode.getNext() !== null){
                        this.movingAvatar(key);
                    }
                }else{
                    this.movingAvatar(key);
                }
            }else if(this.ctestDisplayed){
                this.setState({ctestMessage: "Please answer to continue..."})
            } 
        }
    }else if(this.feedback){
        if(this.messageBoardDisplayed){
        this.inspectorMessage = "cannot move while viewing explanation"
        this.setState({inspectorMessage: this.inspectorMessage});
        }else if(this.timeoutOn){
        this.inspectorMessage = "please wait"
        this.setState({inspectorMessage: this.inspectorMessage});
        }
    }
  }
  
  componentDidMount(){
    window.addEventListener('keydown', (event)=>{
        if(event.code == "Space"){
            this.manageKeyPress(event.code);
        }else{
            this.manageKeyPress(event.key);
        }
    });

    window.addEventListener('resize', (event)=>{
      this.rerenderCanvas();
    })


    // To update the progress of loading game content
    // Since we always need to wait 30 seconds before the game
    // content get loaded, we update the progress (100/30) per second
    this.updateProgress = setInterval(
      () =>
        this.setState((prevState) => ({
          progress: prevState.progress + 100 / pendingTime,
        })),
      1000
    );

    // To ensure the websocket server is ready to connect
    // we try to connect the websocket server periodically
    // for every 30 seconds until the connection has been established
    this.timer = setTimeout(
      () => {
      //connect the websocket server
      this.websocket = new w3cwebsocket(WS_URL);
        this.websocket.onopen = () => {
        // Once the websocket connection has been established
        // we remove all the unnecessary timer
        clearTimeout(this.timer);
        clearInterval(this.updateProgress);
        console.log("WebSocket Client Connected");
        this.setState({
            isLoading: false,
            isConnection: true,
        });

        this.sendMessage({
            userId: USER_ID,
            projectId: PROJECT_ID,
        });
        }
        this.websocket.onmessage = (message) => {
            if (message.data === "done") {
            //"done" means the game has ended
            // this.setState({
            //   isEnd: true,
            //   gameEndVisible: true,
            // });
            }else{
            // parse the data from the websocket server
            let parsedData = JSON.parse(message.data);
            if (parsedData.UI){
                this.count++;
                this.numRound++;
                console.log("recieved ui");
                clear_array(clicked_nodes)
                if(this.canvas){
                    this.canvas.clear();
                }
            
                this.initialize();
                if(parsedData.CTEST){
                    this.ctest = true;
                }
                if(this.count === 1 || this.count === 43){
                    this.feedback = false;
                    this.isLargeGraph = true;
                    this.setState((prevState) => ({
                    adjValues: parsedData.UI,
                }), () => { 
                    this.displayGraph();
                });
              }else{
                if(!parsedData.FEEDBACK){
                    this.feedback = false;
                }else{
                    this.feedback = true;
                }
                this.graphValues = parsedData.UI;
                this.opt_act = parsedData.OPT_ACT;
                this.populateGraphValues();
              }
              if(this.count == 3 | this.count == 23){
            
              this.score = 50;
              this.pts = this.score;
              console.log('reset score back to 50')
              }
              if(this.count == 1){
                
                this.numRound = 1;
                this.totNumRound = 2;
                this.setState((prevState)=>({...prevState}));
              }else if(this.count == 3){
                this.numRound = 1;
                this.totNumRound = 20;
                this.setState((prevState)=>({...prevState}));
              }else if(this.count == 23){
                this.numRound = 1;
                this.totNumRound = 21;
                this.goal_reminder = true;
                this.setState((prevState)=>({...prevState}));
              }
              else if (this.count >23){
                this.goal_reminder = false;
              }
              

            }else if(parsedData.VALUES){
                console.log("recieved values")
                this.qVals = parsedData.VALUES;
                // this.handleGameState();
            }else if(parsedData.HEADER){
              console.log("HEADER PARSED")
              this.displayHeading = true;
              this.headerMessage = parsedData.HEADER;
              this.setState((prevState)=>({...prevState}));
            }
            }
        }
    });
    // SERVER ? 0 : pendingTime * 1000
  }

  rerenderCanvas(){
    var cWidth = document.body.clientWidth;
    var cHeight = document.body.clientHeight;
    var avatar = null;
    this.canvas._objects.forEach(object => {
        if(object._element !== undefined){
            avatar = object;
        }
    });

    this.canvas.clear();
    var xpos = cWidth/2;
    if(this.isLargeGraph){
      var height = cHeight;
      var orPos = cHeight/1.7;
      var ypos = cHeight/1.7;
    }else{
      if(cHeight <= 477){
        var height = cHeight;
        var orPos = cHeight/2;
        var ypos = cHeight/2;
      }else{
        var height = cHeight/1.8
        var orPos = cHeight/1.5/2;
        var ypos = cHeight/1.5/2;
      }
    }
    
    if(this.isLargeGraph){
      var radius = this.cWidth < this.cHeight ? this.cWidth/45 : this.cHeight/45;
      var dia = radius * 3;
    }else{
      var radius = cWidth < cHeight ? cWidth/28 : cHeight/28;
      var dia = radius * 3;
    }
    
    this.avatarWidth = radius*2;
    var origin = new fabric.Circle({
        radius: radius,
        fill: 'white',
        stroke: 'black',
        left: xpos,
        top: orPos,
        originX: 'center',
        originY: 'center'
    })
    origin.selectable = false;
    origin.hoverCursor = "default";
    this.canvas.add(origin);

    const createAdjPos = (i, valueRow, valueCol)=> {
        for(var j=1; j<this.adjList[i].length; j++){
            var node = this.adjList[i][j];
            if(node!==null){
                if(i === 0){
                    if(j===1){
                        node.x = xpos+(dia+20);
                        node.y = ypos;
                    }else if(j===2){
                        node.x = xpos;
                        node.y = ypos-(dia+20);
                    }else if(j===3){
                        node.x = xpos-(dia+20);
                        node.y = ypos;
                    }else if(j===4){
                        node.x = xpos;
                        node.y = ypos+(dia+20);
                    }
                }else{
                    var newx = this.adjList[valueRow][valueCol].x;
                    var newy = this.adjList[valueRow][valueCol].y;
                    if(j===1){
                        node.x = newx+(dia+20);
                        node.y = newy;
                    }else if(j===2){
                        node.x = newx;
                        node.y = newy-(dia+20);
                    }
                    else if(j===3){
                        node.x = newx-(dia+20);
                        node.y = newy;
                    }else if(j===4){
                        node.x = newx;
                        node.y = newy+(dia+20);
                    }
                }
                for(var k=1; k<this.adjList.length; k++){
                    if(this.adjList[k][0] === this.adjList[i][j].getID()){ 
                        createAdjPos(k, i, j);
                    }
                }
            }
            
        }
    }

    createAdjPos(0,0,0);
    for(var i=0; i<this.adjList.length; i++){
        for(var j=1; j<this.adjList[i].length; j++){
            var node = this.adjList[i][j];
            if(node !== null){
                node.resizeNode(this.canvas, radius);
            }
        }
    }

    this.cWidth = cWidth;
    this.cHeight = cHeight;
    this.drawArrowsFromOrigin(radius, orPos);
    for(var s=1; s<this.adjList[0].length; s++){
        this.createArrows(0, s, radius);
    }

    if(this.avatarNode === null){
        avatar.scaleToWidth(this.avatarWidth+20);
        avatar.left = cWidth/2;
        avatar.top = orPos;
        this.avatarX = cWidth;
        this.avatarY = cHeight;
    }else{
        avatar.scaleToWidth(this.avatarWidth+20);
        avatar.left = this.avatarNode.getx();
        avatar.top = this.avatarNode.gety();
        this.avatarX = this.avatarNode.getx();
        this.avatarY = this.avatarNode.gety();
    }
    this.canvas.add(avatar);

    this.canvas.setWidth(this.cWidth);
    if(this.isLargeGraph){
        this.canvas.setHeight(this.cHeight);
    }
    this.canvas.renderAll();
  }

  movingAvatar(key){
    var avatar = null;
    this.canvas.getObjects().forEach((obj)=>{
        if(obj._element){
            avatar = obj
        }
    })

    var dir = null;
    if(key === 'ArrowUp'){
        dir = "up";
        this.checkPos(dir, avatar);     
    }else if(key === 'ArrowRight'){
        dir = "right";
        this.checkPos(dir, avatar);
    }else if(key === 'ArrowLeft'){
        dir = "left";
        this.checkPos(dir, avatar);
    }else if(key === 'ArrowDown'){
        dir = "down";
        this.checkPos(dir, avatar);
    }
    if(dir !== null){
      if(this.feedback){
        if(this.canMove === false){
            this.message = "You should have inspected one of the highlighted nodes."
            this.longMessage = ""
            this.setState({message: this.message});
            if(!this.moved && this.feedback){
              // this.addHighlight("moved");
            }
        }else{
            if(!this.moved && this.feedback){
                if(this.opt_act !== dir){
                    this.message = "";
                    this.longMessage = ""
                    this.removeHighlight();
                    this.setState({message: this.message});
                } 
            }
        }
      }else if(!this.feedback && this.ctest && this.ctestNum < 3 && !this.moved){
        this.ctestChosenDecision = true;
        this.ctestDisplayed = true;
        this.ctestNum++;
        if(this.isLargeGraph){
          console.log("CTEST: ");
        }else if(this.canMove){
          // correct move
          console.log("CTEST: correct move ")
        }else if(!this.canMove){
          // made a mistake 
          this.ctestMistakeNum++;
          console.log("CTEST: wrong move ")
        }
        // save b : time quiz displayed
        this.time = new Date().toLocaleTimeString();
        var message  = "ctest displayed: " + this.time;
        this.sendMessage({save: message});
        this.setState((prevState)=>({...prevState}));
      } 
      if(!this.moved && this.feedback){
        if(!this.hasOpenedNodes){
          // message 2
          this.message = "You should have explored the nodes before moving, please wait 42 seconds ... ";
          this.longMessage = "To find a good path to take, you need to know the immediate and long-term rewards/costs of your decision.";
          this.setState((prevState)=>({...prevState}));

          // delay
        if (use_delay)
        {
            global_message = "You should have explored the nodes before moving. See Green ? for further explanation.";
            global_long_message = "To find a good path to take, you need to know the immediate and long-term rewards/costs of your decision.";
            this.addDelay(42);
            
        }

        }else if(this.hasOpenedNodes && !this.enoughInfo){
            // check if they move towards a non 48 path (i.e. 48 is not open in the selected path)
            var leaves = 0;
            var node = this.avatarNode;
            var done = false;
            while(!done){
                node = node.getNext();
                if(node.length > 1){
                    leaves = node;
                    done = true;
                }else if(node == null){
                    done = true;
                }
                node = node[0];
            }

            var fourtyEightPath = false;
            for(var l in leaves){
                if(leaves[l].getSelected() && leaves[l].getValue() === 48){
                    fourtyEightPath = true;
                }
            }

            if (fourtyEightPath && inner_node_ids.includes(this.avatarNode.getID())){
                console.log('a 48 path exists') //need to fix this. there is still an issue if you move to a 48 unexpectedly.
                this.message = " ";
                this.longMessage = "";
                this.removeHighlight();
                this.setState((prevState)=>({...prevState}));

            }
            if(!fourtyEightPath){
                // check if any opened leaves anywhere in the graph have value of 48
                
                var fourtyEightElsewhere = false;
                for(var i=0; i<this.listOfLeaves.length; i++){
                    if(this.listOfLeaves[i].getSelected() && this.listOfLeaves[i].getValue() === 48){
                        fourtyEightElsewhere = true;
                        break;
                    }
                }
                if(fourtyEightElsewhere){
                    this.message = "You don't have enough info to move in THAT direction/path, please wait 7 seconds ...";
                    this.longMessage = "Right now, you have limited information about the immediate and long-term rewards/costs in this path. You should have continued exploring the nodes in this path to ensure it's a good decision to make.";
                    this.removeHighlight();
                    this.removeRed();
                    this.setState((prevState)=>({...prevState})); 
                    if (use_delay)
                    {
                        global_message = "You don't have enough info to move in THAT direction/path. See Green ? for further explanation.";
                        global_long_message = "Right now, you have limited information about the immediate and long-term rewards/costs in this path. You should have continued exploring the nodes in this path to ensure it's a good decision to make.";
                        this.addDelay(7);
                        this.removeHighlight();
                    }
                }else{
                    // message 5
                    this.message = "You don't have enough info to move, please wait 7 seconds ...";
                    this.longMessage = "You cannot find the best path with the amount of information you currently have. You should have continued exploring the nodes.";
                    this.removeHighlight();
                    this.removeRed();
                    this.setState((prevState)=>({...prevState}));
                    if (use_delay)
                    {
                        global_message =  "You don't have enough info to move. See Green ? for further explanation.";
                        global_long_message = "You cannot find the best path with the amount of information you currently have. You should have continued exploring the nodes.";
                        this.addDelay(7);
                    }
                    //I might be able to add a condition here, so that the message that would print out upon moving is blank. This way the previous message wouldn't show up, 
                }
                // this.addDelay(3); 
            }
        }
        else {
            this.message = "";
            this.longMessage = "";
            this.removeHighlight();
            this.setState((prevState)=>({...prevState}));
        }
      }
    // else if (this.feedback && this.moved && this.avatarNode.selected == false) 
    //   //Callie: I made this condition, not sure why this.feedback is true, but it is for some reason. 
    //   // the goal of this condition is to give negative feedback if they land on an unexplored leaf on a branch where was there a 48 opened. 
    //   {
    //       console.log('right before my new condition')
    //       console.log('outer_node_ids', outer_node_ids)
    //       console.log('this.avatarNode.id', this.avatarNode.id)
    //       if (this.largestLeaf != null && outer_node_ids.includes(this.avatarNode.id) && this.avatarNode.id != this.largestLeaf.id && this.largestLeaf.value == 48)
    //       {
    //         console.log('in my new condition')
    //         this.message = "You dont have enough info to move in THAT direction/path.";
    //         this.longMessage = "Right now, you have limited information about the immediate and long-term rewards/costs in this path. You should have continued exploring the nodes in this path to ensure it's a good decision to make.";
    //         this.removeRed();
    //         this.setState((prevState)=>({...prevState})); 
    //         // if (use_delay)
    //         // {
    //         //     global_message = " test b You dont have enough info to move in THAT direction/path";
    //         //     global_long_message = "Right now, you have limited information about the immediate and long-term rewards/costs in this path. You should have continued exploring the nodes in this path to ensure it's a good decision to make.";
    //         //     this.addDelay(3);
    //         // }
    //       }
    //   }
      this.moved = true; 
    }
  }

  checkPos(dir, avatar){
    var changed = false
    if(this.avatarNode === null){
        if(dir === 'up'){
            if(this.adjList[0][2]){
                this.avatarNode = this.adjList[0][2];
                changed = true;
            }
           
        }else if(dir === 'left'){
            if(this.adjList[0][3]){
                this.avatarNode = this.adjList[0][3];
                changed = true; 
            }
            
        }else if(dir === 'right'){
            if(this.adjList[0][1]){
                this.avatarNode = this.adjList[0][1];
                changed = true;  
            }
            
        }else if(dir === 'down'){
            if(this.adjList[0][4]){
                this.avatarNode = this.adjList[0][4];
                changed = true; 
            }
            
        }
    }else{
      if(dir === 'up'){
          var found = false;
          var row = null;
          for(var i=0; i<this.adjList.length; i++){
              if(found){
                  break;
              }
              if(this.adjList[i][0] == this.avatarNode.getID()){
                  row = i;
                  found = true;
              }
          }
          if(found){
              if(this.adjList[row][2]){
                  this.avatarNode = this.adjList[row][2];
				  this.avatarNode.drawText(this.canvas, 'black');
                  changed = true;
              }
          }
      }else if(dir === 'left'){
          var found = false;
          var row = null;
          for(var i=0; i<this.adjList.length; i++){
              if(found){
                  break;
              }
              if(this.adjList[i][0] == this.avatarNode.getID()){
                  row = i;
                  found = true;
              }
          }
          if(found){
              if(this.adjList[row][3]){
                  this.avatarNode = this.adjList[row][3];
                  changed = true;
              }
          }
      }else if(dir === 'right'){
          var found = false;
          var row = null;
          for(var i=0; i<this.adjList.length; i++){
              if(found){
                  break;
              }
              if(this.adjList[i][0] == this.avatarNode.getID()){
                  row = i;
                  found = true;
              }
          }
          if(found){
              if(this.adjList[row][1]){
                  this.avatarNode = this.adjList[row][1];
                  changed = true;
              }
          }
      }else if(dir === 'down'){
          var found = false;
          var row = null;
          for(var i=0; i<this.adjList.length; i++){
              if(found){
                  break;
              }
              if(this.adjList[i][0] == this.avatarNode.getID()){
                  row = i;
                  found = true
              }
          }
          if(found){
              if(this.adjList[row][4]){
                  this.avatarNode = this.adjList[row][4];
                  changed = true;
              }
          }
      }
    }
    if(changed){
        this.avatarNode.drawText(this.canvas, 'black');
        this.avatarNode.visited = true;
        // save f
        var message = "moved: " + this.avatarNode.getID() +  " , " + "node value: " +  this.avatarNode.getValue().toString() + " , " + this.time;    
        this.sendMessage({save: message});   
      this.score += this.avatarNode.getValue();
      console.log('upating score', this.score)
      this.setState((prevState)=>({...prevState}))
      if(this.avatarNode.getNext() === null){
        // determine difference for the round (final score - original score)
        this.pts = this.score - this.pts; 
        console.log('this.score', this.score)
        console.log('this.pts', this.pts)
		if(this.feedback && this.avatarNode.getSelected()){
			this.checkSelectedPath();
		}
        // display second type of confidence question if applicable
        if(this.ctest){
            this.ctest2displayed = true;
            // save b : time quiz displayed
            this.time = new Date().toLocaleTimeString();
            var message  = "ctest2 displayed: " + this.time;
            this.sendMessage({save: message});
            this.setState((prevState)=>({...prevState}));
            
            // save d : final score at end of round
            var message = "score: " + this.score + " , " + this.pts;
            this.sendMessage({save: message});
            this.setState({ctestMessage: "", gameOver: true});
        }else{
            // save d : final score at end of round
            var message = "score: " + this.score + " , " + this.pts;
            this.sendMessage({save: message});
            this.setState({ctestMessage: "", gameOver: true});
        }
      }

      this.canvas.remove(avatar);
      var canvas = this.canvas; 
      var avatarWidth = this.avatarWidth;
      var avatarNode = this.avatarNode;
      fabric.Image.fromURL(aeroplane, function(img){
          var img1 = img.set({ 
              left: avatarNode.x, 
              top: avatarNode.y,
              originX: 'center'
          })
          img1.scaleToWidth(avatarWidth+20);
          img1.selectable = false;
          img1.hoverCursor = "default";
          canvas.add(img1); 
      }) 
      this.avatarX = avatarNode.x;
      this.avatarY = avatarNode.y;
      this.avatarNode.visited = true;
    }
  }

  checkSelectedPath(){
    const checkPath = (n) => {
      var pathSum = n.getValue();
      var node = n;
      var done = false;
      while(!done){
        var prev = node.getPrev();
        if(prev !== null && prev.getSelected()){
          pathSum += prev;
        }else if(prev === null){
          done = true;
        }else if(!prev.getSelected()){
          pathSum = null;
          done = true;
        }
        node = prev //added this here
      }
      return pathSum;
    }

    if(this.enoughInfo && this.avatarNode.getID() === this.largestLeaf.getID()){
      // message 1
      console.log('this.avatarNode.getValue()', this.avatarNode.getValue())
      console.log('this.largestLeaf.getValue()',this.largestLeaf.getValue())
      console.log('this.largestLeaf.getID()',this.largestLeaf.getID())
      this.message = "You made a good decision to move!";
      this.longMessage = ""
      this.removeHighlight();
      this.removeRed();
      this.setState((prevState)=>({...prevState}));
    }else if(!this.enoughInfo && this.avatarNode.getValue() === 48){
      // does this path have the minimum values for the other nodes
      var psum = checkPath(this.avatarNode);
      if(psum === null){
        // correctly selected path
        // message 3
        this.message = "You made a good decision to move!";
        this.longMessage = "This was a good enough decision, but it doesn’t guarantee you achieved the optimal path or max score.";
        this.removeHighlight();
        this.removeRed();
        this.setState((prevState)=>({...prevState}));
      }else if(psum === 36){ // means all nodes in this path are open with 36 = 48 - 8 - 4
        // check if there were any other 48 leaves that should've been selected instead
        var shouldSelectDiffPath = false; // this different path is a path with a leaf of 48, with either greater sum than selected path or better chance
        Object.keys(this.paths).forEach(key =>{
          var newkey = key.split(",").map(Number);
          var n = this.adjList[newkey[0]][newkey[1]];
          if(n.getSelected() === true && n.getValue() === 48){
            var newpsum = checkPath(n);
            if(newpsum === null || newpsum > psum){
              shouldSelectDiffPath = true;
            }
          }
        })
        if(shouldSelectDiffPath){
          // message 4
          this.message = "You should have selected a different path. See Green ? for further explanation.";
          this.longMessage = "Given that some other path(s) are likely to have higher scores than this path, this wasn’t the best decision you could have made.";
          this.removeHighlight();
          this.removeRed();
          if(this.feedback){
            this.highlightOptimalPath();
        }
        }else{
          // message 3
          this.message = "You made a good decision to move!";
          this.longMessage = "This was a good enough decision, but it doesn’t guarantee you achieved the optimal path or max score.";
          this.removeHighlight();
          this.removeRed();
          this.setState((prevState)=>({...prevState}));
        }
      }else if(psum !== null){ // check if there's another 48 path with all nodes open, where it's psum is greater than selected path's psum
        var shouldSelectDiffPath = false; 
        Object.keys(this.paths).forEach(key =>{
          var newkey = key.split(",").map(Number);
          var n = this.adjList[newkey[0]][newkey[1]];
          if(n.getSelected() === true && n.getValue() === 48){
            var newpsum = checkPath(n);
            if(newpsum !== null && newpsum > psum){
              shouldSelectDiffPath = true;
            }
          }
        })

        if(shouldSelectDiffPath){
            this.message = "You should have selected a different path... See Green ? for further explanation.";
            this.longMessage = "Given that some other path(s) have higher scores than this path, this wasn’t the best decision you could have made.";
        }else{
            // message 3
            this.message = "You made a good decision to move!";
            this.longMessage = "This was a good enough decision, but it doesn’t guarantee you achieved the optimal path or max score.";
            this.removeHighlight();
            this.removeRed();
            this.setState((prevState)=>({...prevState}));
        }
      }
      
    }else if(this.enoughInfo && this.avatarNode.getID() !== this.largestLeaf.getID()){
        // check if the avatarnode is a sibling of largestLeaf with the same value as it
        console.log('should be in here')
        var siblingsList = this.largestLeaf.getPrev().getNext();
        var correctNode = false; // this selection is incorrect
        for(var i=0; i<siblingsList.length; i++){
            if(siblingsList[i].getID() === this.avatarNode.getID()){
                correctNode = true; // this selection is correct
                break;
            }
        }
        if(correctNode){
            // message 1
            if (this.avatarNode.getValue() === this.largestLeaf.getValue())
            {
                this.message = "You made a good decision to move!"; //test b
                this.longMessage = "";
                this.removeRed();
                this.setState((prevState)=>({...prevState}));
            }
            else
            {
                this.message = "You should have selected a different path... See Green ? for further explanation.";
                this.longMessage = "Given that some other path(s)  do have higher scores than this path, this wasn’t the best decision you could have made.";
                this.setState((prevState)=>({...prevState}));
                this.highlightOptimalPath();
                this.removeRed();
            }

        }else{
            // message 6
            this.message = "You should have selected a different path....See Green ? for further explanation.";
            this.longMessage = "Given that some other path(s)  do have higher scores than this path, this wasn’t the best decision you could have made.";
            this.removeHighlight();
            this.setState((prevState)=>({...prevState}));
            if(this.feedback){
                this.highlightOptimalPath();
            }
        }
        
    }else if(!this.enoughInfo && this.avatarNode.getValue() !== 48){
      var leaves = 0;
      var node = this.avatarNode;
      while(node !== null){
        node = node.getNext();
        if(node !== null){
          leaves = node;
        }
      }
      var fourtyEightPath = false;
      for(var l in leaves){
        if(leaves[l].getValue() === 48){
          fourtyEightPath = true;
        }
      }
      if(fourtyEightPath){
        // message 6
        this.message = "You should have selected a different path...See Green ? for further explanation.";
        this.longMessage = "Given that some other path(s) do have higher scores than this path, this wasn’t the best decision you could have made.";
        this.removeHighlight();
        this.setState((prevState)=>({...prevState}));
        if(this.feedback){
            this.highlightOptimalPath();
        }
      }
    }
  }

  highlightOptimalPath(){
    // you know the optimal direction of movement, so just find the largest value in that direction
    // if that node is selected, then highlight the path
    var optimalNodePath = [];
    var child = this.largestLeaf;
    var parent = child.getPrev();
    // highlight path
    var done = false;
    while(!done){
        if(parent === null){
            done = true;
            break;
        }
        var pos = child.pos;
        if(pos[1] === 1){
            this.drawArrow(parent.getx()+ parent.getRadius() + 5, parent.gety(), child.getx()-child.getRadius()-5, child.gety(), 'red');
        }else if(pos[1] === 2){
            this.drawArrow(parent.getx(), parent.gety()-parent.getRadius()-5, child.getx(), child.gety()+child.getRadius() + 5, 'red');
        }else if(pos[1] === 3){
            this.drawArrow(parent.getx()-parent.getRadius()-5, parent.gety(), child.getx()+child.getRadius() + 5, child.gety(), 'red');
        }else if(pos[1] === 4){
            this.drawArrow(parent.getx(), parent.gety()+parent.getRadius() + 5, child.getx(), child.gety()-child.getRadius()-5, 'red');
        }
        parent = parent.getPrev();
        child = child.getPrev();
    }
    // connect to origin
    if(this.cHeight <= 477){
        var orPos = this.cHeight/2;
    }else{
        var orPos = this.cHeight/1.5/2;
    }
    var n;
    if(this.opt_act === "up"){
        n = 2;
    }else if(this.opt_act === "down"){
        n = 4;
    }else if(this.opt_act === "right"){
        n = 1;
    }else if(this.opt_act === "left"){
        n = 3;
    }
    if(n===1){
        this.drawArrow(this.cWidth/2 + child.getRadius() + 5, orPos, child.getx() - child.getRadius() - 5, child.gety(), 'red');
    }else if(n===2){
        this.drawArrow(this.cWidth/2, orPos -child.getRadius()- 5, child.getx(), child.gety()+child.getRadius()+5, 'red');
    }else if(n===3){
        this.drawArrow(this.cWidth/2-child.getRadius()-5, orPos, child.getx()+child.getRadius()+5, child.gety(), 'red');
    }else if(n===4){
        this.drawArrow(this.cWidth/2, orPos +child.getRadius()+5, child.getx(), child.gety()- child.getRadius()-5, 'red');
    }

  }

  populateGraphValues(){
      // myData.map(graph =>{
      //     if(graph.trial_id === 7708577571422581000){
      //         this.graphInfo = graph;
      //     }
      // });
      
      // var graphValues = this.graphInfo.stateRewards;

      // make a copy of structure
      // var newStructure = JSON.parse(JSON.stringify(structure));

      for(var j=1; j<this.structure[0].length; j++){
          if(j==1){
            this.structure[0][j].push(this.graphValues[5]);
          }else if(j==2){
            this.structure[0][j].push(this.graphValues[1]);
          }else if(j==3){
            this.structure[0][j].push(this.graphValues[9]);
          }
      }

      const recurse = (start, graphPos) =>{
          for(var n=1; n<this.structure.length; n++){
              if(this.structure[n][0] == start[0]){
                  for(var j=1; j<this.structure[n].length; j++){
                      if(this.structure[n][j] !== "None"){
                          graphPos += 1;
                          this.structure[n][j].push(this.graphValues[graphPos]);
                          recurse(this.structure[n][j], graphPos);
                      }
                  }
              }
          }
      }
      for(var i=1; i<this.structure[0].length; i++){
          var start = this.structure[0][i];
          var graphPos = null;
          if(i==1){
              graphPos = 5;
          }else if(i==2){
              graphPos = 1;
          }else if(i==3){
              graphPos = 9;
          }
          recurse(start, graphPos);
      }

      this.setState((prevState) => ({
          adjValues: this.structure
      }), () => { 
          this.displayGraph();
      });
  }

  checkClickedObject(){
    this.canvas.on('mouse:down', (e) => {
        // save a : time clicked
        var timeClicked = new Date().toLocaleTimeString();
        if(!this.ctestDisplayed){
            this.ctestChosenDecision = Math.random() > 0.5 ? true : false;
        }

        
        if(this.feedback && this.enoughInfo && !this.gameOver){
            // message 10
            this.message = "You don’t need to explore further. See Green ? for further explanation.";
            this.longMessage = "You have enough information to move towards the best path. If you explore more nodes, you reduce your reward without gaining useful information.";
            this.removeHighlight();
            this.removeRed();
            this.setState((prevState)=>({...prevState}));
        }

        if(e.target && !this.isLargeGraph && !this.ctestDisplayed){
            if(e.target.hoverCursor === "pointer" && !this.state.gameOver && !this.moved && !this.timeoutOn && !this.messageBoardDisplayed){
                var x = e.target.aCoords.tl.x;
                var y = e.target.aCoords.tl.y;
                if(this.adjList!==[]){
                    var found = false;
                    var i = 0;
                    while(!found && i<this.adjList.length){
                    for(var j=1; j<this.adjList[i].length; j++){
                        var object = this.adjList[i][j];
                        if(object!==null && object.selected === false){
                            if(object.checkClicked(false, x,y)){
                                // save a
                                var message = "node clicked: " + object.getID().toString() + " , " + "node value: " +  object.getValue().toString() + " , " + timeClicked;
                                this.sendMessage({save: message});
                                add_clicked_node_to_list(object.getID())
                                // node inspector cost
                                this.score -= 1;
                                this.setState((prevState)=>({...prevState}));

                                this.hasOpenedNodes = true;

                                object.drawText(this.canvas, 'black');
                                object.selected = true;
                                found = true;
                                this.handleClick(object);    
                                break;
                            }
                        }
                    }
                    i++;
                    }
                }  
                }else if(this.moved && !this.state.gameOver){
                    this.inspectorMessage = "You cannot use the node inspector after moving."
                    this.setState({inspectorMessage: this.inspectorMessage});
                }else if(this.messageBoardDisplayed){
                this.inspectorMessage = "You cannot use node inspector while viewing explanation."
                this.setState({inspectorMessage: this.inspectorMessage});
                }else if(e.target.hoverCursor === "pointer" && this.timeoutOn){
                this.inspectorMessage = "Please wait..."
                this.setState({inspectorMessage: this.inspectorMessage});
                }
        }else if(this.ctestDisplayed){
            this.setState({ctestMessage: "Please answer to continue..."});
        }

        if(e.target && this.isLargeGraph && !this.ctestDisplayed){
            if(e.target.hoverCursor === "pointer" && !this.state.gameOver && !this.moved){
                var x = e.target.aCoords.tl.x;
                var y = e.target.aCoords.tl.y;
                if(this.adjList!==[]){
                    var found = false;
                    var i = 0;
                    while(!found && i<this.adjList.length){
                    for(var j=1; j<this.adjList[i].length; j++){
                        var object = this.adjList[i][j];
                        if(object!==null && object.selected === false){
                            if(object.checkClicked(true, x,y)){
                                object.drawText(this.canvas, 'black');
                                object.selected = true;
                                found = true;
                                // save a
                                var message = "node clicked: " + object.getID().toString() + " , "  + "node value: " +  object.getValue().toString() + " , " + timeClicked;
                                this.sendMessage({save: message});

                                // node inspector cost
                                this.score -= 1;
                                this.setState((prevState)=>({...prevState}));

                                this.hasOpenedNodes = true;

                                break;
                            }
                        }
                    }
                    i++;
                    }
                } 
                if(this.ctestChosenDecision && this.ctestNum < 3){
                    this.ctestNum++;
                    console.log("CTEST: ");
                    this.ctestDisplayed = true;
                    this.setState((prevState)=>({...prevState}));
                }
                }else if(this.moved && !this.state.gameOver){
                    this.inspectorMessage = "You cannot use the node inspector after moving."
                    this.setState({inspectorMessage: this.inspectorMessage});
                }
        }else if(e.target && this.isLargeGraph && this.ctestDisplayed){
            this.setState({ctestMessage: "Please answer to continue..."});
        }
    })
  }

  displayGraph(){
    if(this.count === 1){
      var canvas = new fabric.Canvas('canvas');
      this.canvas = canvas;
      this.canvas.selection = false;
      this.checkClickedObject();
    }

    this.canvas.setWidth(this.cWidth);
    
    if(this.isLargeGraph){
      var height = this.cHeight;
      var orPos = this.cHeight/1.7;
      var ypos = this.cHeight/1.7;
      this.canvas.setHeight(height);
    }else{
      if(this.cHeight <= 477){
        var height = this.cHeight;
        var orPos = this.cHeight/2;
        var ypos = this.cHeight/2;
        this.canvas.setHeight(height);
      }else{
        var height = this.cHeight/1.8
        var orPos = this.cHeight/1.5/2;
        var ypos = this.cHeight/1.5/2;
        this.canvas.setHeight(height);
      }
    }
    
  
    var adjValues = this.state.adjValues;
    var adjList = this.adjList;
    var xpos = this.cWidth/2;
    if(this.isLargeGraph){
      var radius = this.cWidth < this.cHeight ? this.cWidth/45 : this.cHeight/45;
      var dia = radius * 3;
    }else{
      var radius = this.cWidth < this.cHeight ? this.cWidth/28 : this.cHeight/28;
      var dia = radius * 3;
    }
    

    const process = (item,row,j) =>{
        if(item !== "None"){
            this.numNodes+=1;
            var newx = xpos;
            var newy = ypos;
            if(j===1){
                newx = xpos+(dia+20);
                adjList[row].push(new circleObject(newx,ypos,item[0], item[1], [row, j], radius));
            }else if(j===2){
                newy = ypos-(dia+20);
                adjList[row].push(new circleObject(xpos,newy,item[0], item[1], [row, j], radius));
            }else if(j===3){
                newx = xpos-(dia+20);
                adjList[row].push(new circleObject(newx,ypos,item[0], item[1], [row, j], radius));
            }else if(j===4){
                newy = ypos+(dia+20);
                adjList[row].push(new circleObject(xpos,newy,item[0], item[1], [row, j], radius));
            }
        }else if(item === "None"){
            adjList[row].push(null);
        }
    }

    const createAdj = (i, valueRow, valueCol) =>{
        adjList[i] = [];
        adjList[i].push(adjValues[i][0])
        for(var j = 1; j<adjValues[i].length; j++){
            if(valueRow === 0 && valueCol ===0){ 
                xpos = this.cWidth/2;
                ypos = orPos; 
            }else{
                xpos = adjList[valueRow][valueCol].getx();
                ypos = adjList[valueRow][valueCol].gety();
            }
            
            process(adjValues[i][j], i, j);
            var isALeafNode = true;
            for(var k=1; k<adjValues.length; k++){
                if(adjValues[k][0] !== "None" && adjValues[i][j] !== "None"){
                    if(adjValues[k][0] === adjValues[i][j][0]){ 
                      isALeafNode = false;
                      createAdj(k, i, j);
                    }
                }
            }
            if(isALeafNode){
                var node = adjList[i][j];
                if(node !== null){
                    this.listOfLeaves.push(node);
                    this.paths[node.pos[0] + "," + node.pos[1]] = [48+8+4, -48-8-4];
                    this.highlight.push(adjList[i][j]);
                    this.highlightCopy.push(adjList[i][j]);
                }
          }
        }
    };

    // context.beginPath();
    // context.arc(xpos, ypos, 25, 0, 2 * Math.PI);
    // context.stroke();
    createAdj(0, 0, 0); 

    this.adjList = adjList;
    // special graphs, reveal relevant nodes
    const revealNode = (nToRev) => {
        for(var i=0; i < adjList.length; i++){
            for(var j=1; j < adjList[i].length; j++){
                if(adjList[i][j] !== null){
                    if(adjList[i][j].getID() == nToRev){
                        adjList[i][j].selected = true;
                    }
                }
            }
        }
    }

    if(this.count == 39){
        revealNode(12)
    }else if(this.count == 40){
        revealNode(8)
    }else if(this.count == 41){
        revealNode(4)
    }else if(this.count == 42){
        revealNode(3)
    }

    // create connections
    for(var row=0; row<this.adjList.length; row++){
        for(var col=1; col<this.adjList[row].length; col++){
            var nodeToConsider = this.adjList[row][col];
            if(nodeToConsider!==null){
                // locate its path
                if(row===0){
                    // doesn't have a previous, connected to origin
                    // find it's next connected node(s)
                    for(var r=0; r<this.adjList.length; r++){
                        if(nodeToConsider.getID() == this.adjList[r][0]){
                            for(var item=1; item < this.adjList[r].length; item++){
                                if(this.adjList[r][item]!==null){
                                    nodeToConsider.setNext(this.adjList[r][item]);
                                }
                                
                            }
                            break;
                        }
                    }
                }else{
                    // it has previous connections (possibly forward connections as well)

                    // find prev connection (will only ever be one)
                    var IdToFind = this.adjList[row][0];
                    for(var r=0; r<this.adjList.length; r++){
                        for(var c=1; c<this.adjList[r].length; c++){
                            if(this.adjList[r][c]!==null){
                                if(IdToFind == this.adjList[r][c].getID()){
                                    nodeToConsider.setPrev(this.adjList[r][c]);
                                    break;
                                }  
                            }
                        }
                    }

                    // find forward connection(s)
                    IdToFind = this.adjList[row][col].getID();
                    for(var r=0; r<this.adjList.length; r++){
                        if(this.adjList[r][0] == IdToFind){
                            for(var item=1; item < this.adjList[r].length; item++){
                                if(this.adjList[r][item]!==null){
                                    nodeToConsider.setNext(this.adjList[r][item]);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
    }

    var origin = new fabric.Circle({
        radius: radius,
        fill: 'white',
        stroke: 'black',
        left: this.cWidth/2,
        top: orPos,
        originX: 'center',
        originY: 'center',
    })

    origin.selectable = false;
    origin.hoverCursor = "default";
    this.canvas.add(origin);
    this.canvas.renderAll();
    for(var i=0; i<adjList.length; i++){
        for(var j=1; j<adjList[i].length; j++){
            if(adjList[i][j] !== null){
               adjList[i][j].drawCircle(this.canvas);
               if(adjList[i][j].selected){
                adjList[i][j].drawText(this.canvas, 'black')
               }
            }
        }
    }  

    this.drawArrowsFromOrigin(radius, orPos);

    for(var s=1; s<adjList[0].length; s++){
        this.createArrows(0,s, radius);
    }

    // populates nodesList
    for(var i in adjList){
        for(var j=1; j<adjList[i].length; j++){
            if(adjList[i][j] !== null){
                this.nodesList[adjList[i][j].getID()] = adjList[i][j];
            }
        }
    }

    this.avatarWidth = radius*2;
    this.createAgent(orPos);
    // this.setGameState();
  }

  drawArrowsFromOrigin(radius, orPos){
    for(var neighbor=1; neighbor<this.adjList[0].length; neighbor++){
        var child = this.adjList[0][neighbor];
        if(child!==null){
            if(neighbor===1){
                this.drawArrow(this.cWidth/2 + radius + 5, orPos, child.getx() - radius - 5, child.gety(), 'black');
            }else if(neighbor===2){
                this.drawArrow(this.cWidth/2, orPos -radius- 5, child.getx(), child.gety()+radius+5, 'black');
            }else if(neighbor===3){
                this.drawArrow(this.cWidth/2-radius -5, orPos, child.getx()+radius+5, child.gety(), 'black');
            }else if(neighbor===4){
                this.drawArrow(this.cWidth/2, orPos +radius+5, child.getx(), child.gety()- radius-5, 'black');
            }
        }
    }
  }

  createArrows(i,j, radius){
    var parent = this.adjList[i][j];
    if(parent !== null){
        for(var k=1; k<this.adjList.length; k++){
            if(this.adjList[k][0] == parent.getID()){
                for(var c = 1; c<this.adjList[k].length; c++){
                    var child = this.adjList[k][c];
                    if(child !== null){
                        if(c===1){
                            this.drawArrow(parent.getx()+radius + 5, parent.gety(), child.getx()-radius-5, child.gety(), 'black');
                        }else if(c===2){
                            this.drawArrow(parent.getx(), parent.gety()-radius-5, child.getx(), child.gety()+radius + 5, 'black');
                        }else if(c===3){
                            this.drawArrow(parent.getx()-radius-5, parent.gety(), child.getx()+radius + 5, child.gety(), 'black');
                        }else if(c===4){
                            this.drawArrow(parent.getx(), parent.gety()+radius + 5, child.getx(), child.gety()-radius-5, 'black');
                        }
                        this.createArrows(k,c, radius);
                    }
                }
            }
        }
    }

  }

  drawArrow(fromx, fromy, tox, toy, color){  
    var angle = Math.atan2(toy - fromy, tox - fromx);
    var headlen = 5;
    tox = tox - (headlen) * Math.cos(angle);
    toy = toy - (headlen) * Math.sin(angle);
    var points = [{
        x: fromx,  // start point
        y: fromy
        }, {
        x: fromx - (headlen / 4) * Math.cos(angle - Math.PI / 2), 
        y: fromy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
        },{
        x: tox - (headlen / 4) * Math.cos(angle - Math.PI / 2), 
        y: toy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
        }, {
        x: tox - (headlen) * Math.cos(angle - Math.PI / 2),
        y: toy - (headlen) * Math.sin(angle - Math.PI / 2)
        },{
        x: tox + (headlen) * Math.cos(angle),  // tip
        y: toy + (headlen) * Math.sin(angle)
        }, {
        x: tox - (headlen) * Math.cos(angle + Math.PI / 2),
        y: toy - (headlen) * Math.sin(angle + Math.PI / 2)
        }, {
        x: tox - (headlen / 4) * Math.cos(angle + Math.PI / 2),
        y: toy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
        }, {
        x: fromx - (headlen / 4) * Math.cos(angle + Math.PI / 2),
        y: fromy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
        },{
        x: fromx,
        y: fromy
        }]

        var arrow = new fabric.Polyline(points,{
            fill: color,
            opacity: 1,
            strokeWidth: 1,
            originX: 'left',
            originY: 'top',
            selectable: true
        });

        arrow.selectable = false;
        arrow.hoverCursor = "default";
        this.canvas.add(arrow);
        this.canvas.renderAll();

  }

  createAgent(orPos){
      var canvas = this.canvas;  
      var x = this.cWidth;
      var avatarWidth = this.avatarWidth;
      fabric.Image.fromURL(aeroplane, function(img){
          var img1 = img.set({ 
              left: x/2, 
              top: orPos,
              originX: 'center',
          })
          img1.scaleToWidth(avatarWidth + 20);
          img1.selectable = false;
          img1.hoverCursor = "default";
          canvas.add(img1); 
      })

      var avatar = null;
      this.canvas._objects.forEach(object => {
          if(object._element !== undefined){
              avatar = object;
          }
      }, this.avatar = avatar);
      // var imgelement = document.getElementById("my-image");
      // var img = new fabric.Image(imgelement, {
      //     left: this.cWidth/2,
      //     top: this.cHeight/2
      // });
      // this.canvas.add(img);
  }
  
  handleClick(node){    
      if (clicked_nodes.length === 12)
      {
          this.enoughInfo = true
      }
    if(this.selectedNode){
        this.selectedNode.redraw(this.canvas, 'black');
    }
    if(node.explored() === false){
        this.numNodes -= 1;
    }
    node.selected = true;
    this.removeHighlight();
    if (node.explored() === true){
        console.log("do not click");
        // check highlight
        this.inHighlight(node);
    }else if(node.getNext() === null){
        // is a leaf node
        this.inHighlight(node);
        var maxNode = node;
        // update its value
        this.paths[node.pos[0] + ',' + node.pos[1]][0] = this.paths[node.pos[0] + ',' + node.pos[1]][0] = this.paths[node.pos[0] + ',' + node.pos[1]][0] = this.paths[node.pos[0] + ',' + node.pos[1]][0] - 48 + node.getValue();
        this.paths[node.pos[0] + ',' + node.pos[1]][1] = this.paths[node.pos[0] + ',' + node.pos[1]][1] = this.paths[node.pos[0] + ',' + node.pos[1]][1] = this.paths[node.pos[0] + ',' + node.pos[1]][1] + 48 + node.getValue();
        // stores max value, thus other leaves in the same path don't need to be explored
        if(node.getValue() === 48){
            var prev = node.getPrev();
            var listOfLeaves = prev.getNext();
            for(var l in listOfLeaves){
                var leaf = listOfLeaves[l];
                if(leaf!==node){
                    leaf.doNotExplore();
                    if(leaf.selected === false){
                        this.numNodes-=1;
                    }
                    this.highlight.forEach((item, index)=>{
                        if(item === leaf){
                            this.highlight.splice(index, 1);
                        }
                    })
                }
            }
        }else{
            // compare with its selected siblings
            var siblings = node.getPrev().getNext();
            for(var s in siblings){
                var sibling = siblings[s];
                if(sibling !== node && sibling.selected === true){
                    if(sibling.getValue() > maxNode.getValue()){
                        maxNode.doNotExplore();
                        maxNode = sibling;
                    }else if(sibling.getValue() <= maxNode.getValue()){
                        sibling.doNotExplore();
                    }
                }
            }
        }

        var wc = this.paths[node.pos[0] + ',' + node.pos[1]][1];
        var bc = this.paths[node.pos[0] + ',' + node.pos[1]][0];
        if(maxNode === node){
            // set this to be the largest leaf
            if(this.largestLeaf == null){
                this.largestLeaf = node;
                this.paths[node.pos[0] + "," + node.pos[1]][0] = bc;
                this.paths[node.pos[0] + "," + node.pos[1]][1] = wc;

                var wc = this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][1];
                Object.keys(this.paths).forEach(key => {
                    var newkey = key.split(",").map(Number);
                    var n = this.adjList[newkey[0]][newkey[1]];
                    if(n !== this.largestLeaf && n.explored() === false && this.paths[key][0] <= wc){
                        n.doNotExplore();
                        if(n.selected === false){
                            this.numNodes-=1;
                        }
                        var nextLeaves = n.getPrev().getNext();
                        var endPath = true;
                        for(var l in nextLeaves){
                            if(nextLeaves[l].explored() === false){
                                endPath = false;
                            }
                        }
                        if(endPath === true){
                            var prev = n.getPrev();
                            while( prev!==null){
                                prev.doNotExplore();
                                if(prev.selected === false){
                                    this.numNodes-=1;
                                }
                                prev = prev.getPrev();                                            
                            }
                        }
                    }
                });    
            }else{
                // is it larger than largest leaf wc?
                if(wc > this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][0]){
                    this.replaceLargestLeaf(node);
                }else if(wc === this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][0]){
                    // check if this is a 48
                    if(node.getValue() === 48){
                        this.replaceLargestLeaf(node);
                    }
                }else{
                    // this is not the new largest leaf
                    this.paths[node.pos[0] + "," + node.pos[1]][0] = bc;
                    this.paths[node.pos[0] + "," + node.pos[1]][1] = wc;
                    //wc < this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]]
                    if(bc <= this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][1]){
                        node.doNotExplore();
                        prev = node.getPrev();
                        listOfLeaves = prev.getNext();
                        var endPath = true;
                        for(var item in listOfLeaves){
                            if(listOfLeaves[item].explored() === false){
                                endPath = false;
                            }
                        }
                        if(endPath === true){
                            var prev = node.getPrev();
                            while( prev!==null){
                                prev.doNotExplore();
                                if(prev.selected === false){
                                    this.numNodes-=1;
                                }
                                prev = prev.getPrev();                                            
                            }
                        }
                    } 
                }
            } 
        }else{
            // confirm if the path has now been eliminated
            prev = node.getPrev();
            listOfLeaves = prev.getNext();
            var endPath = true;
            for(var item in listOfLeaves){
                if(listOfLeaves[item].explored() === false){
                    endPath = false;
                }
            }
            if(endPath === true){
                var prev = node.getPrev();
                while( prev!==null){
                    prev.doNotExplore();
                    if(prev.selected === false){
                        this.numNodes-=1;
                    }
                    prev = prev.getPrev();                                            
                }
            } 
        }

        
    }else{
        // check highlight
        this.inHighlight(node);

        // not a leaf node
        // figure out which leafs' path it's a part of
        var done = false;
        var numLeaves = 0;
        var nextNode = [node];
        while(done === false){
            for(var i in nextNode){
                var next = nextNode[i].getNext();
                if(next !== null){
                    nextNode.splice(i, 1);
                    for(var n in next){
                        nextNode.push(next[n]);
                    }
                }else{
                    done = true;
                }
            }
        }
        // while(done === false){
        //     if(nextNode.length === numLeaves){
        //         done = true;
        //         break;
        //     }
        //     for(var i in nextNode){
        //         var next = nextNode[i].getNext();
        //         if(next !== null){
        //             nextNode.splice(i, 1);
        //             for(var n in next){
        //                 nextNode.push(next[n]);
        //             }
        //         }else{
        //             numLeaves++;
        //         }
        //     }
        // }

        var isPartOf = false;
        console.log('this.largestleaf', this.largestLeaf)
        for(var l in nextNode){
            if(this.largestLeaf !== null && nextNode[l].getID() === this.largestLeaf.getID()){
                isPartOf = true;
            }
        }
        for(var i in nextNode){
            if(nextNode[i].explored() === false){
                if(node.getPrev() === null){
                    this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][0] = this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][0] - 4 + node.getValue();
                    this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][1] = this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][1] + 4 + node.getValue();
                }else{
                    this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][0] = this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][0] - 8 + node.getValue();   
                    this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][1] = this.paths[nextNode[i].pos[0] + "," + nextNode[i].pos[1]][1] + 8 + node.getValue();   
                }
            }   
        } 
        if(isPartOf){
            // part of the largest leaf path
            // most likely its wc will increase
            // thus, check if every other leaf's bc < new wc
            // update wc and bc
            var wc = this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][1];
            console.log("worst case: " + this.largestLeaf.getID() + " " + wc);
            Object.keys(this.paths).forEach(key => {
                var newkey = key.split(",").map(Number);
                var n = this.adjList[newkey[0]][newkey[1]];
                console.log("best case: " + n.getID() + " " + this.paths[key][0]);
                if(n !== this.largestLeaf && n.explored() === false && this.paths[key][0] <= wc){
                    n.doNotExplore();
                    if(n.selected === false){
                        this.numNodes-=1;
                    }
                    var nextLeaves = n.getPrev().getNext();
                    var endPath = true;
                    for(var l in nextLeaves){
                        if(nextLeaves[l].explored() === false){
                            endPath = false;
                        }
                    }
                    if(endPath === true){
                        var prev = n.getPrev();
                        while( prev!==null){
                            prev.doNotExplore();
                            if(prev.selected === false){
                                this.numNodes-=1;
                            }
                            prev = prev.getPrev();                                            
                        }
                    }
                }
            });    
        }else{
            // first check if any of its leaves have surpassed largest leaf's wc 
            if(this.largestLeaf !== null){
                Object.entries(this.paths).forEach(([key, value])=>{
                    key = key.split(",").map(Number);
                    var node = this.adjList[key[0]][key[1]];
                    wc = this.paths[node.pos[0] + ',' + node.pos[1]][1];
                    bc = this.paths[node.pos[0] + ',' + node.pos[1]][0];
                    if(wc !== bc){
                        if(value[1] > this.paths[this.largestLeaf.pos[0] + ',' + this.largestLeaf.pos[1]][1]){
                            this.replaceLargestLeaf(node);
                        }
                    }else if(wc > this.paths[this.largestLeaf.pos[0] + ',' + this.largestLeaf.pos[1]][1]){
                        this.replaceLargestLeaf(node);
                    } 
                });  
            }
            

            // part of another leaf's path
            // most likely its bc will decrease (for all its siblings)
            // thus, check this leaf's and its siblings' bc against largest leaf's wc
            if(this.largestLeaf !== null){
                wc = this.paths[this.largestLeaf.pos[0] + ',' + this.largestLeaf.pos[1]][1];
                for(var i in nextNode){
                    var leaf = nextNode[i];
                    if(leaf.explored() === false){
                        if(this.paths[leaf.pos[0] + "," + leaf.pos[1]][0] <= wc){
                            leaf.doNotExplore();
                            if(leaf.selected === false){
                                this.numNodes-=1;
                            }
                            var nextLeaves = leaf.getPrev().getNext();
                            var endPath = true;
                            for(var l in nextLeaves){
                                if(nextLeaves[l].explored() === false){
                                    endPath = false;
                                }
                            }
                            if(endPath === true){
                                var prev = leaf.getPrev();
                                while( prev!==null){
                                    prev.doNotExplore();
                                    if(prev.selected === false){
                                        this.numNodes-=1;
                                    }
                                    prev = prev.getPrev();                                            
                                }
                            }
                        }
                    }
                }
            }
        }
    } 
    
    // check if they have enough info for a solution at this point
    // if there is at least one unselected leaf that is !shouldnotbeexplored, then we aren't done yet
    var numPotentialLeaves = 0;
    var done = true;
    Object.keys(this.paths).forEach(key=>{
        key = key.split(",").map(Number);
        var node = this.adjList[key[0]][key[1]];
        // node not selected and should be explored
        if(node.selected === false && node.explored() === false){
            done = false;
        }else if(node.selected === true && node.explored() === false){
            numPotentialLeaves++;
        }
    });

    if(done === true && numPotentialLeaves <= 1){
        this.enoughInfo = true;
        console.log("enough info to end at this point");
    }else{
        if(this.numNodes === 1){
            console.log("time to check");
            // this.checkForSubOptimal();
        }
    }
  }

  replaceLargestLeaf(node){
    console.log("replace largest leaf");
    // this is the new largest leaf
    var bc = this.largestLeaf.getValue();
    var wc = this.largestLeaf.getValue();
    var prev = this.largestLeaf;
    while( prev!==null){
        prev = prev.getPrev();
        if(prev !== null){
            // which level is it at
            if(prev.selected === false){
                if(prev.getNext() !== null && prev.getPrev() !== null){
                    wc -= 8;
                    bc += 8;
                }else if(prev.getNext() !== null && prev.getPrev() === null){
                    wc -= 4;
                    bc += 4;
                }  
            }else{
                wc += prev.getValue();
                bc += prev.getValue();
            }   
                
        }
    }
    this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][0] = bc;
    this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][1] = wc;

    this.largestLeaf = node;
    wc = this.paths[this.largestLeaf.pos[0] + "," + this.largestLeaf.pos[1]][1]

    // compare every single leaf to this new largest leaf's wc
    Object.keys(this.paths).forEach(key => {
        key = key.split(",").map(Number);
        var leaf = this.adjList[key[0]][key[1]];
        if(leaf.explored() === false && leaf !== this.largestLeaf && leaf.selected == true){
            bc = this.paths[key][0];
            if(bc <= wc){
                leaf.doNotExplore();
                if(leaf.selected === false){
                    this.numNodes-=1;
                }
                prev = leaf.getPrev();
                var listOfLeaves = prev.getNext();
                var endPath = true;
                for(var i in listOfLeaves){
                    if(listOfLeaves[i].explored() === false){
                        endPath = false;
                    }
                }
                if(endPath === true){
                    var prev = leaf.getPrev();
                    while( prev!==null){
                        prev.doNotExplore();
                        if(prev.selected === false){
                            this.numNodes-=1;
                        }
                        prev = prev.getPrev();                                            
                    }
                }
            }
        }
    });  
  }  

  inHighlight(selectedNode){
    // is this node in highlight?

    // clear out anything that shouldn't be explored from highlight
    for(var i in this.highlight){
        if(this.highlight[i].explored() === true){
            this.highlight.splice(i, 1);
        }
    }
    if(this.highlight.length === 0 && !this.enoughInfo){
        this.populateHighlight();
        while(this.highlight.length === 0){
            this.populateHighlight();
        }
    }

    var inHighlight = false;
    for(var item in this.highlight){
        if(this.highlight[item] === selectedNode){
            inHighlight = true;
            // message 1
            if(this.feedback){
              this.message = "You have correctly explored the right node (highlighted in green)! See Green ? for further explanation.";
              this.longMessage = "Even if the node's value was really low, this node offered you the most information about which PATH is overall more or less rewarding.";
              selectedNode.redraw(this.canvas, 'green')
              this.selectedNode = selectedNode;
              this.wrongNode = selectedNode
              this.setState((prevState)=>({...prevState}));
            } 
        }
    }    
    if(selectedNode.explored() === true){
        for(var i in this.highlight){
            if(this.highlight[i].explored() === false && this.highlight[i].selected === false){
              if(this.feedback){
                this.highlight[i].highlightNode(this.canvas);
              }     
              this.prevHighlight.push(this.highlight[i]);
            }
        }
    }
    if(inHighlight){
        this.highlight.forEach((item, index)=>{
            if(item === selectedNode){
                this.highlight.splice(index, 1);
            }
        })
    }else{
        if(this.feedback && !this.enoughInfo){
          // message 7
          this.message = "You should NOT have explored the red node. You SHOULD have explored the blue nodes, please wait 7 seconds ..."; //test a
          this.longMessage = "You should have explored one of the blue nodes because they offer you more information about which PATH is overall more or less rewarding.";

          // selected node is incorrect, provide incorrect visual
          selectedNode.redraw(this.canvas, 'red')
          this.selectedNode = selectedNode;
          this.wrongNode = selectedNode
          
         this.setState((prevState)=>({...prevState}));
          if (use_delay)
          {
              global_message = "You should NOT have explored the red node. You SHOULD have explored the blue nodes. See Green ? for further explanation."; //
              global_long_message = "You should have explored one of the blue nodes because they offer you more information about which PATH is overall more or less rewarding.";
              this.addDelay(7);
          }
        }else if(this.feedback && this.enoughInfo){
            // message 10
            this.message = "You don’t need to explore further. See Green ? for further explanation. ";
            this.longMessage = "You have enough information to move towards the best path. If you explore more nodes, you reduce your total points without gaining useful information.";
            this.removeHighlight();
            this.setState((prevState)=>({...prevState}));
        }
      for(var i in this.highlight){
          if(this.highlight[i].explored() === false && this.highlight[i].selected === false){
            if(this.feedback){
             this.highlight[i].highlightNode(this.canvas); 
            }
            this.prevHighlight.push(this.highlight[i]);
          }
      }
    }
    for(var i in this.highlight){
        if(this.highlight[i].selected === true || this.highlight[i].explored() === true){
            this.highlight.splice(i, 1);
        }
    }

	if(selectedNode.explored() && this.feedback){
        if(!this.enoughInfo && !this.moved){
           // message 7
            this.message = "You should NOT have explored the red node. You SHOULD have explored the blue nodes, please wait 7 seconds ..."; //test b
            this.longMessage = "You should have explored one of the blue nodes because they offer you more information about which PATH is overall more or less rewarding.";
            if (use_delay)
            {
                global_message = "You should NOT have explored the red node. You SHOULD have explored the blue nodes. See Green ? for further explanation.";
                global_long_message  = "You should have explored one of the blue nodes because they offer you more information about which PATH is overall more or less rewarding.";
                this.addDelay(7);
            }
            //this.moved = true
            this.setState((prevState)=>({...prevState})); 
        }else if(this.enoughInfo){
            // message 10
            this.message = "You don’t need to explore further. See Green ? for further explanation.";
            this.longMessage = "You have enough information to move towards the best path. If you explore more nodes, you reduce your reward without gaining useful information.";
            this.removeHighlight();
            this.setState((prevState)=>({...prevState}));
        }
        else {
            this.message = "in place after test b";
            this.longMessage = "";
            
            this.setState((prevState)=>({...prevState}));
        }
	}
    // else {
    //     this.message = "";
    //     this.longMessage = "";
    //     this.setState((prevState)=>({...prevState}));
    // }
  }

  populateHighlight(){
    this.prevHighlight = [];
    var otherList = [];
    while(this.highlightCopy.length !== 0){
        var node = this.highlightCopy.pop();
        if(node!== null){
            var prev = node.getPrev();
            var done = false;
            var numLeaves = 0;
            var leaves = [node];
            while(done === false){
                if(leaves.length === numLeaves){
                    done = true;
                    break;
                }
                for(var i in leaves){
                    var next = leaves[i].getNext();
                    if(next !== null){
                        leaves.splice(i, 1);
                        for(var n in next){
                            leaves.push(next[n]);
                        }
                    }else{
                        numLeaves++;
                    }
                }
            }
            for(var l in leaves){
                otherList.push(prev);
                if((leaves[l].getValue() === this.largestLeaf.getValue() || leaves[l].getValue() === 48) && leaves[l].explored() === false && prev !== null && prev.explored() === false){
                    this.highlight.push(prev);
                }
            }
        }
    }
    for(var i in otherList){
        this.highlightCopy.push(otherList[i]);
    }
  }

  removeHighlight(){
    console.log(this.prevHighlight)
    for(var i in this.prevHighlight){
      this.prevHighlight[i].redraw(this.canvas, 'black');
    }
  }
  removeRed()
  {
      this.wrongNode.redraw(this.canvas, 'black');
  }
  changeMessageBoardDisplayed(){
    if(this.messageBoardDisplayed === false){
        // they clicked on question mark to read
        // save c
        this.time = new Date().toLocaleTimeString();
        var message = "read more: " + this.time;
        this.sendMessage({save: message}); 
    }else{
        // they crossed it off
        // save c
        this.time = new Date().toLocaleTimeString();
        var message = "exit read more: " + this.time;
        this.sendMessage({save: message}); 
    }
    this.messageBoardDisplayed === false ? this.messageBoardDisplayed = true : this.messageBoardDisplayed = false;
    this.inspectorMessage = ""
    this.setState({inspectorMessage: this.inspectorMessage});
  }

  changeCTDisplayed(change, selOption, tOption, tSubmitted){
    if(change && this.ctestDisplayed){
        // save b : selected option and time selected
        var message = "ctest option selected: " + selOption.toString() + " , " + tOption;
        this.sendMessage({save: message});
        message = "ctest submitted: " + tSubmitted;
        this.sendMessage({save: message});
        this.ctestDisplayed = false;
        this.ctest2displayed = false;
        this.setState({ctestMessage: ""});
    }else if(change && this.ctest2displayed){
        // save b : selected option and time selected
        var message = "ctest2 option selected: " + selOption.toString() + " , " + tOption;
        this.sendMessage({save: message});
        this.ctest2displayed = false;
        message = "ctest2 submitted: " + tSubmitted;
        this.sendMessage({save: message});
        this.setState({ctestMessage: "", gameOver: true});
    }
    else if(change && this.goal_reminder){

        this.goal_reminder = false;
        this.setState({ctestMessage: ""});
    } 
    else{
        this.setState({ctestMessage: "Please select an option"});
    }
  }

  addDelay(seconds){
    console.log("Delay: " + seconds + "seconds");
    this.timeOut = setTimeout(this.endDelay, seconds*1000);
    this.timeoutOn = true;
  }

  endDelay(){
    this.timeoutOn = false;
    clearTimeout(this.timeOut);
    this.message = global_message;
    this.longMessage = global_long_message;
    this.setState((prevState)=>({...prevState}));

  }

  endHeader(){
    // continue to game
    this.displayHeading = false;
    this.setState({
      message: "",
      gameOver: false,
      isConnection: true
    }, ()=>{
      this.sendMessage({
        command: "RESUME"
      });
    });
  }

  setController(){
    this.controller = this.controller ? false : true;
    this.setState((prevState)=>({...prevState}));
  }

  setMoreInfo(){
    this.moreinfo = this.moreinfo ? false : true;
    this.setState((prevState)=>({...prevState}));

    // save that instructions have been selected
    this.time = new Date().toLocaleTimeString();
    if(this.moreinfo){
        var message = "opened instructions: " + this.time;
    }else{
        var message = "closed instructions: " + this.time;
    }
    this.sendMessage({save: message});
  }

  handleItemClick(key){
    this.manageKeyPress(key);
  }

  render(){
    let gameOver;
    let scoreMessage;
    if(this.state.gameOver){
      scoreMessage = <h2>You made {this.pts} points this round!</h2>
      gameOver = <h3 id="next">Press <button onClick={() => this.handleItemClick('Space')}>space</button> to continue</h3>
    }

    let sec_header;
    if(this.displayHeading){
      sec_header = <Header message={this.headerMessage} endHeader={this.endHeader}></Header>
    }

    const displayController = () =>{
        if(this.controller){
            return(
                <div className="arrowControl">
                    <img className="arrow" src={up} onClick={() => this.handleItemClick("ArrowUp")}></img>
                    <div id="middlearrows">
                        <img className="arrow" src={left} onClick={() => this.handleItemClick("ArrowLeft")}></img>
                        <img className="arrow" src={right} onClick={() => this.handleItemClick("ArrowRight")}></img>
                    </div>
                    <img className="arrow" src={down} onClick={() => this.handleItemClick("ArrowDown")}></img>
                </div>
            )
        }
    }

    const displaymoreinfo = () => {
        return <NewMessageBoard message={this.instr} longMessage={this.instructionMessage} setBoardDisplayed={this.changeMessageBoardDisplayed} currStatus={this.moreinfo}/>
    }

    if(this.count == 1 | this.count == 2)
        {
        this.round = "Pre test round:"
        this.special_case_test_message = "";
        }
    if (this.count >=3 && this.count <23)
        {
        this.round = "Training round:"
        this.special_case_test_message = "";
        }

    if (this.count >=23)
        {
        this.round = "Test round:"
        this.special_case_test_message = "";
        }

    if (this.count ==40 || this.count == 42)
    {
        this.special_case_test_message = "During this round, imagine you have to make a decision (i.e., choose a path) quickly. Your goal is still to make the best decision you can, but imagine you are now under time constraints. We have revealed the value of one of the nodes for you. ";
    }
    if (this.count == 41 || this.count == 39)
    {
    this.special_case_test_message = "During this round, imagine you are making a very important decision. For example, imagine that each path represents a different possible career. We have revealed the value of one of the nodes for you.";
    }
    return(
        
      <div id="wrapper">
        <div id="info">
          <h1 id="round">{this.round} {this.numRound}/{this.totNumRound}</h1>
          <div id="groupedbar">
            <h1 id="score">{this.score} pts</h1>
            <img className="option" id="controller" src={controller} onClick={this.setController}></img>
            <img className="option" id="moreinfo" src={moreinfo} onClick={this.setMoreInfo}></img>
          </div>

          <h1 align="center">{this.special_case_test_message}</h1>

          {displaymoreinfo()}
          <NewMessageBoard message={this.message} longMessage={this.longMessage} setBoardDisplayed={this.changeMessageBoardDisplayed} currStatus={this.moreinfo}/>  
          <ConfidenceTest ctest = {this.ctestDisplayed} ctest2 = {this.ctest2displayed} setCTDisplay = {this.changeCTDisplayed}></ConfidenceTest>
          <GoalReminder goal_reminder = {this.goal_reminder} setCTDisplay ={this.changeCTDisplayed} ></GoalReminder>

        </div>
    
        <canvas id="canvas"/>  
        {scoreMessage}
        {gameOver}
        <h3>{this.inspectorMessage}</h3>  
        <h3>{this.state.ctestMessage}</h3>   
        {sec_header}
        {displayController()}
    </div>   
    );
    }
    
}
        
export default Game;
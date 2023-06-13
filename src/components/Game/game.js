import React from "react";
import { fabric } from "fabric";
import './game.css'
import MessageBoard from "../MessageBoard/MessageBoard";
import NewMessageBoard from "../MessageBoard/NewMessageBoard";
import ConfidenceTest from "../MessageBoard/ConfidenceTest";
import Header from "../MessageBoard/Header";
import aeroplane from '../images/aeroplane.png';
import controller from "../images/controller.png";
import moreinfo from "../images/moreinfo.png";
import up from "../images/up.png";
import down from "../images/down.png";
import left from "../images/left.png";
import right from "../images/right.png";
import myData from "../data/increasing_prs.json";
import { w3cwebsocket } from "websocket";
import {
  WS_URL,
  USER_ID,
  PROJECT_ID,
  SERVER,
  DEBUG,
} from "../../utils/constants";
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

  redraw(canvas){
      if(this.selected === false){
        canvas.remove(this.o);
         this.o = new fabric.Circle({
              radius: this.r,
              fill: 'white',
              stroke: 'black',
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
          this.drawText(canvas);
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

  drawText(canvas){
      canvas.remove(this.o);
      var circle = new fabric.Circle({
          radius: this.r,
          fill: 'white',
          stroke: 'black',
          originX: 'center',
          originY: 'center'
      })
      var text = new fabric.Text(this.value.toString(), {
          originX: 'center',
          originY: 'center',
          fontSize: this.r/2,
          fontFamily: 'Arial',
          fill: 'black'
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
    inspectorMessage: ""
  }
  // Send data to websocket server in JSON format
  sendMessage = (data) => {
    if (this.state.isConnection) {
      this.websocket.send(JSON.stringify(data));
    }
  };

  constructor(props){
    super(props);
    this.state = {delay: 0};
    this.updateTimer = this.updateTimer.bind(this);
    this.checkClickedObject = this.checkClickedObject.bind(this);
    this.displayGraph = this.displayGraph.bind(this);
    this.createAgent = this.createAgent.bind(this);
    this.removeHighlight = this.removeHighlight.bind(this);
    this.changeMessageBoardDisplayed = this.changeMessageBoardDisplayed.bind(this);
    this.changeCTDisplayed = this.changeCTDisplayed.bind(this);
    // this.setController = this.setController.bind(this);
    this.setMoreInfo = this.setMoreInfo.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);
    this.manageKeyPress = this.manageKeyPress.bind(this);
    this.endHeader = this.endHeader.bind(this);
    this.count = 0;
    this.score = 50;
    this.totNumRound = 0;
    this.numRound = 0;

    // this.controller = false;
    this.instr = "INSTRUCTIONS";
    this.moreinfo = false;
  }

  initialize(){
    this.cWidth = document.body.clientWidth;
    this.cHeight = document.body.clientHeight;  
    this.adjList = [];
    this.gameState = [0, "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"];
    this.nodesList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    this.graphInfo = null;
    this.graphValues = null;
    this.prevHighlightList = [];
    this.highlightList = [];

    this.canMove = false;
    this.moved = false;
    this.avatar = null;
    this.avatarX = this.cWidth;
    this.avatarY = this.cHeight;
    this.avatarNode = null;
    this.changeAvatarPos = 0;

    this.message = "";
    this.messageBoardDisplayed = false;
    this.inspectorMessage = "";

    this.avatarWidth = null;
    this.opt_act = null;

    this.timeoutOn = false;

    this.feedback = true;
    this.isLargeGraph = false;
    this.pts = 0;

    this.structure = [[0, [5], [1], [9]], 
                      [5, [6]], 
                      [1, "None", [2]], 
                      [9, "None", "None", [10]], 
                      [10, "None", [11], "None", [12]], 
                      [2, [3], "None", [4]], 
                      [6, "None", [7], "None", [8]]]

    this.highestVal = null;
    this.qVals = null;

    this.ctest = false;
    this.ctestNum = 0;
    this.ctestMistakeNum = 0;
    this.ctestChosenDecision = false;
    this.ctestDisplayed = false;

    this.displayHeading = false;
  }

  manageKeyPress(key){
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
      }
      // }else if(this.timeoutOn){
      //   this.inspectorMessage = "please wait"
      //   this.setState({inspectorMessage: this.inspectorMessage});
      // }
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
    // this.updateProgress = setInterval(
    //   () =>
    //     this.setState((prevState) => ({
    //       progress: prevState.progress + 100 / pendingTime,
    //     })),
    //   1000
    // );

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
              }
          
              if(this.count == 1){
                this.numRound = 1;
                this.totNumRound = 2;
                this.setState({});
              }else if(this.count == 3){
                this.numRound = 1;
                this.totNumRound = 20;
                this.setState({});
              }else if(this.count == 23){
                this.numRound = 1;
                this.totNumRound = 21;
                this.setState({});
              }
              this.pts = this.score; // we will calculate final difference by comparing to this original value
            }else if(parsedData.VALUES){
              console.log("recieved values")
              this.qVals = parsedData.VALUES;
              this.handleGameState();
            }else if(parsedData.HEADER){
              console.log("HEADER PARSED")
              this.displayHeading = true;
              this.headerMessage = parsedData.HEADER;
              this.setState((prevState)=>({...prevState}));
            }
          }
      }
    }
    });
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
    // this.canvas.setHeight(this.cHeight);
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
            this.setState({message: this.message});
            // if(!this.moved && this.feedback){
            //   this.addHighlight("moved");
            // }
            this.addHighlight("moved");
        }else{
            if(!this.moved && this.feedback){
                if(this.opt_act !== dir){
                    this.message = ""; //shouldn't give feedback if going in the wrong direction
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
        this.sendMessage({save: message})
        this.setState({});
      } 
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
      this.avatarNode.visited = true;
      this.avatarNode.drawText(this.canvas);
      // save f
      var message = "moved: " + this.avatarNode.getID() + " , " + this.time;    
      this.sendMessage({save: message});   
      this.score += this.avatarNode.getValue();
      this.setState((prevState)=>({...prevState}));
      if(this.avatarNode.getNext() === null){
        // determine difference for the round (final score - original score)
        this.pts = this.score - this.pts; 

        // display second type of confidence question if applicable
        if(this.ctest){
            this.ctest2displayed = true;
            // save b : time quiz displayed
            this.time = new Date().toLocaleTimeString();
            var message  = "ctest2 displayed: " + this.time;
            this.sendMessage({save: message});
            this.setState((prevState)=>({...prevState}));
            // save d : final score at end of round, b/c the ctest is always true at the end of the game, so it never reached the below condition to save the score
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
      
      if(e.target && !this.isLargeGraph && !this.ctestDisplayed){
        if(e.target.hoverCursor === "pointer" && !this.state.gameOver && !this.moved && !this.timeoutOn && !this.messageBoardDisplayed){
          var x = e.target.aCoords.tl.x;
          var y = e.target.aCoords.tl.y;
          if(this.adjList!==[] && this.moved === false){
            var found = false;
            var i = 0;
            while(!found && i<this.adjList.length){
              for(var j=1; j<this.adjList[i].length; j++){
                var object = this.adjList[i][j];
                if(object!==null && object.selected === false){
                  if(object.checkClicked(false,x,y)){
                    // save a and g 
    
                    var message = "node clicked: " + object.getID().toString() + " , " + "node value: " +  object.getValue().toString() + " , " + timeClicked;
                    this.sendMessage({save: message});

                    object.drawText(this.canvas);
                    object.selected = true;
                    found = true;
                    
                    // node inspector cost
                    this.score -= 1;
                    this.setState((prevState)=>({...prevState}));

                    this.handleClick(object);    
                    break;
                  }
                }
              }
              i++;
            }
          }  
        }else if(this.moved && !this.state.gameOver){
            this.inspectorMessage = "cannot use the node inspector after moving"
            this.setState({inspectorMessage: this.inspectorMessage});
        }else if(this.messageBoardDisplayed){
          this.inspectorMessage = "cannot use node inspector while viewing explanation"
          this.setState({inspectorMessage: this.inspectorMessage});
        }else if(e.target.hoverCursor === "pointer" && this.timeoutOn){
          this.inspectorMessage = "please wait.."
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
                  if(object.checkClicked(true,x,y)){
                    object.drawText(this.canvas);
                    object.selected = true;
                    found = true;

                    // save a
                    var message = "node clicked: " + object.getID().toString() + " , " + "node value: " +  object.getValue().toString() + " , " + timeClicked;

                    this.sendMessage({save: message});

                    // node inspector cost
                    this.score -= 1;
                    this.setState((prevState)=>({...prevState}));

                    // this.handleClick(object);    
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
            this.setState({});
          }
        }else if(this.moved && !this.state.gameOver){
          this.inspectorMessage = "cannot use the node inspector after moving"
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
            for(var k=1; k<adjValues.length; k++){
                if(adjValues[k][0] !== "None" && adjValues[i][j] !== "None"){
                    if(adjValues[k][0] === adjValues[i][j][0]){ 
                        createAdj(k, i, j);
                    }
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
        revealNode(4)
    }else if(this.count == 40){
        revealNode(8)
    }else if(this.count == 41){
        revealNode(11)
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
              adjList[i][j].drawText(this.canvas)
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
    this.setGameState();
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
              originX: 'center'
          })
          img1.scaleToWidth(avatarWidth+20);
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

  setGameState(){
    if(this.highlightList.length > 0){
        for(var i in this.highlightList){
            this.prevHighlightList.push(this.highlightList[i]);
        }
    }
    console.log(this.gameState.toString().replaceAll(",", " "));
    this.sendMessage({
      command: "get next",
      info: this.gameState.toString().replaceAll(",", " ")
    });
    //Just added these two lines
    var message = {info: this.gameState.toString().replaceAll(",", " ")};
    this.sendMessage({save: message});

    
    

  }

  handleGameState(){
    this.highestVal = null;
    var moveVal = null;
    for(var i in this.qVals){
        if(i == 13){
            moveVal = this.qVals[i];
            break;
        }
        if(this.highestVal === null){
          this.highestVal = this.qVals[i];
            this.highlightList.push(this.nodesList[i]);
        }else if(this.qVals[i] > this.highestVal){
          this.highestVal = this.qVals[i];
            this.highlightList = [];
            this.highlightList.push(this.nodesList[i]);
        }else if(this.qVals[i] == this.highestVal){
            this.highlightList.push(this.nodesList[i]);
        }
    }

    if(this.highestVal - moveVal < .01){
        this.highlightList = [];
        console.log("can move at this point");
        this.canMove = true;
    }
  }

  handleClick(node){
    // if(this.timeOut){
    //   console.log("in hereeeeeeeeeeeee")
    //   clearTimeout(this.timeOut)
    //   this.removeHighlight()
    // }
    this.gameState[node.getID()] = node.getValue();  
    var inHighlight = false;
    for(var i in this.highlightList){
        if(this.highlightList[i].getID() == node.getID()){
            inHighlight = true
        }
    }

    if(!this.feedback && !inHighlight && this.ctest && this.ctestChosenDecision && this.ctestNum < 3){
      // made a mistake
      this.ctestMistakeNum++;
      this.ctestNum++;
      console.log("CTEST: wrong move");
      this.ctestDisplayed = true;
      this.setState({});
    }else if(!this.feedback && this.ctest && this.ctestChosenDecision && this.ctestNum < 3){
      // correct move 
      this.ctestNum++;
      console.log("CTEST: correct move ");
      this.ctestDisplayed = true;
      this.setState({});
    }

    if(this.feedback){
      if(this.canMove && !this.moved){
        this.message = "You shouldn't have inspected any more nodes.";
        this.setState({message: this.message});
        this.addDelay(node) // this shows the delay in this case, before no delay was occuring here which is a mistake
      }else if(this.canMove && this.moved){
          this.message = "Good Job!";
          this.setState({message: this.message});
      }else{
          // should have clicked a node
          if(!inHighlight){
              this.message = "You should have inspected one of the highlighted nodes."
              this.setState({message: this.message});
              this.addHighlight(node);
          }else{
              this.message = "Good Job!";
              this.setState({message: this.message});
          }
      }
    }

    this.canMove = false;
    this.setGameState();
    
  }

  removeHighlight(){
    this.timeoutOn = false;
    clearTimeout(this.timeOut)
    this.inspectorMessage = ""
    this.setState({inspectorMessage: this.inspectorMessage});
    if(this.prevHighlightList.length === 0){
      for(var i in this.highlightList){
        this.highlightList[i].redraw(this.canvas);
      }
    }else{
      for(var i in this.prevHighlightList){
        this.prevHighlightList[i].redraw(this.canvas);
      }
    }

    if(this.avatarNode){
      this.avatarNode.drawText(this.canvas);
    }
    
  }
  addDelay(node){

    var loss;
    var delay;
    var strictness = 10;
    

    loss = this.qVals[13] - this.qVals[node.getID()]; //moving was the best decision here so that's why i'm substracting this.qVals[node.getID()] from this.qVals[13]
    
    delay =  (2 + Math.round(strictness * loss));

    console.log('DELAY', delay)
    console.log('this.highestVal', this.highestVal)
    console.log('this.qVals[13]', this.qVals[13])
    console.log('this.qVals', this.qVals)
    // this.setState({delay: delay})
    // this.timeOut = setTimeout(this.removeHighlight, delay*1000);
    this.setState(prevState => ({delay: 1}))
    this.timeOut = setTimeout(this.removeHighlight, 1000);
    this.updateTimer();
    //this.timeOut = setTimeout(this.removeHighlight, 0);
    this.timeoutOn = true;
  }

  updateTimer(){
    if(this.state.delay >= 0){
      this.setState(prevState => ({ delay: this.state.delay - 1, timerMessage: "please wait " + this.state.delay + " seconds" }), () => {
        this.timeoutID = setTimeout(() => {
          this.updateTimer();
        }, 1000);
      });
    }else{
      this.setState({timerMessage: ""})
    }
  }

  addHighlight(node){
    for(var i in this.highlightList){
        if(this.highlightList[i].selected === false && i !== 13){
          this.highlightList[i].highlightNode(this.canvas);
        }
    }

    var loss;
    var delay;
    var strictness = 10;
    if(node == "moved"){
      loss = this.highestVal - this.qVals[13];
    }else{
      loss = this.highestVal - this.qVals[node.getID()];
    }
    delay =  (2 + Math.round(strictness * loss));

    console.log('DELAY', delay)
    console.log('this.highestVal', this.highestVal)
    console.log('this.qVals[13]', this.qVals[13])
    console.log('this.qVals', this.qVals)

    console.log(delay)
    //this.timeOut = setTimeout(this.removeHighlight, delay*1000);
    //this.timeOut = setTimeout(this.removeHighlight, 0);
    //this.timeoutOn = true;
    // this.setState({delay: delay})
    // this.timeOut = setTimeout(this.removeHighlight, delay*1000);
    this.setState(prevState => ({delay: 1}))
    this.timeOut = setTimeout(this.removeHighlight, 1000);
    this.updateTimer();
    this.timeoutOn = true;
  }

  changeMessageBoardDisplayed(){
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
    }else{
        this.setState({ctestMessage: "please select an option"});
    }
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

  // setController(){
  //   this.controller = this.controller ? false : true;
  //   this.setState((prevState)=>({...prevState}));
  // }

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

    // const displayController = () =>{
    //   if(this.controller){
    //     return(
    //         <div className="arrowControl">
    //             <img className="arrow" src={up} onClick={() => this.handleItemClick("ArrowUp")}></img>
    //             <div id="middlearrows">
    //                 <img className="arrow" src={left} onClick={() => this.handleItemClick("ArrowLeft")}></img>
    //                 <img className="arrow" src={right} onClick={() => this.handleItemClick("ArrowRight")}></img>
    //             </div>
    //             <img className="arrow" src={down} onClick={() => this.handleItemClick("ArrowDown")}></img>
    //         </div>
    //     )
    //   }
    // }

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
          <h1 id="round">{this.numRound}/{this.totNumRound}</h1>
          <div id="groupedbar">
            <h1 id="score">{this.score} pts</h1>
            {/* <img className="option" id="controller" src={controller} onClick={this.setController}></img> */}
            {/* <img className="option" id="moreinfo" src={moreinfo} onClick={this.setMoreInfo}></img> */}
          </div>

          <h1 align="center">{this.special_case_test_message}</h1>
          {displaymoreinfo()}

          <MessageBoard message={this.message} setBoardDisplayed={this.changeMessageBoardDisplayed}/>  
          <ConfidenceTest ctest = {this.ctestDisplayed} ctest2 = {this.ctest2displayed} setCTDisplay = {this.changeCTDisplayed}></ConfidenceTest>
        </div>
        <h4>{this.state.timerMessage}</h4>{/* timer */}
        <canvas id="canvas"/>  
        {scoreMessage}
        {gameOver}
        <h3>{this.inspectorMessage}</h3>  
        <h3>{this.state.ctestMessage}</h3>   
        {sec_header}
        {/* {displayController()} */}
      </div>   
    );
  }
}
        
export default Game;
        
        
        
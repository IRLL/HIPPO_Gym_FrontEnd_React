// Establish the websocket connection and deal with incoming and outgoing messages
import { WS_URL } from "../../utils/constants";


export default () => {
  const pendingTime = 30;
  // const { WS_URL } = require("../../utils/constants");
  // listen to messages that are being sent to this worker
  onmessage = function(event) {
    // To ensure the websocket server is ready to connect
		// we try to connect the websocket server periodically
		// for every 30 seconds until the connection has been established
    this.timer = setTimeout(() => {
      console.log("we are in the webworker now")
      console.log(event.data)
      var websocket = new WebSocket(WS_URL)

      // open a websocket connection
      websocket.onopen = () => {
        console.log("A websocket connection has been established in the webworker");
        websocket.send(JSON.stringify(
          {
            userId: event.data.USER_ID,
            projectId: event.data.PROJECT_ID,
            frameCount: 0,
            frameId: 0,
          }
        ))
      }
      // listen for messages from the websocket server
      websocket.onmessage = (message) => {
        console.log("WORKER - Message has been recieved and the data includes: ", message)
      }

      // listen to the websocket closing status
      websocket.onclose = () => {
        console.log("closed websocket connection")
      }
    }, pendingTime ? 0 : pendingTime * 1000)
  };
};


// let code = workercode.toString();
// code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

// const blob = new Blob([code], { type: "application/javascript" });
// const worker_script = URL.createObjectURL(blob);

// export default worker_script;

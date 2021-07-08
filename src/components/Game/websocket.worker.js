// const { WS_URL } = require("../../utils/constants");

const workercode = () => {
  onmessage = function(event) {
  console.log("we are in the webworker now")
  console.log(event.data)
  var ws = new WebSocket(event.data.WS_URL)

  ws.onopen = () => {
    console.log("A websocket connection has been established in the webworker");
    ws.send(JSON.stringify(
      {
        userId: event.data.USER_ID,
        projectId: event.data.PROJECT_ID,
        frameCount: 0,
        frameId: 0,
      }
    ))
  }

  ws.onmessage = (message) => {
    console.log("WORKER - Message has been recieved and the data includes: ", message)
  }

  ws.onclose = () => {
    console.log("closed websocket connection")
  }
  };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

module.exports = worker_script;
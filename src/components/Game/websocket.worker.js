// const { WS_URL } = require("../../utils/constants");

const workercode = () => {
  onmessage = function(event) {
  console.log("we are in the webworker now")
  var ws = new WebSocket(event.data)

  ws.onopen = () => {
    console.log("A websocket connection has been established");
    // ws.send = () => {
    //   consol
    // }
  }

  ws.onmessage = (message) => {
    console.log("Message has been recieved and the data includes: ", message)
  }

  ws.onclose = () => {
    console.log("CLOSED WS")
  }
  };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

module.exports = worker_script;
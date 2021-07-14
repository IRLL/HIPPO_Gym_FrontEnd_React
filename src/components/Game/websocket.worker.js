// Establish the websocket connection and deal with incoming and outgoing message


export default () => {
  const pendingTime = 30;
  // listen to messages that are being sent to this worker
  onmessage = function(event) {
    // To ensure the websocket server is ready to connect
		// we try to connect the websocket server periodically
		// for every 30 seconds until the connection has been established
    this.timer = setTimeout(() => {
      console.log("In the webworker")
      var websocket = new WebSocket(event.data.WS_URL)

      // open a websocket connection
      websocket.onopen = () => {
        postMessage({
          type: 'connection',
          value: 'open',
        })
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
        postMessage({
          type: 'data',
          value: message.data,
        })
      }

      // listen to the websocket closing status
      websocket.onclose = () => {
        postMessage({
          type: 'connection',
          value: 'close',
        })
      }
    }, pendingTime ? 0 : pendingTime * 1000)
  };
};

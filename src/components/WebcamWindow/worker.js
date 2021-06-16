// worker.js
// Reference: https://codesandbox.io/s/web-worker-reactjs-2sswe?file=/src/myClass.js:480-522

const workercode = () => {
  onmessage = function(e) {
  const webcamScreenshot = this.webcam.getScreenshot();
  console.log(webcamScreenshot)
  };
};

let code = workercode.toString();
code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));

const blob = new Blob([code], { type: "application/javascript" });
const worker_script = URL.createObjectURL(blob);

module.exports = worker_script;
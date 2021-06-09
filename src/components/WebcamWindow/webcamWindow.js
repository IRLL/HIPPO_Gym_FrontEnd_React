import React from "react";
import "antd/dist/antd.css";
import "./webcamWindow.css";
import { Button } from "antd";
import { icons } from "../../utils/icons";
import Webcam from "react-webcam";


// this class contains the webcam component
// it also handles the capturing of
class WebcamWindow extends React.Component {


  componentDidMount() {
    this.props.setStartCapture(this.startCapture);
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  };

  // handle image captured by the webcam
  handleCapture = (method) => {
    var timestamp = new Date()
    const webcamScreenshot = this.webcam.getScreenshot();
    console.log("webcam screenshot: ", webcamScreenshot)
    this.props.sendMessage({
      webcamImage : webcamScreenshot,
      webcamMethod : method, // available options: ["frameRate", "captureButton", "captureRequest"]
      webcamTimestamp: timestamp.getTime(),
    });
  };

  // call handleCapture at the rate provided by webcamFps
	startCapture = () => {
		console.log("startCapture has been called")
    setInterval(() => {
      var timestamp = new Date();
      console.log(timestamp)
      this.handleCapture("frame rate");
    },1000/10)
		// if (true){
		// 	var temp = setTimeout(() => {
		// 		this.handleCapture("frame rate");
		// 		this.startCapture();
		// 	},1000/10)
		// }
	}


  render() {

    const {webcamCaptureButton, sendMessage } = this.props;

    // videoConstraints are the MediaStreamConstraints: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
    // width and height here, refer to the resolution
    let videoConstraints = {
      width: 200,
      height: 150,
      facingMode: "user",
    };

    return (
      <div className="webcam">
        <Webcam
          audio={false}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
        {webcamCaptureButton ?
          <Button onClick={() => this.handleCapture('capture button')} className="webcamButton" type="primary" shape="circle" icon={icons["camera"]}></Button>
        : null}
			</div>
    )

  }

}

export default WebcamWindow;
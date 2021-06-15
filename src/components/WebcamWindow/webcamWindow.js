import React from "react";
import "antd/dist/antd.css";
import "./webcamWindow.css";
import { Button } from "antd";
import { icons } from "../../utils/icons";
import Webcam from "react-webcam";

// this class contains the webcam component
// it also handles the capturing of

var fpsCapture;

class WebcamWindow extends React.Component {

  componentDidMount() {
    this.props.setStartCapture(this.startCapture);
    this.props.setStopCapture(this.stopCapture);
  }

  setRef = (webcam) => {
    this.webcam = webcam;
  };

  // handle image captured by the webcam
  handleCapture = (method, count) => {
    // console.log(count)
    var timestamp = new Date()
    const webcamScreenshot = this.webcam.getScreenshot();
    this.props.sendMessage({
      webcamImage : webcamScreenshot,
      webcamMethod : method, // available options: ["frameRate", "captureButton", "captureRequest"]
      webcamTimestamp: timestamp.getTime(),
    });
  };

  // call handleCapture at the rate provided by webcamFps
  // TODO: check that permission for camera has been granted
	startCapture = () => {
    // var arr = new Array();
    var count = 0;
    console.log("start time: ", Date())
    fpsCapture = setInterval(() => {
      count++
      this.handleCapture("frame rate", count );
    },1000/10)
    // if (true) {
    //   fpsCapture = setTimeout(() => {
    //     count++;
    //     this.handleCapture("frame rate");
    //     this.startCapture()
    //   }, 1000/10)
    // }
    setTimeout(() => {
      console.log("count : ", count)
      console.log("stop time: ", Date())
      clearInterval(fpsCapture)
    }, 50000)
	}

  stopCapture = () => {
    clearInterval(fpsCapture)
  }

  render() {

    const {webcamCaptureButton, webcamSmall} = this.props;

    // videoConstraints are the MediaStreamConstraints: https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
    // width and height here, refer to the resolution
    let videoConstraints;
    if (webcamSmall){
      videoConstraints = {
        width: 200,
        height: 150,
        facingMode: "user",
      };
    } else {
      videoConstraints = {
        width: 398,
        height: 398,
        facingMode: "user",
      };
    }


    return (
      <div className="webcam">
        <Webcam
          audio={false}
          ref={this.setRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={true}
        />
        {webcamCaptureButton ?
          <Button onClick={() => this.handleCapture('capture button')} className="webcamButton" type="primary" shape="circle" icon={icons["camera"]}/>
        : null}
			</div>
    )

  }

}

export default WebcamWindow;
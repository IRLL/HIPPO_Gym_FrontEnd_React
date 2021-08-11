import React from 'react';
import './infoPanel.css';
import 'antd/dist/antd.css';
import { Row } from "antd";
import capitalize from "../../utils/capitalize";

class InfoPanel extends React.Component {

 render() {

   const {
     infoPanel,
     orientation
   } = this.props

   const elements = []
   let textUI=[]
   let itemsUI=[]
   let kvUI=[]

   for(let key in infoPanel){
    if (key==="text") {
      elements["text"] = (
        <div>{infoPanel[key]}</div>
      )
      textUI.push(elements["text"]);
    } else if (key==="items") {
      if (infoPanel[key]){
        infoPanel[key].forEach((item, i) => {
          elements[`item${i}`] = (
            <li key={`item${i}`}>{item}</li>
            )
        itemsUI.push(elements[`item${i}`]);
        })
      }
    } else if(key==="kv"){
      for(let object in infoPanel[key]){
        for (let k in infoPanel[key][object]){
          elements[`${k}`] = (
            <div key={k}><strong>{capitalize(k)}</strong>: {infoPanel[key][object][k]}</div>
          )
          kvUI.push(elements[`${k}`]);
        }
      }
    }
  }

   return (
     <div className={`${orientation}InfoPanel`}>
          <Row gutter={[4, 8]} justify="start" className="infoPanelItem">
            <ul>{textUI}</ul>
          </Row>
          <Row gutter={[4, 8]} justify="start" className="infoPanelItem">
            <ul>{itemsUI}</ul>
          </Row>
          <Row gutter={[4, 8]} justify="start" className="infoPanelItem">
            <ul>{kvUI}</ul>
          </Row>
     </div>
   )
 }
}

export default InfoPanel;
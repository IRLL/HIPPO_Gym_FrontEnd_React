import React from 'react';
import './infoPanel.css';
import 'antd/dist/antd.css';
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
        <div>{infoPanel[key].toString()}</div>
      )
      textUI.push(elements["text"]);
    } else if (key==="items") {
      if (infoPanel[key]){
        infoPanel[key].forEach((item, i) => {
          elements[`item${i}`] = (
            <p key={`item${i}`}>{item.toString()}</p>
            )
        itemsUI.push(elements[`item${i}`]);
        })
      }
    } else if(key==="kv"){
        for(let object in infoPanel[key]){
          for (let k in infoPanel[key][object]){
            elements[`${k}`] = (
              <div key={k}><strong>{capitalize(k.toString())}</strong>: {infoPanel[key][object][k].toString()}</div>
            )
            kvUI.push(elements[`${k}`]);
          }
        }
      }
    }

   return (
     <div className={`${orientation}InfoPanel`} style={{height: "20em", width: "25em"}}>
        <samp>{textUI}</samp>
        <samp>{itemsUI}</samp>
        <samp>{kvUI}</samp>
     </div>
   )
 }
}

export default InfoPanel;
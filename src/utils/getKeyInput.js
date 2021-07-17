//utility function used to listen user's keyboard inputs
export default function getKeyInput(code) {
    switch(code) {
        case "KeyS": return({
            actionType : "sKey",
            action : "down"
        });
        case "ArrowDown": return({
            actionType : "downArrow",
            action : "down"
        });
        case "KeyW": return({
            actionType : "wKey",
            action : "up"
        });
        case "ArrowUp": return({
            actionType : "upArrow",
            action : "up"
        });
        case "KeyA": return({
            actionType : "aKey",
            action : "left"
        });
        case "ArrowLeft": return({
            actionType : "leftArrow",
            action : "left"
        });
        case "KeyD": return({
            actionType : "dKey",
            action : "right"
        });
        case "ArrowRight": return({
            actionType : "rightArrow",
            action : "right"
        });
        case "KeyQ": return({
            actionType : "leftUp",
            action : "leftUp"
        });
        case "KeyE": return({
            actionType : "rightUp",
            action : "rightUp"
        });
        case "KeyZ": return({
            actionType : "leftDown",
            action : "leftDown"
        });
        case "KeyC": return({
            actionType : "rightDown",
            action : "rightDown"
        });
        case "Space" : return({
            actionType: "space",
            action : "fire"
        });
        default:
            return({
                actionType : "null",
                action : "null"
            })
      }
}
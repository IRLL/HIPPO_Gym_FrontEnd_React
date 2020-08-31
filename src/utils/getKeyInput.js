//utility function used to listen user's keyboard inputs
function getKeyInput(code) {
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
        default:
            break
      }
}

export default getKeyInput;

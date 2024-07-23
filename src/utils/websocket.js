
import {RateLimitedMouse} from './mouse.js'
function handleWSMessage( event, store ){

    const message = JSON.parse(event);

    if (message.data.mouseStatus != null) {
      store.mouseStatus = message.data.mouseStatus;
    }
    if (message.data.keyboardStatus != null) {
      store.keyboardStatus = message.data.keyboardStatus;
    }
    if(message.data.hidStatus != null){
      if( message.data.hidStatus.absolute != store.absoluteMode){
        store.absoluteMode = message.data.hidStatus.absolute;
        RateLimitedMouse.setMode(store.absoluteMode);
      }
      
      store.hidEnable = message.data.hidStatus.enable;
    }
}
export {handleWSMessage};
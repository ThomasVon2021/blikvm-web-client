
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
    if( message.data.pong != null){
      let timestamp=new Date().getTime();
      let delay = (timestamp - message.data.pong)/2;
      store.LatencyMS = Math.round(delay*100)/100;
    }
    if( message.data.systemInfo != null){
      store.cpuLoad = message.data.systemInfo.cpuLoad;
      store.uptime = message.data.systemInfo.uptime;
      store.temperature = message.data.systemInfo.temperature;
    }
}

function sendPing(ws){
  let timestamp=new Date().getTime();
  ws.send(JSON.stringify({ping:timestamp}));
}

export {handleWSMessage, sendPing};

/*****************************************************************************
#                                                                            #
#    blikvm                                                                  #
#                                                                            #
#    Copyright (C) 2021-present     blicube <info@blicube.com>               #
#                                                                            #
#    This program is free software: you can redistribute it and/or modify    #
#    it under the terms of the GNU General Public License as published by    #
#    the Free Software Foundation, either version 3 of the License, or       #
#    (at your option) any later version.                                     #
#                                                                            #
#    This program is distributed in the hope that it will be useful,         #
#    but WITHOUT ANY WARRANTY; without even the implied warranty of          #
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the           #
#    GNU General Public License for more details.                            #
#                                                                            #
#    You should have received a copy of the GNU General Public License       #
#    along with this program.  If not, see <https://www.gnu.org/licenses/>.  #
#                                                                            #
*****************************************************************************/

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
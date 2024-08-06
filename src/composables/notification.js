
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
import { useNotificationStore } from '@/stores/notificationStore';

export function useNotification() {
  const notificationStore = useNotificationStore();

  function createNotificationJSON(clientId, messageType, icon, message, target, text) {
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC' });
    const data = `{
          "type": "notification",
          "clientId": "${clientId}",
          "contents": [
            {
              "title": "Storage ()",
              "items": [
                {
                  "timestamp": "${timestamp} UTC",
                  "messageType": "${messageType}",
                  "icon": "${icon}",
                  "target": "${target}",
                  "message": "${message}",
                  "text": "${text}"
                }
              ]
            }
          ]
    }`;

    return data;
  }

  function createAndAddNotification(uuid, messageType, icon, message, target, text) {
    const data = createNotificationJSON(uuid, messageType, icon, message, target, text);

    try {
      const obj = JSON.parse(data);
      console.log(obj.contents[0])
      notificationStore.addNotification(obj.contents[0]);
    } catch (error) {
      console.error('Error adding notification to store:', error);
    }
  }

  return {
    createAndAddNotification
  };
}
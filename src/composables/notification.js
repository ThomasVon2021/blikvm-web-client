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
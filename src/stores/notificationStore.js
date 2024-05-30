// notificationStore.js
import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [], // Array to store the notifications
  }),

  getters: {
    // Getter to retrieve all notifications
    allNotifications: (state) => state.notifications,
  },

  actions: {
    // Action to show a snackbar notification
    addNotification(notification) {
      // Action to add a notification to the arrays
      this.notifications.push(notification);
    },

    // TODO don't think we need this
    // Action to remove a notification from the array
    removeSnackbar(notification) {
      const index = this.notifications.indexOf(notification);
      if (index !== -1) {
        // Removing the last item from the array
        this.notifications.value.pop();
      }
      //  this.notifications.splice(index, 1);
    }
  }
});
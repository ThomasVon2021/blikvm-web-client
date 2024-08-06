
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
// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isKeyboardOpen: false,
  }),
  actions: {
    switchKeyboardStatus() {
      this.isKeyboardOpen = !this.isKeyboardOpen;
    },
  },
})

// Utilities
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    isKeyboardOpen: false,
    videoMode: "mjpeg",
    username: "admin",
    mouseStatus: false,
    hidEnable: true,
    absoluteMode: true,
    keyboardStatus: false,
    delayMS: 0
  }),
  actions: {
    switchKeyboardStatus() {
      this.isKeyboardOpen = !this.isKeyboardOpen;
    },
  },
})

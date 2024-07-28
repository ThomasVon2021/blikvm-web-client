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
    deviceVersion: "BliKVM",
    deviceType: "KVM-over-IP",
    manufacturer: "BliCube LLC",
    LatencyMS: 0,
    videoServerPort: 10004,
    resolutionWidth: 0,
    resolutionHeight: 0,
    capturedFps: 0,
    queuedFps: 0,
    cpuLoad: 0,
    uptime: '0',
    temperature: 0
  }),
  actions: {
    switchKeyboardStatus() {
      this.isKeyboardOpen = !this.isKeyboardOpen;
    },
  },
})

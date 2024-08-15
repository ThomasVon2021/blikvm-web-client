<!--
****************************************************************************
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
****************************************************************************
-->
<template>
  <div id="kvm" class="kvm-area" @click="requestPointerLock">
    <img id="image" draggable="false" v-if="videoMode === 'mjpeg'" :src="mjpegUrl" @mousemove="handleMouseMove"
      @mousedown="handleMouseDown" @mouseup="handleMouseUp" @wheel="handleWheel" @contextmenu="handleContextMenu" />
    <video draggable="false" v-else id="webrtc-output" autoplay playsinline muted @mousemove="handleMouseMove"
      @mousedown="handleMouseDown" @mouseup="handleMouseUp" @wheel="handleWheel"
      @contextmenu="handleContextMenu"></video>

    <TabKeyboard v-if="store.isKeyboardOpen" :input="inputKey" @onKeyPress="handleKeyPress"
      @onKeyReleased="handleKeyReleased" />

    <div v-if="ocrSelection" class="selection-overlay">
      <div class="selection-box" :style="selectionStyle"></div>
    </div>

    <v-dialog v-model="ocrDialog">
      <v-card>
        <v-card-text>
          "Are you sure to perform OCR recognition. This will take several tens of seconds."
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn color="primary" block @click="ocrRecognition">
                OK
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="error" block @click="ocrDialog = false">
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="ocrTextFlag">
      <v-card>
        <v-card-text>
          {{ ocrText }}
        </v-card-text>
        <v-card-actions>
          <v-row>
            <v-col cols="6">
              <v-btn color="primary" block @click="ocrTextFlag = false" class="copy-btn">
                copy
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn color="error" block @click="ocrTextFlag = false">
                Cancel
              </v-btn>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { RateLimitedMouse } from '../utils/mouse.js';
import { keytoCode } from '../utils/virtualKeyboard.js';
import Config from '@/config.js';
import { useAppStore } from '@/stores/stores';
import Janus from "@/utils/janus.js";
import adapter from 'webrtc-adapter';
import { storeToRefs } from 'pinia';
import { handleWSMessage, sendPing } from '@/utils/websocket.js';
import http from '@/utils/http.js';
import ClipboardJS from 'clipboard';

const store = useAppStore();
const { videoMode, absoluteMode, videoServerPort, ocrSelection } = storeToRefs(store);
let inputKey = ref('');
const janus = ref(null);
const uStreamerPluginHandle = ref(null);
let ocrStartX = 0;
let ocrStartY = 0;
let isSelecting = false;
const selection = ref({ x: 0, y: 0, width: 0, height: 0 });
const realSelection = ref({ left: 0, right: 0, width: 0, height: 0 });
const ocrDialog = ref(false);
const ocrText = ref('');
const ocrTextFlag = ref(false);

const mjpegUrl = ref(`http://${Config.host_ip}:${videoServerPort.value}/stream`);

const ws = new WebSocket(`ws://${Config.host_ip}:${Config.host_port}/wss`);

ws.addEventListener('open', () => {
  console.log('WebSocket connection established');
});

ws.addEventListener('message', (event) => {
  handleWSMessage(event.data, store);
});

ws.addEventListener('close', () => {
  console.log('WebSocket connection closed');
});

ws.addEventListener('error', (error) => {
  console.error('WebSocket error:', error);
});

const handleKeyPress = (button) => {
  const keyCode = keytoCode(button);
  console.log("pressed keyCode:", keyCode);
  if (!pressedKeys.value.includes(keyCode)) {
    pressedKeys.value.push(keyCode);
  }
};

const handleKeyReleased = (button) => {
  const keyCode = keytoCode(button);
  console.log("release keyCode:", keyCode);
  const index = pressedKeys.value.indexOf(keyCode);
  if (index > -1) {
    pressedKeys.value.splice(index, 1);
  } else {
    console.error("Key not found in pressedKeys:", keyCode);
  }
};

const selectionStyle = computed(() => ({
  position: 'absolute',
  border: '2px dashed #007bff',
  backgroundColor: 'rgba(0, 123, 255, 0.1)',
  left: `${selection.value.x}px`,
  top: `${selection.value.y}px`,
  width: `${selection.value.width}px`,
  height: `${selection.value.height}px`
}));


let rateLimitedMouse = null;

const handleMouseMove = (event) => {
  event.preventDefault();

  if (ocrSelection.value === true && isSelecting === true) {
    const kvmElement = document.getElementById('kvm');
    if (!kvmElement) return;
    const rect = kvmElement.getBoundingClientRect();
    const x = Math.min(event.clientX - rect.left, ocrStartX);
    const y = Math.min(event.clientY - rect.top, ocrStartY);
    const width = Math.abs(event.clientX - rect.left - ocrStartX);
    const height = Math.abs(event.clientY - rect.top - ocrStartY);
    const videoWidth = rect.right - rect.left;
    const videoHeight = rect.bottom - rect.top;
    realSelection.width = store.resolutionWidth * width / videoWidth;
    realSelection.height = store.resolutionHeight * height / videoHeight;

    selection.value = { x, y, width, height };
    return;
  }

  if (rateLimitedMouse != null) {
    rateLimitedMouse.onMouseMove(event);
  }

};

const handleMouseDown = (event) => {
  event.preventDefault();

  if (ocrSelection.value === true) {
    const kvmElement = document.getElementById('kvm');
    if (!kvmElement || !ocrSelection.value) return;

    // Get the position within the kvm element
    const rect = kvmElement.getBoundingClientRect();
    const kvmLeft = rect.left;
    const kvmTop = rect.top;

    ocrStartX = event.clientX - kvmLeft;
    ocrStartY = event.clientY - kvmTop;
    const width = rect.right - rect.left;
    const height = rect.bottom - rect.top;
    realSelection.left = store.resolutionWidth * ocrStartX / width;
    realSelection.top = store.resolutionHeight * ocrStartY / height;
    isSelecting = true;

    selection.value = { x: ocrStartX, y: ocrStartY, width: 0, height: 0 };
    return;
  }

  if (rateLimitedMouse != null) {
    rateLimitedMouse.onMouseDown(event);
  }
};

const handleMouseUp = (event) => {
  if (ocrSelection.value === true && isSelecting === true) {
    isSelecting = false;
    ocrSelection.value = false;
    selection.value = { x: 0, y: 0, width: 0, height: 0 };
    ocrDialog.value = true;
    return;
  }
  if (rateLimitedMouse != null) {
    rateLimitedMouse.onMouseUp(event);
  }
};

const handleWheel = (event) => {
  event.preventDefault();
  if (rateLimitedMouse != null) {
    rateLimitedMouse.onWheel(event);
  }
};

const handleContextMenu = (event) => {
  event.preventDefault();
};

const pressedKeys = ref([]);

const handleKeyDown = (event) => {
  event.preventDefault();
  const code = event.code;
  if (!pressedKeys.value.includes(code)) {
    inputKey.value = code;
    pressedKeys.value.push(code);
  }
  console.log("down: code:", code, "pressedKeys:", pressedKeys.value);
};

const handleKeyUp = (event) => {
  event.preventDefault();
  const code = event.code;
  const index = pressedKeys.value.indexOf(code);
  if (index > -1) {
    pressedKeys.value.splice(index, 1);
  } else {
    console.error("Key not found in pressedKeys:", code);
  }
  // console.log("up: code:", code, "pressedKeys:", pressedKeys.value);
};

watch(pressedKeys.value, (newVal) => {
  const obj = { k: newVal };
  ws.send(JSON.stringify(obj));
});

watch(videoMode, (newVal) => {
  console.log("videoMode:", newVal);
  if (newVal === 'h264') {
    initVideo();
  }
});

const initVideo = () => {
  const desp = { adapter };
  Janus.init({
    debug: true,
    dependencies: Janus.useDefaultDependencies(desp),
  });

  janus.value = new Janus({
    server: `ws://${Config.host_ip}:8188/`,
    success: attachUStreamerPlugin,
    error: console.error,
  });
};

const attachUStreamerPlugin = () => {
  console.log('attach ustreamer plugin');
  janus.value.attach({
    plugin: "janus.plugin.ustreamer",
    success: (pluginHandle) => {
      console.log('attach ustreamer plugin success');
      uStreamerPluginHandle.value = pluginHandle;
      uStreamerPluginHandle.value.send({ message: { request: "watch" } });
    },
    error: console.error,
    onmessage: (msg, jsepOffer) => {
      if (msg.error_code === 503) {
        console.log('attach ustreamer error code 503');
        uStreamerPluginHandle.value.send({ message: { request: "watch" } });
        return;
      }
      if (jsepOffer) {
        console.log('attach ustreamer jsepoffered');
        uStreamerPluginHandle.value.createAnswer({
          jsep: jsepOffer,
          media: { audioSend: false, videoSend: false },
          success: (jsepAnswer) => {
            console.log('attach ustreamer jsepanswered');
            uStreamerPluginHandle.value.send({
              message: { request: "start" },
              jsep: jsepAnswer,
            });
            onVideoLoaded();
          },
          error: console.error,
        });
      }
    },
    onremotetrack: (mediaStreamTrack, mediaId, isAdded) => {
      console.log('attach ustreamer remote track received');
      if (isAdded) {
        console.log('attach ustreamer rt added');
        const videoElement = document.getElementById("webrtc-output");
        const stream = new MediaStream();
        stream.addTrack(mediaStreamTrack.clone());
        videoElement.srcObject = stream;
      }
    },
  });
};

const onVideoLoaded = () => {
  //
};

const requestPointerLock = () => {
  const element = document.getElementById('kvm');
  if (absoluteMode.value === false && element.requestPointerLock) {
    element.requestPointerLock();
  }
};

const handlePointerLockChange = () => {
  if (document.pointerLockElement === document.getElementById('kvm')) {
    console.log('Pointer is locked');
  } else {
    console.log('Pointer is unlocked');
  }
};

const handlePointerLockError = () => {
  console.error('Error while locking pointer');
};

const getVideoStatus = async () => {
  const response = await http.post('/video/state');
  if (response.status === 200 && response.data.code === 0) {
    store.resolutionWidth = response.data.data.width;
    store.resolutionHeight = response.data.data.height;
    store.capturedFps = response.data.data.capturedFps;
    store.queuedFps = response.data.data.capturedFps;
  } else {
    console.log('get video state error');
  }
};

async function ocrRecognition() {
  try {
    ocrDialog.value = false;
    store.startOcr = true;
    const response = await http.post('/ocr', {
      lang: store.ocrLang,
      rect: {
        left: realSelection.left,
        top: realSelection.top,
        width: realSelection.width,
        height: realSelection.height
      }
    },
      { timeout: 60000 }
    );
    store.startOcr = false;
    if (response.status === 200) {
      const data = response.data.data; // 确保你从 response 中提取了正确的数据
      ocrText.value = data;
      // navigator.clipboard only support http
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(data);
        console.log("Text copied to clipboard:", data);
      } else {
        ocrTextFlag.value = true;
      }
    }
  } catch (error) {
    console.error('Error resetting stream:', error);
  }
}

let pingInterval = null;
onMounted(() => {
  const limitTime = 100;
  rateLimitedMouse = new RateLimitedMouse(limitTime, (mouseEvent) => {
    const obj = { m: mouseEvent };
    ws.send(JSON.stringify(obj));
  }, absoluteMode.value);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  document.addEventListener('pointerlockchange', handlePointerLockChange);
  document.addEventListener('pointerlockerror', handlePointerLockError);
  if (videoMode.value === 'h264') {
    initVideo();
  }
  document.addEventListener('mousemove', handleMouseMove);

  new ClipboardJS('.copy-btn', {
    text: () => ocrText.value
  }).on('success', () => {
    console.log('Text copied to clipboard.');
  }).on('error', () => {
    console.error('Failed to copy text.');
  });

});

onUnmounted(() => {
  clearInterval(pingInterval);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  document.removeEventListener('pointerlockchange', handlePointerLockChange);
  document.removeEventListener('pointerlockerror', handlePointerLockError);
  document.removeEventListener('mousemove', handleMouseMove);

});

</script>

<style scoped>
#kvm {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  widows: 100%;
}

img,
video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.kvm-area {
  position: relative;
  width: 100%;
  /* Adjust based on your layout */
  height: 300px;
  /* Adjust based on your layout */
  border: 1px solid #ddd;
  overflow: hidden;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  /* Make sure overlay does not block other elements */
}

.selection-box {
  border: 2px dashed #007bff;
  background-color: rgba(0, 123, 255, 0.1);
  /* Ensure the box is visible */
}

.selection-info {
  position: absolute;
  top: 0;
  left: 0;
  background-color: white;
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
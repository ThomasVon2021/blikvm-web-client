<template>
  <div id="kvm" @click="requestPointerLock">
    <img v-if="videoMode === 'mjpeg'" :src="mjpegUrl" @mousemove="handleMouseMove" @mousedown="handleMouseDown"
      @mouseup="handleMouseUp" @wheel="handleWheel" @contextmenu="handleContextMenu" />
    <video v-else id="webrtc-output" autoplay playsinline muted @mousemove="handleMouseMove"
      @mousedown="handleMouseDown" @mouseup="handleMouseUp" @wheel="handleWheel"
      @contextmenu="handleContextMenu"></video>

    <TabKeyboard v-if="store.isKeyboardOpen" :input="inputKey" @onKeyPress="handleKeyPress"
      @onKeyReleased="handleKeyReleased" />
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

const store = useAppStore();
const { videoMode, absoluteMode, videoServerPort} = storeToRefs(store);
let inputKey = ref('');
const janus = ref(null);
const uStreamerPluginHandle = ref(null);

const mjpegUrl = ref(`http://${Config.host_ip}:${videoServerPort.value}/stream`);

const ws = new WebSocket(`ws://${Config.host_ip}:10001`);

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



let rateLimitedMouse = null;

const handleMouseMove = (event) => {
  event.preventDefault();
  if (rateLimitedMouse != null) {
    rateLimitedMouse.onMouseMove(event);
  }

};

const handleMouseDown = (event) => {
  if (rateLimitedMouse != null) {
    rateLimitedMouse.onMouseDown(event);
  }
};

const handleMouseUp = (event) => {
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
  // 这里写你的视频加载完成后的处理逻辑
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

const getVideoStatus = async  () => {
  const response = await http.post('/video/state');
    if(response.status === 200 && response.data.code === 0){
        store.resolutionWidth = response.data.data.width;
        store.resolutionHeight = response.data.data.height;
        store.capturedFps = response.data.data.capturedFps;
        store.queuedFps = response.data.data.capturedFps;
    }else{
      console.log('get video state error');
    }
};

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
  pingInterval = setInterval(() => {
    sendPing(ws);
    getVideoStatus();
  }, 5000);


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

img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
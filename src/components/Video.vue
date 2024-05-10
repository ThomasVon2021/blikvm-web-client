<template>
    <div id="kvm">
        <img :src="mjpegUrl" @mousemove="handleMouseMove" @mousedown="handleMouseDown" @mouseup="handleMouseUp"
            @wheel="handleWheel" @contextmenu="handleContextMenu" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { RateLimitedMouse } from '../utils/mouse.js';
import Config from '@/config.ts';

const mjpegUrl = ref(`http://${Config.host_ip}:8008/stream`);

const ws = new WebSocket(`ws://${Config.host_ip}:10001`);

ws.addEventListener('open', () => {
    console.log('WebSocket connection established');
});

ws.addEventListener('message', (event) => {
    // console.log('Received message from server:', event.data);
});

ws.addEventListener('close', () => {
    console.log('WebSocket connection closed');
});

ws.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
});


let rateLimitedMouse = null;

const handleMouseMove = (event) => {
    event.preventDefault();
    rateLimitedMouse.onMouseMove(event);
};

const handleMouseDown = (event) => {
    rateLimitedMouse.onMouseDown(event);
};

const handleMouseUp = (event) => {
    rateLimitedMouse.onMouseUp(event);
};

const handleWheel = (event) => {
    event.preventDefault();
    rateLimitedMouse.onWheel(event);
};

const handleContextMenu = (event) => {
    event.preventDefault();
};

const pressedKeys = ref([]);

const handleKeyDown = (event) => {
    event.preventDefault();
    const code = event.code;
    if (!pressedKeys.value.includes(code)) {
        pressedKeys.value.push(code);
    }
    // console.log("down: code:", code, "pressedKeys:", pressedKeys.value);
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
    // console.log(JSON.stringify(obj));
    ws.send(JSON.stringify(obj));
});

onMounted(() => {
    const limitTime = 100;
    rateLimitedMouse = new RateLimitedMouse(limitTime, (mouseEvent) => {
        const obj = { m: mouseEvent };
        // console.log(JSON.stringify(obj));
        ws.send(JSON.stringify(obj));
    });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
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
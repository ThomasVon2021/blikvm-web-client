<template>
    <v-app-bar v-if="showAppBar" height="40" color="#54a4ff" app dark flat>
        <v-toolbar-title id="toolbar-title">BLIKVM</v-toolbar-title>
        <v-spacer></v-spacer>
        <div id="toolbar-btns">
            <TabNotification />
            <TabSwitch />
            <TabMSD />
            <TabVideo />
            <v-btn icon :class="{'active-toolbar-btn': keyboardStatus, 'inactive-toolbar-btn': !keyboardStatus}" size="30" @click="store.switchKeyboardStatus">
                <v-icon class="toolbar-icon">mdi-keyboard</v-icon>
                <v-tooltip activator="parent" location="bottom">Keyboard</v-tooltip>
            </v-btn>
            <TabMouse />
            <TabATX />
            <TabLanguage />
            <TabUser/>
            
            <v-btn icon @click="toggleFullScreen" class="toolbar-btn" size="30">
                <v-icon class="toolbar-icon">{{ isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
                <v-tooltip activator="parent" location="bottom">{{ isFullScreen ? 'FullScreen-Exit' : 'FullScreen'
                    }}</v-tooltip>
            </v-btn>
            
            <v-btn icon @click="hideAppBar()" class="toolbar-btn" size="30">
                <v-icon class="toolbar-icon">mdi-chevron-up</v-icon>
                <v-tooltip activator="parent" location="bottom">Hide</v-tooltip>
            </v-btn>
            
        </div>
    </v-app-bar>
    <v-icon id="drop-down-btn" v-if="!showAppBar" @click="expandAppBar()" color="primary">
        mdi-chevron-down
    </v-icon>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '@/stores/stores';
import { storeToRefs } from 'pinia';
import http from '@/utils/http.js';

const store = useAppStore();
const showAppBar = ref(true);
const isFullScreen = ref(false);
const { keyboardStatus } = storeToRefs(store);

const toggleFullScreen = () => {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
        isFullScreen.value = true;
    } else {
        cancelFullScreen.call(doc);
        isFullScreen.value = false;
    }
};

function hideAppBar() {
    showAppBar.value = false;
}

function expandAppBar() {
    showAppBar.value = true;
}

async function getDeviceVersion() {
  try {
    const response = await http.post('/device');
    
    if (response.status === 200 && response.data.code === 0) {
      store.deviceVersion = response.data.data.device;
      store.deviceType = response.data.data.deviceType;
      store.manufacturer = response.data.data.manufacturer;
    } else {
      console.log('Response error:', response);
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

onMounted(() => {
    getDeviceVersion();
});
</script>

<style>
#toolbar-title {
    font-size: 14px;
    font-weight: bold;
    color: white;
}

#toolbar-btns {
    display: flex;
}

.toolbar-btn {
    color: white;
    border: 2px solid white;
    border-radius: 50%;
    padding: 5px;
    margin-right: 15px;
    transition: color 0.3s ease;
}

.toolbar-btn:hover {
    color: #cccccc;
}

.toolbar-icon {
    font-size: 15px;
}

#drop-down-btn {
    position: fixed;
    top: 0;
    right: 0;
}

.active-toolbar-btn {
    color: rgb(52, 231, 8);
    border: 2px solid rgb(52, 231, 8);
    border-radius: 50%;
    padding: 5px;
    margin-right: 15px;
    transition: color 0.3s ease;
}

.inactive-toolbar-btn {
    color:red;
    border: 2px solid red;
    border-radius: 50%;
    padding: 5px;
    margin-right: 15px;
    transition: color 0.3s ease;
}
</style>
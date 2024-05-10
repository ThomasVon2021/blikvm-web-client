<template>
    <v-app-bar v-if="showAppBar" height="40" color="#54a4ff" app dark flat>
        <v-toolbar-title id="toolbar-title">BLIKVM</v-toolbar-title>
        <v-spacer></v-spacer>
        <div id="toolbar-btns">
            <v-btn icon class="toolbar-btn" size="30">
                <v-icon class="toolbar-icon">mdi-keyboard</v-icon>
                <v-tooltip activator="parent" location="bottom">Keyboard</v-tooltip>
            </v-btn>
            <v-btn icon class="toolbar-btn" size="30">
                <v-icon class="toolbar-icon">mdi-video</v-icon>
                <v-tooltip activator="parent" location="bottom">Video</v-tooltip>
            </v-btn>
            <Mouse />
            <ATX />
            <Language />
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

const showAppBar = ref(true);
const isFullScreen = ref(false);

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
</style>
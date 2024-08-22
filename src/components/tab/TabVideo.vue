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
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" @open="fetchVideoConfig">
    <template v-slot:activator="{ props }">
      <v-btn icon class="toolbar-btn" size="30" v-bind="props">
        <v-icon class="toolbar-icon">mdi-video</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ $t('tab.video.tip') }}</v-tooltip>
      </v-btn>
    </template>
    <UiParentCard :title="$t('tab.video.title')" @mouseenter.stop @mousemove.stop>
      <div class="d-flex align-center">
        <v-label class="font-weight-medium align-center">{{ $t('tab.video.resolution') }}: </v-label>
        <v-chip :color="imageCreateStateColor" class="ma-2">
          {{ resolutionWidth }} x {{ resolutionHeight }} {{ capturedFps }}Hz
        </v-chip>
      </div>

      <div class="d-flex align-center">
        <v-label class="font-weight-medium align-center">{{ $t('tab.video.mode') }}</v-label>
        <v-radio-group v-model="videoMode" inline class="ml-3 align-center">
          <v-radio label="mjpeg" color="primary" value="mjpeg"></v-radio>
          <v-radio label="h264" color="primary" value="h264"></v-radio>
        </v-radio-group>
      </div>

      <div class="d-flex ga-4 align-center flex-row">
        <v-label class="text-subtitlte-1">{{ $t('tab.video.fps') }}</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_fps" min="1" max="60" color="primary" step="1" hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_fps"></v-text-field>
          </template>
        </v-slider>
      </div>

      <div v-if="videoMode === 'mjpeg'" class="d-flex align-center">
        <v-label class="text-subtitlte-1">{{ $t('tab.video.quality') }}</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_mjpeg_quality" color="primary" step="10" show-ticks="always"
          hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_mjpeg_quality"></v-text-field>
          </template>
        </v-slider>
      </div>

      <div v-if="videoMode === 'h264'" class="d-flex align-center">
        <v-label class="text-subtitlte-1">{{ $t('tab.video.Mbps') }}</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_h264_mbps" min="0.1" max="10" color="primary" step="0.1"
          hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_h264_mbps" style="width: auto;"></v-text-field>
          </template>
        </v-slider>
      </div>

      <div v-if="videoMode === 'h264'" class="d-flex ga-4 align-center flex-row">
        <v-label class="text-subtitlte-1">{{ $t('tab.video.gop') }}</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_h264_gop" min="1" max="60" color="primary" step="1"
          hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_h264_gop"></v-text-field>
          </template>
        </v-slider>
      </div>

      <div class="d-flex ga-4 align-center flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height">
        
        <v-label class="text-subtitlte-1">{{ $t('tab.video.reset_take_effect') }}</v-label>
        <v-btn key="primary" color="primary" @click="resetStream">
          {{ $t('tab.video.reset_stream') }}
        </v-btn>

        <v-dialog v-model="resetDialog">
          <v-card>
            <v-card-text>
              {{ resetResultText }}
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="resetDialog = false">{{ $t('common.close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

    </UiParentCard>

  </v-menu>
</template>

<script setup>
import { ref } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import { useAppStore } from '@/stores/stores';
import { storeToRefs } from 'pinia';
import http from '@/utils/http.js';

const store = useAppStore();
const menu = ref(false);
const { videoMode, videoServerPort,resolutionWidth,resolutionHeight,capturedFps } = storeToRefs(store);
const slider_mjpeg_quality = ref(80);
const slider_fps = ref(25);
const slider_h264_mbps = ref(5);
const slider_h264_gop = ref(30); 
const resetDialog = ref(false);
const resetResultText = ref('');

watch(videoMode, (newMode) => {
  localStorage.setItem('videoMode', newMode);
});

async function fetchVideoConfig() {
  try {
    const response = await http.post('/video/config?action=get')
    if(response.status === 200 && response.data.code === 0){
      const data = response.data.data;
      slider_fps.value = data.fps;
      slider_mjpeg_quality.value = data.quality;
      slider_h264_mbps.value = data.kbps / 1000; // Convert to Mbps
      slider_h264_gop.value = data.gop;
      videoServerPort.value = data.port;
    }else{
      console.log("get video config error");
    }
}
  catch (error) {
    console.log(error);
  }
}

async function resetStream() {
  try {
    const response = await http.post('/video/config?action=set', {
      data: {
        port: videoServerPort.value,
        fps: slider_fps.value,
        quality: slider_mjpeg_quality.value,
        kbps: slider_h264_mbps.value * 1000, // Convert to kbps
        gop: slider_h264_gop.value
      }
    });
    console.log('Stream reset successful:', response.data);
    const stopResponse = await http.post('/video?action=stop');
    if(stopResponse.data.data.state === "STOPPED"){
      const startResponse = await http.post('/video?action=start');
      if(startResponse.data.data.state === "RUNNING"){
        resetResultText.value = "reset video success";
        resetDialog.value = true;
      }else{
        resetResultText.value = startResponse.data.msg;
        resetDialog.value = true;
      }
    }else{
      resetResultText.value = stopResponse.data.msg;
      resetDialog.value = true;
    }
  } catch (error) {
    console.error('Error resetting stream:', error);
  }
}

function cancel() {
  menu.value = false;
}

function save() {
  alert(`Absolute mode: ${model.value}, Enable tablet: ${tablet.value}`);
  menu.value = false;
}

onMounted(() => {
  const savedVideoMode = localStorage.getItem('videoMode');
  if (savedVideoMode) {
    videoMode.value = savedVideoMode;
  }
  fetchVideoConfig();
});

</script>

<style scoped>
.align-center {
  display: flex;
  align-items: center;
}
</style>
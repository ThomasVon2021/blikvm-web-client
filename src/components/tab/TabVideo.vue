<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn icon class="toolbar-btn" size="30" v-bind="props">
        <v-icon class="toolbar-icon">mdi-video</v-icon>
        <v-tooltip activator="parent" location="bottom">Mouse</v-tooltip>
      </v-btn>
    </template>
    <UiParentCard title="video setting">
    <div class="d-flex align-center">
    <v-label class="font-weight-medium align-center">video mode</v-label>
    <v-radio-group v-model="videoMode" inline class="ml-3 align-center">
      <v-radio label="mjpeg" color="primary" value="mjpeg"></v-radio>
      <v-radio label="h264" color="primary" value="h264"></v-radio>
    </v-radio-group>
  </div>

  <div class="d-flex ga-4 align-center flex-row">
        <v-label class="text-subtitlte-1">FPS</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_fps" min="1" max="60" color="primary" step="1" hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_fps"></v-text-field>
        </template>
        </v-slider>
      </div>

      <div v-if="videoMode === 'mjpeg'" class="d-flex align-center">
        <v-label class="text-subtitlte-1">Quality</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_mjpeg_quality" color="primary" step="10" show-ticks="always" hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_mjpeg_quality" ></v-text-field>
        </template>
        </v-slider>
      </div>

      <div v-if="videoMode === 'h264'" class="d-flex align-center">
        <v-label class="text-subtitlte-1">Mbps</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_h264_mbps" min="0.1" max="10" color="primary" step="0.1"  hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_h264_mbps" style="width: auto;"></v-text-field>
        </template>
        </v-slider>
      </div>

      <div v-if="videoMode === 'h264'" class="d-flex ga-4 align-center flex-row">
        <v-label class="text-subtitlte-1">gop</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="slider_h264_gop" min="1" max="60" color="primary" step="1" hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="slider_h264_gop"></v-text-field>
        </template>
        </v-slider>
      </div>

      <div class="d-flex ga-4 align-center flex-column flex-wrap flex-xl-nowrap flex-sm-row fill-height">
                <v-btn  key="primary" color="primary">
                  reset stream
                </v-btn>
      </div>

    </UiParentCard>

  </v-menu>
</template>

<script setup>
import { ref, shallowRef } from 'vue';

import BaseBreadcrumb from '@/components/shared/BaseBreadcrumb.vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import UiChildCard from '@/components/shared/UiChildCard.vue';
import { AppsIcon, CircleDotIcon, DragDropIcon, FolderIcon, ChevronUpIcon, ChevronDownIcon } from 'vue-tabler-icons';

const menu = ref(false);
const videoMode = ref('mjpeg');
const slider_mjpeg_quality = ref(80);
const slider_fps = ref(25);
const slider_h264_mbps = ref(5);
const slider_h264_gop = ref(30);


function cancel() {
  menu.value = false;
}

function save() {
  alert(`Absolute mode: ${model.value}, Enable tablet: ${tablet.value}`);
  menu.value = false;
}

</script>

<style scoped>
.align-center {
  display: flex;
  align-items: center;
}
</style>
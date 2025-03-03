
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
    <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
        <template v-slot:activator="{ props }">
            <v-btn icon :class="{'active-toolbar-btn': mouseStatus, 'inactive-toolbar-btn': !mouseStatus}" size="30" v-bind="props">
                <v-icon class="toolbar-icon">mdi-mouse</v-icon>
                <v-tooltip activator="parent" location="bottom">{{ $t('tab.mouse.tip') }}</v-tooltip>
            </v-btn>
        </template>
        <UiParentCard :title="$t('tab.mouse.title')" @mouseenter.stop @mousemove.stop>
            <div class="d-flex align-center">
                <v-label class="font-weight-medium align-center"> {{ $t('tab.mouse.mode') }} </v-label>
                <v-radio-group v-model="absoluteMode" inline class="ml-3 align-center" @change="changeMode">
                    <v-radio :label="$t('tab.mouse.absolute')" color="primary" :value='true'></v-radio>
                    <v-radio :label="$t('tab.mouse.relative')" color="primary" :value='false'></v-radio>
                </v-radio-group>
            </div>

            <div v-if="absoluteMode === false" class="d-flex align-center">
                <v-label class="text-subtitlte-1"> {{ $t('tab.mouse.sensitivity') }} </v-label>
                <v-slider class="flex-grow-1 mx-3" v-model="slider_sensitivity" color="primary" min="0.1" max="1" step="0.1"
                    show-ticks="always" hide-details @update:modelValue="handleSensitivityChange">
                    <template v-slot:append>
                        <v-text-field variant="plain" v-model="slider_sensitivity"></v-text-field>
                    </template>
                </v-slider>
            </div>

            <div class="d-flex ga-4 align-center flex-row">
            <v-label class="text-subtitlte-1">{{ $t('tab.mouse.polling') }} ms</v-label>
            <v-slider class="flex-grow-1 mx-3" v-model="sliderMousePolling" min="10" max="100" color="primary" step="10" hide-details @update:modelValue="updateSliderMousePolling">
              <template v-slot:append>
                <v-text-field variant="plain" v-model="sliderMousePolling" class="polling-text-field">
                </v-text-field>

              </template>
            </v-slider>
            </div>

            <div class="d-flex align-center switch-container">
                <v-label class="font-weight-medium mr-3">
                  {{ hidEnable ? $t('tab.mouse.soft_hid_enable') : $t('tab.mouse.soft_hid_disable') }}
                </v-label>
                <v-switch color="primary" v-model="hidEnable" hide-details @change="toggleHid"></v-switch>
            </div>
          
            <div class="d-flex align-center switch-container">
                <v-label class="font-weight-medium mr-3">
                  {{ mouseJiggler ? $t('tab.mouse.jiggler_enable') : $t('tab.mouse.jiggler_disable') }}
                </v-label>
                <v-switch color="primary" v-model="mouseJiggler" hide-details @change="toggleJiggler"></v-switch>
            </div>

            <v-dialog v-model="changeModeReboot">
            <v-card>
              <v-card-text>
                {{ $t('tab.mouse.change_mode') }}
              </v-card-text>
              <v-card-actions>
                <v-btn color="success" variant="text" @click="reboot">{{ $t('button.reboot') }}</v-btn>
                <v-btn color="primary" variant="text" @click="changeModeReboot = false">{{ $t('button.later') }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

        </UiParentCard>
    </v-menu>
</template>

<script setup>
import { ref } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import http from '@/utils/http.js';
import { useAppStore } from '@/stores/stores';
import { storeToRefs } from 'pinia';
import { RateLimitedMouse } from '../../utils/mouse.js';

const menu = ref(false);
const slider_sensitivity = ref(1.0);
const store = useAppStore();
const { mouseStatus, hidEnable, absoluteMode, mouseJiggler, sliderMousePolling } = storeToRefs(store);
const updateSliderMousePolling = (value) => {
  store.updateSliderMousePolling(value);
};
const changeModeReboot = ref(false);

async function reboot(){
    try {
    const response = await http.post('/reboot');
    if( response.status === 200 && response.data.code === 0){
        console.log(`reboot success`);
    }else{
        console.log(`reboot error`);
    }
  } catch (error) {
    console.error('reboot error:', error);
  }
}

async function toggleHid(){
  try {
    const actionValue = hidEnable.value ? 'enable' : 'disable';
    const response = await http.post(`/hid?action=${actionValue}`);
    if( response.status === 200 && response.data.code === 0){
        console.log(`${actionValue} success`);
    }else{
        console.log(`${actionValue} error`);
    }
  } catch (error) {
    console.error('Error during atx button trigger:', error);
  }
}

async function toggleJiggler(){
  try {
    const actionValue = mouseJiggler.value ? 'true' : 'false';
    const response = await http.post(`/mouse/jiggler?action=${actionValue}`);
    if( response.status === 200 && response.data.code === 0){
        console.log(`mouse jiggler ${actionValue} success`);
    }else{
        console.log(`mouse jiggler ${actionValue} error`);
    }
  } catch (error) {
    console.error('Error during mouse jiggler trigger:', error);
  }
}

async function changeMode(){
  try {
    const response = await http.post(`/hid/mode?absolute=${absoluteMode.value}`);
    if( response.status === 200 && response.data.code === 0){
        RateLimitedMouse.setMode(absoluteMode.value);
        console.log(`change mode to Absolute:${absoluteMode.value} success`);
        changeModeReboot.value = true;
    }else{
        console.log(`change mode to Absolute:${absoluteMode.value} error`);
    }
  } catch (error) {
    console.error('Error during atx button trigger:', error);
  }
}

function handleSensitivityChange(){
  RateLimitedMouse.setSensitivity(slider_sensitivity.value);
}

</script>

<style scoped>
.align-center {
    display: flex;
    align-items: center;
}

.ml-3 {
    margin-left: 1rem;
}

.mr-3 {
    margin-right: 1rem;
}

.switch-container {
    width: 100%;
    max-width: 500px;
    /* 可以根据需要调整 */
}

.active-toolbar-btn {
    color: rgb(52, 231, 8);
    border: 2px solid rgb(52, 231, 8);
    border-radius: 50%;
    padding: 5px;
    margin-right: 15px;
    transition: color 0.3s ease;
    animation: blink-animation 1s infinite; 
}

.inactive-toolbar-btn {
    color:red;
    border: 2px solid red;
    border-radius: 50%;
    padding: 5px;
    margin-right: 15px;
    transition: color 0.3s ease;
}

@keyframes blink-animation {
    0% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        opacity: 1;
    }
}

.polling-text-field {
  width: 30px; 
}
</style>
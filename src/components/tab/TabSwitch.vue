<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom" @open="fetchSwitchConfig">
    <template v-slot:activator="{ props }">
      <v-btn icon class="toolbar-btn" size="30" v-bind="props">
        <v-icon class="toolbar-icon">mdi-video-switch</v-icon>
        <v-tooltip activator="parent" location="bottom">switch</v-tooltip>
      </v-btn>
    </template>
    <UiParentCard title="kvm switch">

      <v-row>

        <v-col cols="12" sm="6" md="4" class="text-center align-center">
          <v-switch color="primary" v-model="switchEnabled" :label="switchLabel" hide-details
            @change="toggleSwitch"></v-switch>
          <v-dialog v-model="availableSwitch">
            <v-card>
              <v-card-text>
                {{ switchEnabledResultText }}
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" block @click="availableSwitch = false">Close</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-autocomplete label="Choose a model" class="ml-3" v-model="switchValue" :items="switchModles"
            color="primary" variant="filled" hide-details @update:modelValue="changeSwitchModle"></v-autocomplete>
        </v-col>

        <v-col cols="12" sm="6" md="4">
          <v-autocomplete label="Choose a Channel" class="ml-3 flex-grow-1" v-model="channelValue" :items="channelItems"
            color="primary" variant="filled" hide-details></v-autocomplete>
        </v-col>

        <v-col cols="12">
          <div class="text-center mt-6">
            <v-dialog v-model="dialog" persistent @keydown.stop @keyup.stop>
              <template v-slot:activator="{ props }">
                <v-btn color="primary" v-bind="props"> Switch Config </v-btn>
              </template>
              <v-card style="height: 300px" class="overflow-auto">
                <v-card-title class="pa-5">
                  <span class="text-h5">Switch Config</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field v-model="devicePath" label="device path" required rounded="0"> </v-text-field>
                      </v-col>

                      <v-col v-for="(item, index) in channelItems" :key="index" cols="12" sm="6" md="4">
                        <v-text-field v-model="channelItems[index]" :label="`Channel ${index + 1}`" required
                          rounded="0"></v-text-field>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" variant="text" @click="close"> Close </v-btn>
                  <v-btn color="success" variant="text" @click="save"> Save </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </div>
        </v-col>

      </v-row>
    </UiParentCard>

  </v-menu>
</template>

<script setup>
import { ref } from 'vue';

import UiParentCard from '@/components/shared/UiParentCard.vue';
import http from '@/utils/http.js';

const menu = ref(false);

const switchModles = ref([
  'None',
  'BliKVM_switch_v1',
  'BliKVM_switch_v2'
]);

const switchValue = ref(['None']);
const channelValue = ref('None');
const devicePath = ref('/dev/ttyUSB0');
const dialog = ref(false);
const switchEnabled = ref(false);
const availableSwitch = ref(false);
const switchEnabledResultText = ref("");
const channelItems = ref();

const switchLabel = computed(() => (switchEnabled.value ? 'enable' : 'disable'));


async function toggleSwitch() {
  try {
    if (switchValue.value === 'None') {
      availableSwitch.value = true;
      switchEnabledResultText.value = 'No select module!';
    } else {
      const response = await http.post(`/switch/enable?action=${switchEnabled.value}&module=${switchValue.value}`);
      if (response.data.code != 0) {
        switchEnabled.value = false;
        availableSwitch.value = true;
        switchEnabledResultText.value = response.data.msg;
      }
    }

  } catch (error) {
    console.log(error);
  }
}

async function changeSwitchModle() {
  try {
    if (switchEnabled.value === true) {

    }
    const response = await http.post(`/switch/setmodule?module=${switchValue.value}`);
    if (response.data.code === 0) {
      console.log('set module success');
    }
    await fetchSwitchConfig();
  } catch (error) {
    console.log(error);
  }
}

function close() {
  dialog.value = false;
}

async function save() {
  const requestPathBody = {
    devicePath: devicePath.value
  };
  const pathResponse = await http.post('/switch/setpath', requestPathBody);

  if (pathResponse.status === 200) {
    console.log('switch set devicepath successfully:', pathResponse.data);
  } else {
    console.error('Failed to set switch devicepath:', pathResponse);
  }

  const requestLableBody = {
    module: switchValue.value,
    channelLable: channelItems.value
  };
  const lableResponse = await http.post('/switch/setlable', requestLableBody);
  if (lableResponse.status === 200) {
    console.log('switch set lable successfully:', lableResponse.data);
  } else {
    console.error('Failed to set switch lable:', lableResponse);
  }

  dialog.value = false;
}

async function fetchSwitchConfig() {
  try {
    console.log("switchValue.value1:", switchValue.value);
    const response = await http.post(`/switch/state?module=${switchValue.value}`);
    if (response.data.code === 0) {
      console.log('get switch state successfully:', response.data);
      switchEnabled.value = response.data.data.enabled;
      switchValue.value = response.data.data.module;
      channelItems.value = response.data.data.channelLable;
      channelValue.value = response.data.data.channel;
      devicePath.value = response.data.data.devicePath;
    } else {
      console.error('Failed to get switch state:', response.data);
    }
  } catch (error) {
    console.log(error);
  }
}

async function fetchSwitchList() {
  try {
    const response = await http.post('/switch/getlist');
    if (response.status === 200) {
      if (response.data.code === 0) {
        console.log('get switch list successfully:', response.data);
        switchModles.value = response.data.data.list;
        switchValue.value = response.data.data.module;
      }
    }
    else {
      console.error('Failed to set switch devicepath:', response);
    }
  } catch (error) {
    console.log(error);
  }
}

onMounted(async () => {
  await fetchSwitchList();
  await fetchSwitchConfig();
});

</script>

<style scoped>
.align-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
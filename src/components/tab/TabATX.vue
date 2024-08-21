
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
      <v-btn icon class="toolbar-btn" size="30" v-bind="props">
        <v-icon class="toolbar-icon">mdi-power</v-icon>
        <v-tooltip activator="parent" location="bottom">{{ $t('tab.atx.tip') }} </v-tooltip>
      </v-btn>
    </template>

    <UiParentCard  :title="$t('tab.atx.title')" @mouseenter.stop @mousemove.stop @keydown.stop @keypress.stop @keyup.stop>
      <v-row>
        <v-col cols="12" sm="6" md="6" class="text-center align-center" >
          <v-btn @click="triggerPowerButton('power')" append-icon="mdi-power" color="primary">
            {{ $t('tab.atx.atx_poweron') }} 
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="6" class="text-center align-center" >
          <v-btn @click="triggerPowerButton('power')" append-icon="mdi-power-sleep" color="primary">
            {{ $t('tab.atx.atx_poweroff') }} 
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="6" class="text-center align-center" >
          <v-btn  @click="triggerPowerButton('forcepower')" append-icon="mdi-power-off" color="primary">
            {{ $t('tab.atx.atx_forceoff') }} 
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="6" class="text-center align-center" >
          <v-btn @click="triggerPowerButton('reboot')" append-icon="mdi-refresh" color="primary">
            {{ $t('tab.atx.atx_reset') }} 
          </v-btn>
        </v-col>
        <v-col cols="12" sm="6" md="6" class="text-center align-center" >
          <v-text-field v-model="macAddress" label="MAC Address" outlined></v-text-field>
        </v-col>
        <v-col cols="12" sm="6" md="6" class="text-center align-center" >
          <v-btn color="primary" @click="wakeOnLan">{{ $t('tab.atx.wake_on_lan') }} </v-btn>
        </v-col>
      </v-row>
    </UiParentCard>

  </v-menu>
</template>

<script setup>
import http from '@/utils/http.js';
import UiParentCard from '@/components/shared/UiParentCard.vue';

const menu = ref(false);
const macAddress = ref('');

const triggerPowerButton = async (button) => {
  try {
    const response = await http.post(`/atx/click?button=${button}`);
    console.log(response.data)
    // return response.data;
  } catch (error) {
    console.error('Error during atx button trigger:', error);
  }
};

const wakeOnLan = async () => {
  try {
    const response = await http.post(`/wol?mac=${macAddress.value}`);
    console.log(response.data)
    // return response.data;
  } catch (error) {
    console.error('Error during wake on lan:', error);
  }
};

</script>

<style scoped>
.align-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
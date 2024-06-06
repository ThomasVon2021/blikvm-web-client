<template>
  <v-menu>
    <template v-slot:activator="{ props: menu }">
      <v-tooltip location="top">
        <template v-slot:activator="{ props: tooltip }">
          <v-btn icon class="toolbar-btn" size="30" v-bind="mergeProps(menu, tooltip)">
            <v-icon class="toolbar-icon">mdi-power</v-icon>
          </v-btn>
        </template>
        <span>ATX</span>
      </v-tooltip>
    </template>
    <v-list class="dropdown-menu">
      <v-list-item @click="powerOn()">
        <v-list-item-title>{{ $t('menu.atx_poweron') }} <v-icon>mdi-power</v-icon>
        </v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>{{ $t('menu.atx_poweroff') }} <v-icon>mdi-power-sleep</v-icon></v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>{{ $t('menu.atx_forceoff') }} <v-icon>mdi-power-off</v-icon></v-list-item-title>
      </v-list-item>
      <v-list-item>
        <v-list-item-title>{{ $t('menu.atx_reset') }} <v-icon>mdi-refresh</v-icon></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { mergeProps } from 'vue'
import http from '../utils/http.js';

const triggerPowerButton = async (button) => {
  try {
    const response = await http.post(`/atx/click?button=${button}`);
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error during atx button trigger:', error);
  }
};

async function powerOn() {
  try {
    const result = await triggerPowerButton('power');
    console.log('Power toggled:', result);
    alert(JSON.stringify(result));
  } catch (error) {
    console.error('Failed to toggle power:', error);
  }
}

</script>

<style scoped>
.dropdown-menu {
  background-color: #fff;
  border: 2px solid white;
  border-radius: 5px;
}

.dropdown-menu .v-list-item {
  color: #333;
  cursor: pointer;
}

.dropdown-menu .v-list-item:hover {
  background-color: #f0f0f0;
}
</style>
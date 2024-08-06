
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
  <v-menu :close-on-content-click="false" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn icon class="toolbar-btn" size="30" v-bind="props">
        <v-icon class="toolbar-icon">mdi-content-copy</v-icon>
        <v-tooltip activator="parent" location="bottom">Text</v-tooltip>
      </v-btn>
    </template>

    <UiParentCard title="copy and paste">
        
        <v-row>
        <v-textarea
                filled
                auto-grow
                label="Paste to target"
                variant="outlined"
                rows="4"
                color="primary"
                v-model="pasteValue"
        ></v-textarea>
      </v-row>
      <v-row align="center">
        <v-col cols="auto">
          <v-btn color="primary" @click="pasteToTarget">
            Paste
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-label class="font-weight-medium align-center">Only support eng</v-label>
        </v-col>
      </v-row>
      <v-row>
        <v-label class="font-weight-medium align-center">Copy by text recognition</v-label>
        <v-progress-circular :indeterminate="startOcr" color="success"> </v-progress-circular>
      </v-row>
      <v-row align="center">
        <v-col cols="auto">
          <v-btn color="primary" @click="startSelection">
            Select area
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <span> for </span>
        </v-col>
        <v-col cols="auto">
          <v-autocomplete class="ml-3 flex-grow-1" v-model="langType" :items="languageOptions" color="primary"
            variant="filled" hide-details></v-autocomplete>
        </v-col>
        <v-col cols="auto">
          <span>text recognition</span>
        </v-col>
      </v-row>
    </UiParentCard>
  </v-menu>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/stores';
import { storeToRefs } from 'pinia';
import http from '@/utils/http.js';

const langType = ref('eng');
const languageOptions = ref(['eng', 'chi_sim', 'chi_tra']);
const store = useAppStore();
const { startOcr } = storeToRefs(store);
const pasteValue = ref("");


function startSelection() {
  store.ocrSelection = true;
  store.ocrLang = langType.value;
}

async function pasteToTarget(){
  try {

    const response = await http.post('/hid/paste', pasteValue.value, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    if (response.status === 200) {
      console.log('paste to target ok');
    }
  } catch (error) {
    console.error('Error resetting stream:', error);
  }
}

</script>

<style scoped></style>

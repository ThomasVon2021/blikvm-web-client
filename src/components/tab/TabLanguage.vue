<script setup lang="ts">
import { shallowRef } from 'vue';
import {LanguageIcon } from 'vue-tabler-icons';
import { mergeProps } from 'vue'

const languageDD = shallowRef([
  { title: 'English', subtext: 'UK', value: 'en' },
  { title: '中国人', subtext: 'Chinese', value: 'zh' }
]);
</script>

<template>
  <v-menu>
    <template v-slot:activator="{ props: menu }">
      <v-tooltip location="top">
        <template v-slot:activator="{ props: tooltip }">
          <v-btn icon class="toolbar-btn" size="30" v-bind="mergeProps(menu, tooltip)">
             <LanguageIcon stroke-width="1.5" size="22" />
          </v-btn>
        </template>
        <span>Language</span>
      </v-tooltip>
      
    </template>
    <v-list class="dropdown-menu">
      <v-list-item
      v-for="(item, index) in languageDD"
      :key="index"
      color="secondary"
      :active="$i18n.locale == item.value"
      class="d-flex align-center"
      @click="() => ($i18n.locale = item.value)"
    >
      <v-list-item-title class="text-subtitle-1 font-weight-regular">
        {{ item.title }}
        <span class="text-disabled text-subtitle-1 pl-2">({{ item.subtext }})</span>
      </v-list-item-title>
    </v-list-item>
    </v-list>
  </v-menu>

</template>



  
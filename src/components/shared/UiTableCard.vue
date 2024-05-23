<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

<template>
  <!-- ---------------------------------------------------- -->
  <!-- Table Card -->
  <!-- ---------------------------------------------------- -->
  <v-card variant="flat" elevation="0">
    <v-card-item>
      <v-card-title class="text-18">{{ props.title }}</v-card-title>
    </v-card-item>
    <v-divider></v-divider>

    <slot />
  </v-card>
</template>

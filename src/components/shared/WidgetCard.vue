<script setup lang="ts">
const props = defineProps({
  title: String
});
</script>

<template>
  <!-- -------------------------------------------------------------------- -->
  <!-- Card with Header & Footer -->
  <!-- -------------------------------------------------------------------- -->
  <v-card variant="flat" class="mb-6 overflow-hidden">
    <v-card-item>
      <v-card-title class="text-18">{{ props.title }}</v-card-title>
    </v-card-item>
    <v-divider></v-divider>
    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>

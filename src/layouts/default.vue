<template>
  <v-app>

    <ToolBar />

    <v-main>
      <router-view />
    </v-main>

  </v-app>
</template>

<script setup>
  //
</script>

<style>
html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

html{
  overflow-y: hidden;
}

.v-application, .v-application_wrap,.v-main{
  height: 100%;
  width: 100%;
}
</style>

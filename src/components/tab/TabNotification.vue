<template>
    <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
        <template v-slot:activator="{ props }">
            <v-btn icon class="toolbar-btn" size="30" v-bind="props">
                <v-icon class="toolbar-icon" color="yellow">mdi-bell</v-icon>
                <v-tooltip activator="parent" location="bottom">Notification</v-tooltip>
            </v-btn>
        </template>

        <v-card width="370" max-height="400" class="mx-auto notification-card" color="grey-lighten-3">
            <v-expansion-panels variant="accordion">
                <v-expansion-panel class="bli-font-bold my-2"
                    v-for="(panel, index) in notificationStore.allNotifications" :key="index" @click.stop>
                    <v-expansion-panel-title icon="mdi-vuetify" expand-icon="mdi-menu-down" collapse-icon="mdi-menu-up">
                        <template v-slot:default="{ }">
                            <v-row no-gutters>
                                <v-col cols="4" class="align-center d-flex justify-start">
                                    <v-icon class="me-1">{{ getContentIcon(panel.items) }}</v-icon>
                                    {{ panel.title }}
                                </v-col>
                            </v-row>
                        </template>
                    </v-expansion-panel-title>
                        <v-card v-for="(content, index) in panel.items" :key="index">
                            <v-card-subtitle>{{ content.timestamp }}</v-card-subtitle>
                            <v-card-title expand-icon="mdi-menu-down">{{ content.message }}</v-card-title>
                            <v-card-text>{{ content.text }}</v-card-text>
                        </v-card>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-card>

    </v-menu>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useNotificationStore } from '@/stores/notificationStore';


const menu = ref(false);
const notificationStore = useNotificationStore();
const notifications = ref([]);

watch(() => notificationStore.allNotifications, (newNotifications) => {
  // Update the local notifications array
  notifications.value = newNotifications.map(notification => {
    const itemCount = notification.items.length;
    return {
      ...notification,
      title: `Storage (${itemCount})`
    };
  });
});

const getContentIcon = (items) => {
  if (items.length > 0) {
    return items[0].icon;
  }
  return ''
}



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
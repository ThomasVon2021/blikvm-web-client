<template>
    <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
        <template v-slot:activator="{ props }">
            <v-btn icon class="toolbar-btn" size="30" v-bind="props">
                <v-icon class="toolbar-icon">mdi-mouse</v-icon>
                <v-tooltip activator="parent" location="bottom">Mouse</v-tooltip>
            </v-btn>
        </template>

        <v-card min-width="300">
            <v-label>Develop later</v-label> 
            <v-list>
                <v-list-item>
                    <v-switch v-model="model" color="purple" label="Absolute mode" hide-details></v-switch>
                </v-list-item>

                <v-list-item>
                    <v-switch v-model="tablet" color="purple" label="relative mode" hide-details></v-switch>
                </v-list-item>
            </v-list>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn variant="text" @click="cancel()">
                    Cancel
                </v-btn>
                <v-btn color="primary" variant="text" @click="save()">
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>

<script setup>
import { ref } from 'vue';

const menu = ref(false);
const model = ref(false);
const tablet = ref(true);

function cancel() {
    menu.value = false;
}

function save() {
    alert(`Absolute mode: ${model.value}, relative mode: ${tablet.value}`);
    menu.value = false;
}

</script>
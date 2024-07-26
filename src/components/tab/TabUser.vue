<template>
    <v-menu>
      <template v-slot:activator="{ props: menu }">
        <v-tooltip location="top">
          <template v-slot:activator="{ props: tooltip }">
            <v-btn icon class="toolbar-btn" size="30" v-bind="mergeProps(menu, tooltip)">
              <v-icon class="toolbar-icon">mdi-account-key</v-icon>
            </v-btn>
          </template>
          <span>User Manager</span>
        </v-tooltip>
      </template>
  
      <div class="pa-4">
        <v-list class="mt-3">
          <v-list-item @click="openSettingsDialog" color="secondary" rounded="md">
            <template v-slot:prepend>
              <SettingsIcon size="20" class="mr-2" />
            </template>
            <v-list-item-title class="text-subtitle-2"> Account Settings</v-list-item-title>
          </v-list-item>
  
          <v-list-item @click="logout" color="secondary" rounded="md">
            <template v-slot:prepend>
              <LogoutIcon size="20" class="mr-2" />
            </template>
            <v-list-item-title class="text-subtitle-2"> Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </div>
    </v-menu>
  
    <v-dialog v-model="isSettingsDialogOpen" persistent  @keydown.stop @keyup.stop max-width="500px">
      <v-card>
        <v-card-title>Account Settings</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="6">
              <v-text-field color="primary" label="New Username" variant="outlined" v-model="nusername"></v-text-field>
            </v-col>
            <v-col cols="12" lg="6">
              <v-text-field color="primary" label="Current Password" variant="outlined" type="password" v-model="cpassword"></v-text-field>
            </v-col>
            <v-col cols="12" lg="6">
              <v-text-field color="primary" label="New Password" variant="outlined" type="password" v-model="npassword"></v-text-field>
            </v-col>
            <v-col cols="12" lg="6">
              <v-text-field color="primary" label="Confirm Password" variant="outlined" type="password" v-model="conpassword"></v-text-field>
            </v-col>
          </v-row>
          <div class="text-right mt-4">
            <v-btn color="primary" @click="changePassword">Change Password</v-btn>
            <v-btn color="error" variant="text" class="ml-2" @click="clearFields">Cancle</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="changePasswordD" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">User Setting</v-card-title>
            <v-card-text >
              {{ changeMessage }}
            </v-card-text>

            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="close">Cancel</v-btn>
            <v-spacer></v-spacer>
          </v-card>
        </v-dialog>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { mergeProps } from 'vue';
  import { SettingsIcon, LogoutIcon, UserIcon } from 'vue-tabler-icons';
  import http from '@/utils/http.js';
  import { useAppStore } from '@/stores/stores';
  import { useRouter } from 'vue-router';

  const isSettingsDialogOpen = ref(false);
  const store = useAppStore();

  const nusername = ref(store.username);
  const cpassword = ref('');
  const npassword = ref('');
  const conpassword = ref('');
  const changePasswordD = ref(false);
  const changeMessage = ref('1');
  let changeSuccessFlag = false;
  const router = useRouter();

  const openSettingsDialog = () => {
    isSettingsDialogOpen.value = true;
  };
  
  const changePassword = async () => {
    if(!nusername.value || !cpassword.value || !npassword.value || !conpassword.value){
      changeMessage.value = "Each parameter cannot be empty";
      changePasswordD.value = true;
      return;
    }else if( npassword.value !== conpassword.value ){
      changeMessage.value = "Two passwords do not match";
      changePasswordD.value = true;
      return;
    }
    const requestBody = {
      newUsername: nusername.value,
      newPassword: npassword.value
  };
    const response = await http.post('/changeaccount',requestBody );
    if(response.status === 200 ){
      changeMessage.value = "change success!";
      changeSuccessFlag = true;
      changePasswordD.value = true;
      
    }
    isSettingsDialogOpen.value = false;
  };
  
  const clearFields = () => {
    isSettingsDialogOpen.value = false;
    cpassword.value = '';
    npassword.value = '';
    conpassword.value = '';
  };

  const close = () => {
    if( changeSuccessFlag ===  true){
      changeSuccessFlag = false;
      router.push('/');
    }
    changePassword.value = false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/');
  };

  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  
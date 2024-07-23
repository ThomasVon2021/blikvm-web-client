<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template v-slot:activator="{ props }">
      <v-btn icon class="toolbar-btn" size="30" v-bind="props">
        <v-icon class="toolbar-icon">mdi-folder-cog</v-icon>
        <v-tooltip activator="parent" location="bottom">MSD</v-tooltip>
      </v-btn>
    </template>

    <UiParentCard title="Mass Storage Devices">

      <div class="d-flex align-center">
        <v-label class="font-weight-medium align-center">status: </v-label>
        <v-chip :color="imageCreateStateColor" class="ma-2">{{ imageCreateStateText }}</v-chip>
        <v-chip :color="imageConnectStateColor" class="ma-2">{{ imageConnectStateText }}</v-chip>
      </div>


      <div v-if="uploadState === UploadMSDImageState.UPloadToNetworkBuff">
        <v-progress-linear :indeterminate="uploading" buffer-value="100" :active="uploading" height="6" color="primary"
          rounded></v-progress-linear>
      </div>
      <div v-if="uploadState === UploadMSDImageState.UPloadToKVM">
        <v-progress-linear :model-value="uploadProgress" buffer-value="100" :active="uploading" height="6"
          color="primary" rounded></v-progress-linear>
      </div>


      <v-toolbar flat>

        <v-toolbar-title
          :style="{ flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">
          {{ $t('message.availableImage') }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-title
          :style="{ color: getColor(100 - parseFloat(items.capacity)), flex: '1 1 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }"
          class="custom-subtitle">
          {{ $t('available') }} {{ parseFloat(items.capacity) }}% ({{ convertBytesToGB(items.used) }}Gb) {{ $t('of') }}
          {{
            convertBytesToGB(items.size)
          }}Gb
        </v-toolbar-title>


        <v-btn @click="!uploading && openResizeDialog()" :disabled="uploading" append-icon="mdi-unfold-more-vertical"
          :ripple="true" color="primary" :style="{ color: getColor(parseFloat(items.capacity)) }">
          <v-tooltip activator="parent" location="bottom">{{ $t('resizeFilesystem') }}</v-tooltip>
        </v-btn>

        <v-btn @click="handleRefreshMSDListClick" append-icon="mdi-refresh" :ripple="true" color="primary">
          <v-tooltip activator="parent" location="bottom">{{ $t('refreshList') }}</v-tooltip>
        </v-btn>

        <v-btn @click="!uploading && handleUploadImageClick()" :disabled="!files" append-icon="mdi-upload"
          :ripple="true" color="primary">
          <v-tooltip activator="parent" location="bottom">{{ $t('uploadImages') }}</v-tooltip>
        </v-btn>

        <v-dialog v-model="dialogResize" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to resize filesystem?</v-card-title>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="closeResize">Cancel</v-btn>
            <v-btn color="blue-darken-1" variant="text" @click="resizeConfirm">OK</v-btn>
            <v-spacer></v-spacer>
          </v-card>
        </v-dialog>

        <v-dialog v-model="dialogRemove" max-width="500px">
          <v-card>
            <v-card-title class="text-h5">Are you sure you want to remove image?</v-card-title>
            <v-card-text v-if="selectedItem">
              Image Name: {{ selectedItem.name }}
            </v-card-text>

            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="closeRemove">Cancel</v-btn>
            <v-btn color="blue-darken-1" variant="text" @click="removeItemConfirm(selectedItem.path)">OK</v-btn>
            <v-spacer></v-spacer>
          </v-card>
        </v-dialog>

      </v-toolbar>

      <v-file-input v-model="files" :show-size="1024" label="choose image file(s)" chips prepend-icon=""
        prepend-inner-icon="mdi-folder-search" color="primary" variant="outlined" @clear="files = null">
      </v-file-input>

      <v-data-table v-model="selected" height="215px" :loading="loading" :headers="headers" :items="items.files"
        item-value="name" fixed-header :multi-sort="true" no-data-text="No data available" return-object>

        <template v-slot:item="{ item }">
          <tr>
            <!-- TODO support download
            <td>
              <a :href="encodeURIComponent(item.path)" :download="encodeURIComponent(item.name)">{{ item.name }}</a>
            </td>
            -->
            <td>{{ item.name }}</td>
            <td>{{ convertBytesToMiB(item.imageSize) }} MiB</td>
            <td>{{ item.date }}</td>
            <td>
              <!-- Use a unique name for each v-switch using the item.name -->
              <v-switch v-model="switches[item.name]" true-value="yes" false-value="no" inset hide-details
                color="primary" @update:modelValue="!uploading && handleSwitch(item)" :disabled="uploading" />
            </td>
            <td>
              <v-btn @click="!uploading && openRemoveDialog(item)" :disabled="uploading" append-icon="mdi-delete"
                size="small" class="align-center" color="primary" :ripple="true">
                <v-tooltip activator="parent" location="bottom">Remove image</v-tooltip>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>

      <div class="d-flex ga-4 align-center flex-row">
        <v-label class="text-subtitlte-1">Make MSD Size</v-label>
        <v-slider class="flex-grow-1 mx-3" v-model="actualMSDImageSize" min="1" :max="maxMSDImageSize" color="primary"
          step="1" hide-details>
          <template v-slot:append>
            <v-text-field variant="plain" v-model="actualMSDImageSize"></v-text-field>
          </template>
        </v-slider>
      </div>

      <v-progress-linear :indeterminate="makeMSDImageProgress === 0 && makeMSDImageFlag"
        :model-value="makeMSDImageProgress > 0 ? makeMSDImageProgress : null" buffer-value="100"
        :active="makeMSDImageFlag" height="6" color="primary" rounded></v-progress-linear>

      <v-spacer></v-spacer>

      <div class="grid-container">
        <v-btn key="primary" color="primary" @click=makeMSDDrive() :disabled="imageCreateState === MsdImageCreateState.Created || makeMSDImageFlag">make usb drive</v-btn>
        <v-dialog v-model="availableImage">
          <v-card>
            <v-card-text>
              {{ imageMakeResultText }}
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="availableImage = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn key="primary" color="primary" @click=deleteMSDImage() >delete usb drive</v-btn>
        <v-dialog v-model="imageRemoveDialog">
          <v-card>
            <v-card-text>
              {{ imageRemoveResultText }}
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="imageRemoveDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-btn key="primary" color="primary" @click="connectMSDImage('true')">connect to host</v-btn>
        <v-btn key="primary" color="primary" @click="connectMSDImage('false')">abort</v-btn>
        <v-dialog v-model="imageConnectDialog">
          <v-card>
            <v-card-text>
              {{ imageConnectResultText }}
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" block @click="imageConnectDialog = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>

    </UiParentCard>

  </v-menu>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import UiParentCard from '@/components/shared/UiParentCard.vue';
import http from '@/utils/http.js';
import { useNotification } from '@/composables/notification.js';

const menu = ref(false);
const files = ref(null);
const items = ref([]);
const uploading = ref(false);
const loading = ref(false);
const switches = ref([]);
const dialogResize = ref(false);
const dialogRemove = ref(false);
const selectedItem = ref(null);
const { createAndAddNotification } = useNotification();
const uploadProgress = ref(0);
const uploadPreProgress = ref(0);
const selected = ref([]);
const availableImage = ref(false);
const sliders = ref([]);
const headers = ref([
  {
    title: 'Image name',
    align: 'start',
    sortable: true,
    key: 'name',
  },
  { title: 'Image size', align: 'start', sortable: true, key: 'imageSize' },
  { title: 'Image last modified', align: 'start', sortable: true, key: 'date' },
  { title: 'Available', align: 'start', sortable: false },
  { title: 'Remove', align: 'start', sortable: false }
])
const UploadMSDImageState = {
  None: 0,
  UPloadToNetworkBuff: 1,
  UPloadToKVM: 2
};
const MsdImageCreateState = {
  None: 'none',
  NotCreated: 'not_created',
  Created: 'created'
};
const MsdImageConnectState = {
  None: 'none',
  NotConnect: 'not_connected',
  Connected: 'connected'
};

//make
const uploadState = ref(UploadMSDImageState.None);
const maxMSDImageSize = ref(5);
const actualMSDImageSize = ref(5);
const makeMSDImageFlag = ref(false);
const makeMSDImageProgress = ref(0);
const imageMakeResultText = ref('');

//state
const imageCreateStateColor = ref('error');
const imageConnectStateColor = ref('error');
const imageCreateStateText = ref('none');
const imageConnectStateText = ref('none');
const imageCreateState = ref(MsdImageCreateState.None);
const imageConnectState = ref(MsdImageConnectState.None);


//remove
const imageRemoveDialog = ref(false);
const imageRemoveResultText = ref('');
//connect
const imageConnectDialog = ref(false);
const imageConnectResultText = ref('');

const makeMSDDrive = async () => {
  let progressInterval;
  const selectedItems = [];
  for (const itemName in switches.value) {
    if (switches.value[itemName] === 'yes') {
      selectedItems.push(itemName);
    }
  }
  if (selectedItems.length > 0) {
    try {
      const requestBody = {
        type: "ventoy",
        images: selectedItems,
        name: "ventoy",
        size: actualMSDImageSize.value
      };

      progressInterval = setInterval(async () => {
        try {
          const progressResponse = await http.post('/msd/create/progress');
          if (progressResponse.status === 200) {
            const progressData = progressResponse.data;
            makeMSDImageProgress.value = progressData.data;
            console.log('progressResponse.data:', progressResponse.data, ' make image progress:', makeMSDImageProgress.value);
          } else {
            console.error('Failed to fetch make image progress:', progressResponse);
          }
        } catch (error) {
          console.error('Error fetching make image progress:', error);
        }
      }, 1000); // 每隔1秒请求一次进度
      makeMSDImageFlag.value = true;
      const response = await http.post('/msd/create', requestBody);

      if (response.status === 200) {
        console.log('MSD created successfully:', response.data);
      } else {
        console.error('Failed to create MSD:', response);
      }
      makeMSDImageProgress.value = 0;
      makeMSDImageFlag.value = false;
      clearInterval(progressInterval);
      availableImage.value = true;
      imageMakeResultText.value = response.data.msg;
      getMSDState();
    } catch (error) {
      makeMSDImageProgress.value = 0;
      makeMSDImageFlag.value = false;
      clearInterval(progressInterval);
      console.error('Error creating MSD:', error);
    }
  } else {
    console.log("No image selected");
    availableImage.value = true;
    imageMakeResultText.value = 'No image selected';
    return;
  }
};

const getColor = (value) => {
  if (value < 10) {
    return 'red';
  } else if (value < 25) {
    return 'orange';
  }
};

const convertBytesToMiB = (bytes) => {
  const mebibytes = bytes / (1024 * 1024); // 1 MiB = 1024 * 1024 bytes
  return mebibytes.toFixed(2); // Adjust the decimal places as needed
};

const convertBytesToGB = (bytes) => {
  const mebibytes = bytes / (1024 * 1024 * 1024); // 1 Gb = 1024 * 1024 * 1024 bytes
  return mebibytes.toFixed(2); // Adjust the decimal places as needed
};

const openRemoveDialog = (item) => {
  dialogRemove.value = true;
  selectedItem.value = item; // Select the item to trigger the watcher
};

const handleSwitch = (item) => {
  console.log(item);
}

const switchImageCreateState = (state) => {
  console.log('create state:', state);
  switch (state) {
    case MsdImageCreateState.NotCreated:
      imageCreateState.value = MsdImageCreateState.NotCreated;
      imageCreateStateColor.value = 'primary';
      imageCreateStateText.value = 'Not created'
      return;
    case MsdImageCreateState.Created:
      imageCreateState.value = MsdImageCreateState.Created;
      imageCreateStateColor.value = 'success';
      imageCreateStateText.value = 'Created'
      return;
    default:
      imageCreateState.value = MsdImageCreateState.Created;
      imageCreateStateColor.value = 'error';
      imageCreateStateText.value = 'None'
      return;
  }
};

const switchImageConnectState = (state) => {
  console.log('connect state:', state);
  switch (state) {
    case MsdImageConnectState.NotConnect:
      imageConnectState.value = MsdImageConnectState.NotConnect;
      imageConnectStateColor.value = 'primary';
      imageConnectStateText.value = 'Disconnected'
      return;
    case MsdImageConnectState.Connected:
      imageConnectState.value = MsdImageConnectState.Connected;
      imageConnectStateColor.value = 'success';
      imageConnectStateText.value = 'Connected'
      return;
    default:
      imageConnectState.value = MsdImageConnectState.Connected;
      imageConnectStateColor.value = 'error';
      imageConnectStateText.value = 'None'
      return;
  }
};

const removeItemConfirm = async (item) => {

  const removeImage = async (item) => {
    try {
      const url = `/msd/delete?image=${item}`;
      console.log(url)

      const response = await http.post(url);

      if (response.data.code === 0) {
        // success

        const messageType = 'Information';
        const icon = 'mdi-information';
        const target = '' // `${myTarget}`;
        const message = `Successfully remove image ${item}`;
        const text = '???';

        createAndAddNotification('uuid', messageType, icon, message, target, text);

      } else {
        console.error('Error removing partition:', response);
      }
      await handleRefreshMSDListClick();
    } catch (error) {
      console.error(error);

      const messageType = 'Error';
      const icon = 'mdi-alert';
      const target = '' // `${myTarget}`;
      const message = `${error} Unable to remove partition.`;
      const text = '???';

      createAndAddNotification('uuid', messageType, icon, message, target, text);
    }
  };

  removeImage(item);

  closeRemove();
}

const closeRemove = () => {
  selectedItem.value = null;
  dialogRemove.value = false;
}

const handleUploadImageClick = async () => {

  let progressInterval;
  try {

    if (files.value) {
      const formData = new FormData();
      formData.append('image', files.value);
      uploading.value = true;

      progressInterval = setInterval(async () => {
        try {
          const progressResponse = await http.post('/msd/upload/progress');
          if (progressResponse.status === 200) {
            const progressData = progressResponse.data;
            uploadProgress.value = progressData.data;
            uploadState.value = UploadMSDImageState.UPloadToKVM;
            console.log('progressResponse.data:', progressResponse.data, ' Upload progress:', uploadProgress.value);
          } else {
            console.error('Failed to fetch upload progress:', progressResponse);
          }
        } catch (error) {
          console.error('Error fetching upload progress:', error);
        }
      }, 1000); // 每隔1秒请求一次进度

      const response = await http.post('/msd/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          uploadPreProgress.value = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          uploadState.value = UploadMSDImageState.UPloadToNetworkBuff;
        },
        timeout: 30 * 60 * 1000, // 30 minutes
      });

      if (response.status === 200) {
        // File uploaded successfully
        console.log('File uploaded successfully:', response);
        // Optionally, you can refresh the list after uploading
        // await handleRefreshMSDListClick();
      } else {
        console.error('File upload failed:', response);
      }

    } else {
      console.warn('No file selected for upload.');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
    clearInterval(progressInterval);
    handleRefreshMSDListClick();
    uploadState.value = UploadMSDImageState.None;
  }
}

const getMSDList = async () => {

  try {
    const response = await http.post(`/msd/images`);
    if(response.status === 200 && response.data.code === 0){
      console.log("/msd/images:", response.data);
      items.value = response.data.data;
      maxMSDImageSize.value = Math.floor(convertBytesToGB(items.value.size - items.value.used));
      console.log("items:", items.value, "maxMSDImageSize:", maxMSDImageSize.value)
      // Function to initialize switches array based on the number of rows
      const initializeSwitches = (rowCount) => {
        return Array(rowCount).fill(false); // Assuming the default value is false
      };

      // Populate the switches array based on the number of rows
      switches.value = initializeSwitches(items.value.length);
    }else{
      console.log("/msd/images post error");
    }

  } catch (error) {
    console.error('Error during atx button trigger:', error);
    const messageType = 'Error';
    const icon = 'mdi-alert';
    const target = '';
    const message = `Error getting MSD image list ${error}`;
    const text = '???';

    createAndAddNotification('uuid', messageType, icon, message, target, text);
    throw error;
  }
};

const handleRefreshMSDListClick = async () => {
  loading.value = true;
  try {
    await getMSDList();
    getMSDState();
    // Perform other actions upon success
  } catch (error) {
    // Handle errors
    console.error('Error refreshing MSD list:', error);
  } finally {
    loading.value = false;
  }
};

const getMSDState = async () => {
  try {
    const response = await http.post('/msd/state');
    if(response.status === 200 && response.data.code === 0){
      switchImageCreateState(response.data.data.msd_img_created);
      switchImageConnectState(response.data.data.msd_status);
    }else{
      console.error('getMSDState error:', response.data);
    }

  } catch (error) {
    console.error('getMSDState:', error);
  }
};

const deleteMSDImage = async () => {
  try {
    const response = await http.post('/msd/remove');
    imageRemoveDialog.value = true;
    imageRemoveResultText.value = response.data.msg;
    getMSDState();
  } catch (error) {
    console.error('deleteMSDImage:', error);
  }
};

const connectMSDImage = async (action) => {
  try {
    const response = await http.post(`/msd/connect?action=${action}`);
    imageConnectDialog.value = true;
    imageConnectResultText.value = response.data.msg;
    getMSDState();
  } catch (error) {
    console.error('connect:', error);
  }
};

onMounted(() => {
  // Initialize sliders array
  sliders.value = items.value.map(() => ref(5));

  getMSDList();
  getMSDState();
});


</script>

<style scoped>
.align-center {
  display: flex;
  align-items: center;
}

.custom-subtitle {
  color: 'Roboto';
  font-size: 14px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  /* 可选，添加按钮之间的间距 */
}
</style>
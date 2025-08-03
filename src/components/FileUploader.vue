<template>
  <div class="file-uploader-container">
    <FileUpload
      ref="fileUpload"
      name="csvFile"
      :customUpload="true"
      @uploader="handleFileUpload"
      :auto="true"
      accept=".csv"
      chooseLabel="Upload CSV"
      :disabled="isLoading"
      :showUploadButton="false"
      :showCancelButton="false"
    >
      <template #empty>
        <p>Drag and drop a CSV file here or click to select one.</p>
        <small>Required CSV headers: experiment_id, metric_name, step, value</small>
        <div v-if="uploadedFileName" class="file-name-container">
          <p>File uploaded: <strong>{{ uploadedFileName }}</strong></p>
          <i class="pi pi-times clear-icon" @click="clearFile" title="Clear file"></i>
        </div>
      </template>
    </FileUpload>

    <div v-if="isLoading" class="loading-container">
      <p>Processing file...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useExperimentStore } from '../stores/experimentStore';
import { useToast } from 'primevue/usetoast';
import Papa from 'papaparse';
import FileUpload from 'primevue/fileupload';
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { ExperimentData } from '../types/experiment';

export default defineComponent({
  name: 'FileUploader',
  components: {
    FileUpload
  },
  setup() {
    const fileUpload = ref();
    const store = useExperimentStore();
    const toast = useToast();
    const isLoading = ref(false);
    const uploadedFileName = ref<string | null>(null);

    const handleFileUpload = (event: FileUploadUploaderEvent) => {
      const files = Array.isArray(event.files) ? event.files : [event.files];
      const file = files[0];

      if (!file) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No file selected',
          life: 3000,
        });
        isLoading.value = false;
        return;
      }

      store.resetData();

      // Warn about large files but continue processing
      if (file.size > 50000000) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'File is larger than 50MB. Processing may take longer.',
          life: 5000,
        });
      }

      isLoading.value = true;

      const requiredFields = ['experiment_id', 'metric_name', 'step', 'value'];

      // Read the first line to check headers
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Unable to read file content',
            life: 3000,
          });
          isLoading.value = false;
          fileUpload.value?.clear();
          return;
        }

        // Check headers
        const firstLine = text.split('\n')[0].trim();
        const headers = firstLine.split(',').map(h => h.trim());
        const missingHeaders = requiredFields.filter(field => !headers.includes(field));

        if (missingHeaders.length > 0) {
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `Missing required CSV headers: ${missingHeaders.join(', ')}`,
            life: 3000,
          });
          isLoading.value = false;
          fileUpload.value?.clear();
          return;
        }

        // Parse CSV if headers are valid
        const parsedData: ExperimentData[] = [];
        let isValid = true;

        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          step: (row: Papa.ParseStepResult<any>) => {
            const data = row.data;
            if (!data) {
              isValid = false;
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Invalid row data',
                life: 3000,
              });
              return;
            }

            // Validate required fields
            if (!requiredFields.every(field => field in data)) {
              isValid = false;
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Missing required fields in row',
                life: 3000,
              });
              return;
            }

            const step = Number(data.step);
            const value = Number(data.value);
            if (isNaN(step) || isNaN(value)) {
              isValid = false;
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: `Invalid data: step=${data.step}, value=${data.value}`,
                life: 3000,
              });
              return;
            }

            parsedData.push({
              experiment_id: String(data.experiment_id),
              metric_name: String(data.metric_name),
              step,
              value,
            });
          },
          complete: () => {
            isLoading.value = false;

            if (isValid && parsedData.length > 0) {
              store.setData(parsedData);
              uploadedFileName.value = file.name;
              toast.add({
                severity: 'success',
                summary: 'Success',
                detail: `File uploaded successfully (${parsedData.length} rows)`,
                life: 3000,
              });
              fileUpload.value?.clear();
            } else if (parsedData.length === 0) {
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'The file is empty or contains no valid data',
                life: 3000,
              });
            } else {
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Invalid format or data in file',
                life: 3000,
              });
            }
          },
          error: (error: Error) => {
            isLoading.value = false;
            uploadedFileName.value = null;
            toast.add({
              severity: 'error',
              summary: 'Parsing Error',
              detail: error.message,
              life: 3000,
            });
            fileUpload.value?.clear();
          },
          worker: true,
        });
      };

      reader.onerror = () => {
        isLoading.value = false;
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to read file',
          life: 3000,
        });
        fileUpload.value?.clear();
      };

      reader.readAsText(file);
    };

    const clearFile = () => {
      store.resetData();
      uploadedFileName.value = null;
      toast.add({
        severity: 'info',
        summary: 'File Cleared',
        detail: 'The uploaded file and its data have been removed.',
        life: 3000,
      });
    };

    return {
      handleFileUpload,
      isLoading,
      fileUpload,
      uploadedFileName,
      clearFile,
    };
  },
});
</script>

<style scoped>
.file-uploader-container {
  margin: 1rem;
}

.progress {
  margin-top: 0.5rem;
  height: 6px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.file-name-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-icon {
  cursor: pointer;
  color: #ff4d4f;
  font-size: 1rem;
  transition: color 0.2s;
}

.clear-icon:hover {
  color: #cc0000;
}
</style>

<template>
  <div class="file-uploader-container">
    <FileUpload
      ref="fileUpload"
      name="csvFile"
      :customUpload="true"
      @uploader="handleFileUpload"
      :auto="true"
      accept=".csv"
      :maxFileSize="50000000"
      chooseLabel="Upload CSV"
      :disabled="isLoading"
      :showUploadButton="false"
      :showCancelButton="false"
    >


      <template #empty>
        <p>Drag and drop a CSV file here or click to select one.</p>
        <p v-if="uploadedFileName">File uploaded: <strong>{{ uploadedFileName }}</strong></p>
      </template>

    </FileUpload>

    <ProgressBar v-if="isLoading" mode="indeterminate" class="progress" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useExperimentStore } from '../stores/experimentStore';
import { useToast } from 'primevue/usetoast';
import Papa from 'papaparse';
import FileUpload from 'primevue/fileupload';
import ProgressBar from 'primevue/progressbar';
import type { FileUploadUploaderEvent } from 'primevue/fileupload';
import type { ExperimentData } from '../types/experiment';

export default defineComponent({
  name: 'FileUploader',
  components: {
    FileUpload,
    ProgressBar,
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
        return;
      }


      if (file.size > 50000000) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'File is too large (>50MB). Parsing may take time.',
          life: 5000,
        });
      }

      isLoading.value = true;

      const requiredFields = ['experiment_id', 'metric_name', 'step', 'value'];
      let isValid = true;
      const parsedData: ExperimentData[] = [];

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        step: (row: Papa.ParseStepResult<any>) => {
          const data = row.data;
          if (!data) return;

          if (!requiredFields.every(field => field in data)) {
            isValid = false;
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Missing required CSV columns',
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
            console.log(' file.name',  file.name);
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
              detail: 'The file is empty',
              life: 3000,
            });
          } else {
            toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Invalid format or data',
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
        },
        worker: true,
      });
    };

    return {
      handleFileUpload,
      isLoading,
      fileUpload,
      uploadedFileName,
    };
  },
});
</script>

<style scoped>
.file-uploader-container {
  margin: 1rem;
}

.progress {
  margin-top: 1rem;
}
</style>

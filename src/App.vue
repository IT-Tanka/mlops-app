<template>
  <div id="app">
    <Toast />
    <div class="layout">
      <!-- Left side: uploader and experiment list -->
      <div class="left-panel">
        <FileUploader />
        <ExperimentList />
      </div>

      <!-- Right side: chart -->
      <div class="right-panel">
        <MetricChart />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FileUploader from './components/FileUploader.vue';
import ExperimentList from './components/ExperimentList.vue';
import MetricChart from './components/MetricChart.vue';
import Toast from 'primevue/toast';

export default defineComponent({
  name: 'App',
  components: {
    FileUploader,
    ExperimentList,
    MetricChart,
    Toast,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  overflow-y: auto;
}

.layout {
  display: flex;
  flex-direction: row;
  height: 100%;
}

.left-panel {
  width: 30%;
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.right-panel {
  width: 70%;
}

@media (max-width:768px) {
  .layout {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    padding-right: 0;
  }

  .right-panel {
    width: 100%;
  }
  .p-toast {
    left: 1rem !important;
    right: 1rem !important;
    width: auto !important;
  }

  .p-toast-message {
    white-space: normal !important;
    word-break: break-word !important;
  }
}
</style>

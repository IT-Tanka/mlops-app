<template>
  <div class="experiment-container">
    <h3>Experiments</h3>

    <DataTable
      :value="paginatedExperiments"
      selectionMode="multiple"
      v-model:selection="selectedExperimentObjects"
      dataKey="experiment_id"
      @update:selection="handleSelection"
      :paginator="paginatedExperiments.length > 5"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Показано {first} - {last} из {totalRecords}"
    >
      <!-- Experiment ID column -->
      <Column field="experiment_id" header="Experiment ID" sortable></Column>

      <!-- Checkbox icon for selected experiments -->
      <Column headerStyle="width: 3rem">
        <template #body="slotProps">
          <i
            class="pi pi-check"
            style="color: green"
            v-if="selectedExperimentObjects.some((exp: { experiment_id: string }) => exp.experiment_id === slotProps.data.experiment_id)"
          ></i>
        </template>
      </Column>
    </DataTable>

    <!-- Empty state -->
    <p v-if="!paginatedExperiments.length">No experiments loaded.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useExperimentStore } from '../stores/experimentStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

export default defineComponent({
  name: 'ExperimentList',
  components: {
    DataTable,
    Column,
  },
  setup() {
    const store = useExperimentStore();

    // Map experiment IDs into an array of objects for DataTable
    const paginatedExperiments = computed(() =>
      store.experiments.map(exp => ({ experiment_id: exp }))
    );

    // Local state to hold selected experiment objects
    const selectedExperimentObjects = ref<{ experiment_id: string }[]>([]);

    // Sync selected experiment IDs with the store
    const handleSelection = (value: { experiment_id: string }[]) => {
      selectedExperimentObjects.value = value;
      store.setSelectedExperiments(value.map(exp => exp.experiment_id));
    };

    return {
      paginatedExperiments,
      selectedExperimentObjects,
      handleSelection,
    };
  },
});
</script>

<style scoped>
.experiment-container {
  margin: 1rem;
}
</style>

<template>
  <div class="experiment-container">
    <h3>Experiments</h3>

    <!-- Filter input -->
    <InputText
      v-model="filter"
      placeholder="Filter experiments by ID"
      class="filter-input"
    />

    <!-- Select/Deselect buttons -->
    <div class="button-group">
      <PButton
        label="Select All"
        icon="pi pi-check-circle"
        @click="selectAll"
        v-if="filteredExperiments.length"
        class="p-button-sm"
      />
      <PButton
        label="Deselect All"
        icon="pi pi-times-circle"
        @click="deselectAll"
        v-if="selectedExperimentObjects.length"
        class="p-button-sm"
      />
    </div>

    <DataTable
      :value="filteredExperiments"
      selectionMode="multiple"
      v-model:selection="selectedExperimentObjects"
      dataKey="experiment_id"
      @update:selection="handleSelection"
      :paginator="filteredExperiments.length > 5"
      :rows="5"
      :rowsPerPageOptions="[5, 10, 20]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
    >
      <!-- Experiment ID column -->
      <Column field="experiment_id" header="Experiment ID" sortable></Column>

      <!-- Data Points column -->
      <Column field="dataCount" header="Data Points" sortable>
        <template #body="slotProps">
          {{ slotProps.data.dataCount }}
        </template>
      </Column>

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
    <p v-if="!filteredExperiments.length">No experiments loaded or matching the filter.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useExperimentStore } from '../stores/experimentStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

export default defineComponent({
  name: 'ExperimentList',
  components: {
    DataTable,
    Column,
    InputText,
    PButton: Button, // Alias Button as PButton to avoid HTML reserved name
  },
  setup() {
    const store = useExperimentStore();
    const filter = ref('');

    // Map experiment IDs into an array of objects for DataTable with dataCount
    const paginatedExperiments = computed(() =>
      store.uniqueExperiments.map(exp => ({
        experiment_id: exp,
        dataCount: store.data.filter(row => row.experiment_id === exp).length
      }))
    );

    // Filter experiments based on input
    const filteredExperiments = computed(() =>
      paginatedExperiments.value.filter(exp =>
        exp.experiment_id.toLowerCase().includes(filter.value.toLowerCase())
      )
    );

    // Local state to hold selected experiment objects
    const selectedExperimentObjects = ref<{ experiment_id: string; dataCount: number }[]>([]);

    // Sync selectedExperimentObjects with store.uniqueExperiments
    watch(
      () => store.uniqueExperiments,
      (newExperiments) => {
        if (newExperiments.length === 0) {
          selectedExperimentObjects.value = [];
        } else {
          selectedExperimentObjects.value = selectedExperimentObjects.value.filter(exp =>
            newExperiments.includes(exp.experiment_id)
          );
        }
      },
      { deep: true }
    );

    // Sync selected experiment IDs with the store
    const handleSelection = (value: { experiment_id: string; dataCount: number }[]) => {
      selectedExperimentObjects.value = value;
      store.setSelectedExperiments(value.map(exp => exp.experiment_id));
    };

    // Select all experiments
    const selectAll = () => {
      selectedExperimentObjects.value = filteredExperiments.value;
      store.setSelectedExperiments(filteredExperiments.value.map(exp => exp.experiment_id));
    };

    // Deselect all experiments
    const deselectAll = () => {
      selectedExperimentObjects.value = [];
      store.setSelectedExperiments([]);
    };

    return {
      filteredExperiments,
      selectedExperimentObjects,
      handleSelection,
      selectAll,
      deselectAll,
      filter,
      store,
    };
  },
});
</script>

<style scoped>
.experiment-container {
  margin: 1rem;
}

.filter-input {
  margin-bottom: 1rem;
  width: 100%;
  max-width: 300px;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
</style>

<template>
  <div class="metric-chart">
    <h3>Metric Charts</h3>

    <!-- MultiSelect for selecting multiple metrics -->
    <MultiSelect
      v-model="selectedMetrics"
      :options="metrics"
      optionLabel="name"
      placeholder="Select metrics"
      class="dropdown"
      :maxSelectedLabels="3"
      selectedItemsLabel="{0} metrics selected"
      ref="multiSelect"
      @change="handleMetricSelection"
    />

    <div v-if="selectedMetrics.length" class="chart-container">
      <!-- Preloader while chart data is being computed -->
      <div v-if="isLoading" class="loading-container">
        <ProgressSpinner class="spinner" />
        <p>Loading chart data...</p>
      </div>
      <!-- Line chart rendered if data is available -->
      <LineChart
        v-else-if="chartData.datasets.length"
        :data="chartData"
        :options="chartOptions"
      />
      <p v-else>No data available for the selected metrics and experiments.</p>
    </div>

    <p v-else>Please select at least one metric.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from 'vue';
import { useExperimentStore } from '../stores/experimentStore';
import MultiSelect from 'primevue/multiselect';
import { Line as LineChart } from 'vue-chartjs';
import { Chart, registerables } from 'chart.js';
import ProgressSpinner from 'primevue/progressspinner';
import type { ChartOptions } from 'chart.js';
Chart.register(...registerables);

interface MetricOption {
  name: string;
}

export default defineComponent({
  name: 'MetricChart',
  components: {
    MultiSelect,
    LineChart,
    ProgressSpinner,
  },
  setup() {
    const store = useExperimentStore();
    const selectedMetrics = ref<MetricOption[]>([]);
    const isLoading = ref(false);
    const multiSelect = ref<InstanceType<typeof MultiSelect> | null>(null);

    // Reset selectedMetrics when store data is reset
    watch(
      () => store.uniqueMetrics,
      (newMetrics) => {
        if (newMetrics.length === 0) {
          selectedMetrics.value = [];
        } else {
          selectedMetrics.value = selectedMetrics.value.filter(metric =>
            newMetrics.includes(metric.name)
          );
        }
      },
      { deep: true }
    );

    // Prepare available metrics from the store
    const metrics = computed(() =>
      store.metrics.map(name => ({ name }))
    );

    // Cache filtered data to optimize performance
    const cachedData = computed(() => {
      const cache: Record<string, Record<string, { x: number; y: number }[]>> = {};
      store.data.forEach(row => {
        if (!cache[row.experiment_id]) {
          cache[row.experiment_id] = {};
        }
        if (!cache[row.experiment_id][row.metric_name]) {
          cache[row.experiment_id][row.metric_name] = [];
        }
        cache[row.experiment_id][row.metric_name].push({ x: row.step, y: row.value });
      });
      return cache;
    });

    // Prepare chart data based on selected metrics and experiments
    const chartData = computed(() => {
      if (!selectedMetrics.value.length || !store.selectedExperiments.length) {
        return { datasets: [] };
      }

      const datasets = store.selectedExperiments.flatMap((exp, expIndex) =>
        selectedMetrics.value.map((metric, metricIndex) => {
          const filteredData = cachedData.value[exp]?.[metric.name] || [];

          // Sampling logic for performance with large datasets
          const maxPoints = 1000;
          const step = Math.ceil(filteredData.length / maxPoints);
          const sampledData = filteredData.filter((_, i) => i % step === 0);

          return {
            label: `${exp} - ${metric.name}`,
            data: sampledData,
            borderColor: `hsl(${(expIndex * 137.5 + metricIndex * 30) % 360}, 70%, 50%)`,
            fill: false,
            pointRadius: sampledData.length > 100 ? 0 : 3,
          };
        })
      );

      return { datasets };
    });

    // Handle metric selection and close MultiSelect
    const handleMetricSelection = () => {
      multiSelect.value?.hide();
    };

    // Watch for changes in chartData to manage loading state
    watch(
      () => [selectedMetrics.value, store.selectedExperiments],
      async () => {
        if (selectedMetrics.value.length && store.selectedExperiments.length) {
          isLoading.value = true;
          await nextTick(); // Ensure spinner renders
          await new Promise(resolve => setTimeout(resolve, 500));
          isLoading.value = false;
        }
      },
      { deep: true }
    );

    // Chart.js options
    const chartOptions: ChartOptions<'line'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'Step' },
          type: 'linear' as const,
          ticks: { precision: 0 },
        },
        y: {
          title: { display: true, text: 'Value' },
          ticks: { precision: 2 },
        },
      },
      plugins: {
        legend: { display: true },
        tooltip: {
          mode: 'index' as const,
          intersect: false,
        },
      },
    };

    // Debug string for displaying state information
    const chartDataDebug = computed(() => {
      if (!selectedMetrics.value.length || !store.selectedExperiments.length) {
        return 'No metrics or experiments selected';
      }
      return `Experiments: ${store.selectedExperiments.length}, Metrics: ${selectedMetrics.value.length}, Data rows: ${store.data.length}`;
    });

    return {
      selectedMetrics,
      metrics,
      chartData,
      chartOptions,
      chartDataDebug,
      isLoading,
      multiSelect,
      handleMetricSelection,
    };
  },
});
</script>

<style scoped>
.metric-chart {
  margin: 1rem;
}

.dropdown {
  margin-bottom: 1rem;
  width: 100%;
  max-width: 400px;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 8px;
}

.spinner {
  width: 3rem;
  height: 3rem;
}
</style>

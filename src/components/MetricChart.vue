<template>
  <div class="metric-chart">
    <h3>Metric Charts</h3>

    <!-- Dropdown for selecting metric -->
    <Dropdown v-model="selectedMetric" :options="metrics" optionLabel="name" placeholder="Select a metric"
      class="dropdown" />

    <div v-if="selectedMetric" class="chart-container">
      <!-- Line chart rendered if data is available -->
      <LineChart v-if="chartData.datasets.length" :data="chartData" :options="chartOptions" />
      <p v-else>No data available for the selected metric and experiments.</p>
    </div>

    <p v-else>Please select a metric.</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useExperimentStore } from '../stores/experimentStore';
import Dropdown from 'primevue/dropdown';
import { Line as LineChart } from 'vue-chartjs';
import { Chart, registerables } from 'chart.js';
import type { ChartOptions } from 'chart.js';
Chart.register(...registerables);

interface MetricOption {
  name: string;
}

export default defineComponent({
  name: 'MetricChart',
  components: {
    Dropdown,
    LineChart,
  },
  setup() {
    const store = useExperimentStore();
    const selectedMetric = ref<MetricOption | null>(null);

    // Prepare available metrics from the store
    const metrics = computed(() =>
      store.metrics.map(name => ({ name }))
    );

    // Prepare chart data based on selected metric and selected experiments
    const chartData = computed(() => {
      if (!selectedMetric.value || !store.selectedExperiments.length) {
        return { datasets: [] };
      }

      const datasets = store.selectedExperiments.map((exp, index) => {
        const filteredData = store.data
          .filter(row => row.experiment_id === exp && row.metric_name === selectedMetric.value!.name)
          .map(row => ({ x: row.step, y: row.value }));

        // Sampling logic for performance with large datasets
        const maxPoints = 1000;
        const step = Math.ceil(filteredData.length / maxPoints);
        const sampledData = filteredData.filter((_, i) => i % step === 0);

        return {
          label: `${exp} - ${selectedMetric.value!.name}`,
          data: sampledData,
          borderColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
          fill: false,
          pointRadius: sampledData.length > 100 ? 0 : 3,
        };
      });

      return { datasets };
    });

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


    // Debug string for displaying state information (optional)
    const chartDataDebug = computed(() => {
      if (!selectedMetric.value || !store.selectedExperiments.length)
        return 'No metric or experiments selected';
      return `Experiments: ${store.selectedExperiments.length}, Data rows: ${store.data.length}`;
    });

    return {
      selectedMetric,
      metrics,
      chartData,
      chartOptions,
      chartDataDebug,
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
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}
</style>

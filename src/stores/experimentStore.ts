import { defineStore } from 'pinia';
import type { ExperimentData } from '../types/experiment';

export const useExperimentStore = defineStore('experiment', {
  state: () => ({
    // Raw experiment data from CSV
    data: [] as ExperimentData[],

    // List of selected experiment IDs
    selectedExperiments: [] as string[],

    // Unique experiment identifiers
    uniqueExperiments: [] as string[],

    // Unique metric names
    uniqueMetrics: [] as string[],
  }),

  getters: {
    // Returns the list of unique experiment IDs
    experiments: (state) => state.uniqueExperiments,

    // Returns the list of unique metric names
    metrics: (state) => state.uniqueMetrics,
  },

  actions: {
    // Processes CSV data and extracts unique values
    setData(data: ExperimentData[]) {
      this.data = data;
      this.uniqueExperiments = [...new Set(data.map(row => row.experiment_id))];
      this.uniqueMetrics = [...new Set(data.map(row => row.metric_name))];
    },

    // Updates the list of selected experiments
    setSelectedExperiments(experiments: string[]) {
      this.selectedExperiments = experiments;
    },

    // Clears all stored data
    resetData() {
      this.data = [];
      this.selectedExperiments = [];
      this.uniqueExperiments = [];
      this.uniqueMetrics = [];
    },
  },
});

# mlops-app

## Overview
This project is a simple frontend application for an MLOps platform, designed to manage experiment tracking for machine learning models. It allows users to upload CSV files containing experiment logs, view a list of experiments, and visualize metric data.

## Usage
- Upload a CSV file via the "Upload CSV" button.
- View the list of experiments and select multiple entries.
- Choose a metric from the dropdown to visualize data for selected experiments.

## Technologies
- **Framework**: Vue.js
- **State Management**: Pinia
- **UI Components**: PrimeVue
- **Charting**: vue-chartjs
- **CSV Parsing**: Papaparse

## File Structure
- `App.vue`: Main application layout.
- `ExperimentList.vue`: Displays and manages experiment list.
- `FileUploader.vue`: Handles CSV file uploads.
- `MetricChart.vue`: Visualizes metric data.
- `experimentStore.ts`: Manages application state.
- `main.ts`: Application entry point.
- `vite.config.ts`: Vite configuration.

## Notes
- The application assumes a CSV file with the specified columns. Invalid data triggers error notifications.
- No company identifiers are included per task requirements.
- Responsive design is  implemented.

## Future Improvements
- Implement data export functionality.
- Enhance chart interactivity (e.g., zooming).
- Add loading states and error boundaries.

## Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>

2. Install dependencies:
   ```bash
   npm install
   
   
3. Run the development server:
   ```bash
   npm run dev



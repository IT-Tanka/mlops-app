import { createApp } from 'vue';
import App from './App.vue';

import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura'; // Theme preset

import 'primeflex/primeflex.css'; // PrimeFlex utility classes
import 'primeicons/primeicons.css'; // PrimeIcons for UI icons

import { createPinia } from 'pinia'; // State management
import ToastService from 'primevue/toastservice'; // Toast notifications

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});

app.use(createPinia());
app.use(ToastService);

app.mount('#app');

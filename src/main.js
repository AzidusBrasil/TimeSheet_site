import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App);
app.config.globalProperties.$API_URL = "https://timesheet-api-h9z9.onrender.com";
// app.config.globalProperties.$API_URL = "http://127.0.0.1:8000";
app.use(router).mount('#app');

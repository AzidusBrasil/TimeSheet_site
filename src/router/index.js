import { createRouter, createWebHistory } from 'vue-router'
import Graficos from '@/views/Graficos.vue'
import TimeSheet from '@/views/TimeSheet.vue'

const routes = [
  {
    path: '/',
    // name: 'timesheet',
    component: TimeSheet
  },
  {
    path: '/graficos',
    // name: 'graficos',
    component: Graficos
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import Graficos from '@/views/Graficos.vue'
import TimeSheet from '@/views/TimeSheet.vue'
import ConfigUser from '@/views/ConfigUser.vue'

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
  },
  {
    path: '/User',
    // name: 'graficos',
    component: ConfigUser
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
// Composables
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/plugins/supabase'

// import from base from vite compiler
const BASE_URL = import.meta.env.BASE_URL

const routes = [
  // Auth Route (Public)
  {
    path: BASE_URL + 'auth',
    name: 'auth',
    component: () => import('@/views/Auth.vue'),
    meta: { requiresAuth: false }
  },
  // Protected Routes
  {
    path: BASE_URL,
    component: () => import('@/layouts/default/Default.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
      },
      {
        path: 'instances',
        name: 'instances',
        component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue'),
      },
      {
        path: 'crm',
        name: 'crm',
        component: () => import(/* webpackChunkName: "crm" */ '@/views/CRM.vue'),
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import(/* webpackChunkName: "chat" */ '@/views/Chat.vue'),
      },
      {
        path: 'instance/:id',
        name: 'instance',
        component: () => import('@/views/Instance.vue'),
      }
    ],
  },
  // Documentation (Public)
  {
    path: BASE_URL + 'doc',
    component: () => import('@/layouts/doc/Index.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: ':doc',
        name: 'doc',
        component: () => import('@/views/Doc.vue'),
      },
      {
        path: '',
        name: 'doc.index',
        component: () => import('@/views/Doc.vue'),
      },
    ]
  },
  // Catch all - redirect to dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  const isAuthenticated = !!session

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if trying to access protected route
    next({ name: 'auth', query: { redirect: to.fullPath } })
  } else if (to.name === 'auth' && isAuthenticated) {
    // Redirect to dashboard if already logged in and trying to access auth page
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router


const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'search', component: () => import('pages/Index.vue') },
      { path: 'manage', name: 'manage', component: () => import('pages/Manage.vue') },
      { path: 'launch', name: 'launch', component: () => import('pages/Launch.vue') },
      { path: 'Job', name: 'Job', props: { jobId: '', jobType: 0 }, component: () => import('pages/Job.vue') }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes

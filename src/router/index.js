/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'


for (const route of routes) {
  if (route.name === '/main') {
    console.log(route);
    route.meta = route.meta || {};
    route.meta.requiresAuth = true;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes: setupLayouts,
  routes,
})

router.beforeEach((to, from, next) => {
  console.log('to.matched:', to.matched);
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');

  if (requiresAuth && !token) {
    next('/'); 
  } else if (token) {
    next();
    console.log("token valid")
  } else {
    console.log("don't need auth")
    next();
  }
});

export default router
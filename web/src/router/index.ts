// frontend/src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "dashboard",
    component: () => import("../views/DashboardView.vue"),
    meta: { title: "Dashboard" },
  },
  {
    path: "/posts",
    name: "posts",
    component: () => import("../views/PostsView.vue"),
    meta: { title: "Posts" },
  },
  {
    path: "/anomalies",
    name: "anomalies",
    component: () => import("../views/AnomaliesView.vue"),
    meta: { title: "Anomalías Detectadas" },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  document.title = `App Pharma - ${to.meta.title || "MVP"}`;
  next();
});

export default router;

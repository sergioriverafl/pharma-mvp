<script setup lang="ts">
import { ref, onMounted } from "vue";
import { usePosts } from "../composables/usePosts";
import { useAnomalies } from "../composables/useAnomalies";
import PlatformCard from "../components/PlatformCard.vue";
import StatCard from "../components/StatCard.vue";
import AnomalyPreview from "../components/AnomalyPreview.vue";


const { fetchPosts } = usePosts();
const { fetchAnomalies } = useAnomalies();

const loading = ref(true);
const stats = ref({
  totalPosts: 0,
  anomalies: 0,
  anomalyRate: 0,
  pending: 0,
  validated: 0,
});

const recentAnomalies = ref<any[]>([]);
const platforms : any = ref([
  { name: "MercadoLibre", posts: 0, anomalies: 0, status: "active" },
  { name: "Amazon", posts: 0, anomalies: 0, status: "inactive" },
  { name: "Facebook", posts: 0, anomalies: 0, status: "inactive" },
]);

onMounted(async () => {
  try {
    const [posts, anomalies] = await Promise.all([
      fetchPosts(),
      fetchAnomalies(),
    ]);

    stats.value = {
      totalPosts: posts.length,
      anomalies: anomalies.length,
      anomalyRate:
        posts.length > 0
          ? Math.round((anomalies.length / posts.length) * 100)
          : 0,
      pending: posts.filter((p: any) => p.status === "pending").length,
      validated: posts.filter((p: any) => p.status === "validated").length,
    };

    recentAnomalies.value = anomalies.slice(0, 3);

    // Platform stats
    platforms.value[0].posts = posts.filter(
      (p: any) => p.platform === "mercadolibre",
    ).length;
    platforms.value[0].anomalies = anomalies.filter(
      (a: any) => a.platform === "mercadolibre",
    ).length;
  } catch (error) {
    console.error("Error loading dashboard:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Signa Pharma</h1>
            <p class="mt-1 text-sm text-gray-500">
              Detección de productos farmacéuticos falsificados
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span class="text-sm text-gray-600">Sistema activo</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Posts Analizados"
          :value="stats.totalPosts"
          icon="📊"
          trend="+12% vs ayer"
          :loading="loading"
        />
        <StatCard
          title="Anomalías Detectadas"
          :value="stats.anomalies"
          icon="⚠️"
          :trend="`${stats.anomalyRate}%`"
          alert
          :loading="loading"
        />
        <StatCard
          title="Posts Pendientes"
          :value="stats.pending"
          icon="⏳"
          :loading="loading"
        />
        <StatCard
          title="Validados Hoy"
          :value="stats.validated"
          icon="✓"
          trend="+8 últimas 2h"
          :loading="loading"
        />
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Recent Anomalies -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">
              Anomalías Recientes
            </h2>
            <router-link
              to="/anomalies"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todas →
            </router-link>
          </div>
          <div v-if="loading" class="space-y-3">
            <div
              v-for="i in 3"
              :key="i"
              class="h-16 bg-gray-100 rounded animate-pulse"
            ></div>
          </div>
          <div
            v-else-if="recentAnomalies.length === 0"
            class="text-center py-8 text-gray-500"
          >
            No hay anomalías recientes
          </div>
          <div v-else class="space-y-3">
            <AnomalyPreview
              v-for="anomaly in recentAnomalies"
              :key="anomaly.id"
              :anomaly="anomaly"
            />
          </div>
        </div>

        <!-- Platform Activity -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            Actividad por Plataforma
          </h2>
          <div v-if="loading" class="space-y-3">
            <div
              v-for="i in 3"
              :key="i"
              class="h-16 bg-gray-100 rounded animate-pulse"
            ></div>
          </div>
          <div v-else class="space-y-4">
            <PlatformCard
              v-for="platform in platforms"
              :key="platform.name"
              :platform="platform"
            />
          </div>
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          to="/posts"
          class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-8 text-white hover:shadow-md transition-shadow group"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold mb-2">Ver Todos los Posts</h3>
              <p class="text-blue-100">
                Explora y filtra publicaciones analizadas
              </p>
            </div>
            <span
              class="text-4xl group-hover:translate-x-1 transition-transform"
              >→</span
            >
          </div>
        </router-link>

        <router-link
          to="/anomalies"
          class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm p-8 text-white hover:shadow-md transition-shadow group"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xl font-semibold mb-2">Revisar Anomalías</h3>
              <p class="text-red-100">
                Valida productos sospechosos detectados
              </p>
            </div>
            <span
              class="text-4xl group-hover:translate-x-1 transition-transform"
              >→</span
            >
          </div>
        </router-link>
      </div>
    </main>
  </div>
</template>

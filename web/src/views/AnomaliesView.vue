<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAnomalies } from "../composables/useAnomalies";
import AnomalyBadge from "../components/AnomalyBadge.vue";

const {
  anomalies,
  loading,
  fetchAnomalies,
  validateAnomaly: validate,
} = useAnomalies();

const filters = ref({
  severity: "",
  type: "",
  validated: "",
});

const filteredAnomalies = computed(() => {
  let result = anomalies.value;

  if (filters.value.severity) {
    result = result.filter((a) => a.severity === filters.value.severity);
  }

  if (filters.value.type) {
    result = result.filter((a) => a.type === filters.value.type);
  }

  if (filters.value.validated) {
    const validated = filters.value.validated === "true";
    result = result.filter((a) => a.validated === validated);
  }

  return result;
});

const pendingCount = computed(
  () => anomalies.value.filter((a) => !a.validated).length,
);

const highSeverityCount = computed(
  () => anomalies.value.filter((a) => a.severity === "high").length,
);

const mediumSeverityCount = computed(
  () => anomalies.value.filter((a) => a.severity === "medium").length,
);

const validatedCount = computed(
  () => anomalies.value.filter((a) => a.validated).length,
);

const validateAnomaly = async (id: string, isFake: boolean) => {
  await validate(id, isFake);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price);
};

onMounted(() => {
  fetchAnomalies();
});
</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <router-link
              to="/"
              class="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
            >
              ← Volver al Dashboard
            </router-link>
            <h1 class="text-3xl font-bold text-gray-900">
              Anomalías Detectadas
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              Revisa y valida productos farmacéuticos sospechosos
            </p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold text-red-600">
              {{ pendingCount }}
            </div>
            <div class="text-sm text-gray-500">Pendientes de validar</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Filters -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex flex-wrap gap-4">
          <select
            v-model="filters.severity"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas las severidades</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>

          <select
            v-model="filters.type"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            <option value="price">Precio sospechoso</option>
            <option value="packaging">Empaque irregular</option>
            <option value="seller">Vendedor no autorizado</option>
            <option value="description">Descripción sospechosa</option>
          </select>

          <select
            v-model="filters.validated"
            class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="false">Sin validar</option>
            <option value="true">Validadas</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="text-sm text-gray-500">Total Anomalías</div>
          <div class="text-2xl font-bold text-gray-900 mt-1">
            {{ anomalies.length }}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <div class="text-sm text-gray-500">Severidad Alta</div>
          <div class="text-2xl font-bold text-red-600 mt-1">
            {{ highSeverityCount }}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <div class="text-sm text-gray-500">Severidad Media</div>
          <div class="text-2xl font-bold text-yellow-600 mt-1">
            {{ mediumSeverityCount }}
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <div class="text-sm text-gray-500">Validadas</div>
          <div class="text-2xl font-bold text-green-600 mt-1">
            {{ validatedCount }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div class="animate-pulse space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAnomalies.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">✓</div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          No hay anomalías
        </h3>
        <p class="text-gray-500">
          {{
            filters.validated
              ? "Todas las anomalías han sido validadas"
              : "No se detectaron anomalías con estos filtros"
          }}
        </p>
      </div>

      <!-- Anomalies List -->
      <div v-else class="space-y-4">
        <div
          v-for="anomaly in filteredAnomalies"
          :key="anomaly.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <AnomalyBadge
                    :severity="anomaly.severity"
                    :type="anomaly.type"
                  />
                  <span class="text-sm text-gray-500">{{
                    anomaly.platform
                  }}</span>
                  <span class="text-sm text-gray-400">•</span>
                  <span class="text-sm text-gray-500">{{
                    formatDate(anomaly.detectedAt)
                  }}</span>
                </div>

                <h3 class="text-lg font-semibold text-gray-900 mb-2">
                  {{ anomaly.postTitle }}
                </h3>

                <div
                  class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
                >
                  <p class="text-sm font-medium text-red-900 mb-2">
                    Razón de la anomalía:
                  </p>
                  <p class="text-sm text-red-800">{{ anomaly.reason }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Precio:</span>
                    <span class="ml-2 font-semibold text-gray-900">{{
                      formatPrice(anomaly.price)
                    }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Vendedor:</span>
                    <span class="ml-2 font-semibold text-gray-900">{{
                      anomaly.seller
                    }}</span>
                  </div>
                </div>

                <div v-if="anomaly.confidence" class="mt-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Confianza IA:</span>
                    <div
                      class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-xs"
                    >
                      <div
                        class="h-full bg-red-600"
                        :style="{ width: `${anomaly.confidence}%` }"
                      ></div>
                    </div>
                    <span class="text-sm font-semibold text-gray-900"
                      >{{ anomaly.confidence }}%</span
                    >
                  </div>
                </div>
              </div>

              <div class="ml-6 flex flex-col gap-2">
                <button
                  v-if="!anomaly.validated"
                  @click="validateAnomaly(anomaly.id, true)"
                  class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmar Falso
                </button>
                <button
                  v-if="!anomaly.validated"
                  @click="validateAnomaly(anomaly.id, false)"
                  class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Marcar Legítimo
                </button>
                <span
                  v-else
                  class="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg text-center"
                >
                  ✓ Validado
                </span>

                <a
                  :href="anomaly.postUrl"
                  target="_blank"
                  class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  Ver Post →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

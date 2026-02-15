<script setup lang="ts">
import type { Post } from "../composables/usePosts";
interface Props {
  post: Post;
}

defineProps<Props>();
defineEmits<{
  (e: "click", post: Post): void;
  (e: "validate", postId: string): void;
}>();

const platformLabel: Record<string, string> = {
  mercadolibre: "MercadoLibre",
  amazon: "Amazon",
  facebook: "Facebook",
};

const statusLabel = {
  pending: "Pendiente",
  analyzed: "Analizado",
  validated: "Validado",
};

const statusBadge = {
  pending: "bg-yellow-100/90 text-yellow-700",
  analyzed: "bg-blue-100/90 text-blue-700",
  validated: "bg-green-100/90 text-green-700",
};

const severityLabel = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const severityBadge = {
  high: "bg-red-100/90 text-red-700",
  medium: "bg-yellow-100/90 text-yellow-700",
  low: "bg-blue-100/90 text-blue-700",
};

const typeLabel = {
  price: "Precio sospechoso",
  packaging: "Empaque irregular",
  seller: "Vendedor no autorizado",
  description: "Descripción sospechosa",
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
};
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    @click="$emit('click', post)"
  >
    <!-- Image -->
    <div class="relative aspect-square bg-gray-100">
      <img
        :src="post.imageUrl"
        :alt="post.title"
        class="w-full h-full object-cover"
      />

      <!-- Platform Badge -->
      <div class="absolute top-3 left-3">
        <span
          class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700 shadow-sm"
        >
          {{ platformLabel[post.platform] || post.platform }}
        </span>
      </div>

      <!-- Anomaly Badge -->
      <div
        v-if="post.hasAnomaly && post.anomalyDetails"
        class="absolute top-3 right-3"
      >
        <span
          :class="[
            'px-2 py-1 backdrop-blur-sm rounded text-xs font-medium shadow-sm',
            severityBadge[post.anomalyDetails.severity],
          ]"
        >
          ⚠️ {{ severityLabel[post.anomalyDetails.severity] }}
        </span>
      </div>

      <!-- Status Badge -->
      <div class="absolute bottom-3 left-3">
        <span
          :class="[
            'px-2 py-1 backdrop-blur-sm rounded text-xs font-medium shadow-sm',
            statusBadge[post.status],
          ]"
        >
          {{ statusLabel[post.status] }}
        </span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Title -->
      <h3
        class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
      >
        {{ post.title }}
      </h3>

      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ post.description }}
      </p>

      <!-- Price -->
      <div class="flex items-baseline gap-2 mb-3">
        <span class="text-2xl font-bold text-gray-900">
          {{ formatPrice(post.price) }}
        </span>
        <span
          v-if="post.hasAnomaly && post.anomalyDetails?.type === 'price'"
          class="text-xs text-red-600 font-medium"
        >
          Precio sospechoso
        </span>
      </div>

      <!-- Seller Info -->
      <div class="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
        <div
          class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-semibold text-gray-600"
        >
          {{ post.seller.name.charAt(0).toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ post.seller.name }}
          </p>
          <div v-if="post.seller.reputation" class="flex items-center gap-1">
            <span class="text-xs text-gray-500">Reputación:</span>
            <span
              :class="[
                'text-xs font-medium',
                post.seller.reputation >= 90
                  ? 'text-green-600'
                  : post.seller.reputation >= 70
                    ? 'text-yellow-600'
                    : 'text-red-600',
              ]"
            >
              {{ post.seller.reputation }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Anomaly Details -->
      <div
        v-if="post.hasAnomaly && post.anomalyDetails"
        class="bg-red-50 border border-red-200 rounded-lg p-3 mb-3"
      >
        <div class="flex items-start gap-2">
          <span class="text-red-600 text-sm">⚠️</span>
          <div class="flex-1">
            <p class="text-xs font-medium text-red-900 mb-1">
              {{ typeLabel[post.anomalyDetails.type] }}
            </p>
            <p class="text-xs text-red-700 line-clamp-2">
              {{ post.anomalyDetails.reason }}
            </p>
            <div class="mt-2 flex items-center gap-2">
              <span class="text-xs text-red-600">Confianza:</span>
              <div
                class="flex-1 h-1.5 bg-red-200 rounded-full overflow-hidden max-w-[100px]"
              >
                <div
                  class="h-full bg-red-600"
                  :style="{ width: `${post.anomalyDetails.confidence}%` }"
                ></div>
              </div>
              <span class="text-xs font-semibold text-red-900"
                >{{ post.anomalyDetails.confidence }}%</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="flex items-center justify-between text-xs text-gray-500">
        <div class="flex items-center gap-3">
          <span v-if="post.metadata?.views"
            >👁️ {{ formatNumber(post.metadata.views) }}</span
          >
          <span v-if="post.metadata?.sold"
            >✓ {{ post.metadata.sold }} vendidos</span
          >
        </div>
        <span>{{ formatDate(post.createdAt) }}</span>
      </div>

      <!-- Actions -->
      <div class="mt-4 flex gap-2">
        <a
          :href="post.postUrl"
          target="_blank"
          @click.stop
          class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Ver publicación →
        </a>
        <button
          v-if="post.hasAnomaly && post.status === 'analyzed'"
          @click.stop="$emit('validate', post.id)"
          class="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Validar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

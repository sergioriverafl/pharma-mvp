<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <PostCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      @click="handlePostClick(post)"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import PostCard from './PostCard.vue'
import type { Post } from '../composables/usePosts';

interface Props {
  posts: Post[]
}

const props = defineProps<Props>()
const router = useRouter()

const handlePostClick = (post: Post) => {
  // You can navigate to a detail view or open a modal
  console.log('Post clicked:', post)
  router.push(`/posts/${post.id}`)
}
</script>
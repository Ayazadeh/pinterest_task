<template>
  <div class="container">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @keyup.enter="performSearch"
        type="text"
        class="form-control"
        placeholder="Search images..."
      />
    </div>
    <ImageGrid v-if="pins.length" :pins="pins" />
    <div v-if="loading" class="text-center my-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>
    <div ref="sentinel" class="sentinel"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { useSearchStore } from '~/stores/search';
import ImageGrid from '~/components/ImageGrid.vue';

const searchStore = useSearchStore();
const searchQuery = ref(searchStore.query);
const pins = ref(searchStore.pins);
const loading = ref(false);
const error = ref<string | null>(null);
const sentinel = ref(null);

// Handle browser back button
onMounted(() => {
  window.addEventListener('popstate', handlePopState);
  
  observer.value = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (sentinel.value) {
    observer.value.observe(sentinel.value);
  }

  // Restore state on mount (back navigation)
  if (searchStore.query) {
    searchQuery.value = searchStore.query;
    pins.value = searchStore.pins;
    window.scrollTo(0, searchStore.scrollPosition);
  }
});

// Handle browser back button
const handlePopState = () => {
  if (searchStore.goBack()) {
    searchQuery.value = searchStore.query;
    pins.value = searchStore.pins;
    window.scrollTo(0, searchStore.scrollPosition);
  }
};

// Save scroll position before leaving
onBeforeUnmount(() => {
  window.removeEventListener('popstate', handlePopState);
  searchStore.saveScrollPosition(window.scrollY);
});

const performSearch = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Add to browser history
    window.history.pushState({}, '', `?q=${encodeURIComponent(searchQuery.value)}`);
    await searchStore.searchImages(searchQuery.value);
    pins.value = searchStore.pins;
  } catch (err) {
    error.value = 'Failed to fetch images. Please try again.';
  } finally {
    loading.value = false;
  }
};

const loadMore = async () => {
  if (searchStore.bookmark && !loading.value) {
    loading.value = true;
    error.value = null;

    try {

      await searchStore.loadMoreImages();

      pins.value = searchStore.pins;

    } catch (err) {
      error.value = 'Failed to load more images.';
    } finally {
      loading.value = false;
    }
  }
};

// Infinite scroll
const observer = ref<any>(null);

// Watch for store changes
watch(
  () => searchStore.pins,
  (newPins) => {
    pins.value = newPins;
  }
);
</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.sentinel {
  height: 10px;
}
</style>
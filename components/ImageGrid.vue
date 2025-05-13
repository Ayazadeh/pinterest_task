<template>
  <section class="image-grid">
    <div v-for="pin in pins" :key="pin.id" class="pin">
      <img
        :src="selectImageUrl(pin)"
        :alt="pin.description || 'Image'"
        loading="lazy"
        class="pin-image"
      />
      <div class="pin-content">
        <h3 class="pin-title">{{ pin.title }}</h3>
        <p class="pin-description">{{ pin.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Pin } from '~/types/pins';

defineProps<{
    pins: Pin[]
}>()

const selectImageUrl = (pin: Pin) => {
  const pixelRatio = window.devicePixelRatio || 1;
  
  // For high DPI displays, prefer larger images
  if (pixelRatio >= 2) {
    if (pin.images['736x']?.url) return pin.images['736x'].url;
    if (pin.images['474x']?.url) return pin.images['474x'].url;
  }
  
  // For standard displays, use medium or smaller images
  if (pin.images['474x']?.url) return pin.images['474x'].url;
  if (pin.images['236x']?.url) return pin.images['236x'].url;
  if (pin.images['170x']?.url) return pin.images['170x'].url;
  
  // Fallback to original if nothing else is available
  return pin.images['orig']?.url || '';
};
</script>

<style lang="scss" scoped>
.image-grid {
  column-count: 2;
  column-gap: 1rem;
  padding: 1rem;

  @media (min-width: 768px) {
    column-count: 3;
  }

  @media (min-width: 992px) {
    column-count: 4;
  }

  @media (min-width: 1200px) {
    column-count: 6;
  }
}

.pin {
  break-inside: avoid;
  margin-bottom: 1rem;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
}

.pin-image {
  width: 100%;
  height: auto;
  display: block;
}

.pin-content {
  padding: 0.75rem;
}

.pin-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #111;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pin-description {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
<template>
  <div class="image-grid">
    <div v-for="pin in pins" :key="pin.id" class="pin">
      <img
        :src="selectImageUrl(pin)"
        :alt="pin.description || 'Image'"
        loading="lazy"
        class="pin-image"
      />
    </div>
  </div>
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
}

.pin {
  break-inside: avoid;
  margin-bottom: 1rem;
}

.pin-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}
</style>
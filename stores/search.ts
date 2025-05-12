import { defineStore } from 'pinia';
import type { Pin } from '~/types/pins';



export const useSearchStore = defineStore('search', () => {
    const query = ref('')
    const pins = ref<Pin[]>([])
    const bookmark = ref<string | null>(null)
    const scrollPosition = ref(0)
 
    const searchImages = async (q: string) => {
      query.value = q;
      pins.value = [];
      bookmark.value = null;
      
      try {
        const response: { pins: Pin[], bookmark: string | null } = await $fetch('/api', {
          params: {
            q: query.value,
            limit: 10 
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });

        pins.value = response.pins;
        bookmark.value = response.bookmark || null;

      } catch (error) {
        throw new Error('API request failed');
      }
    }

    const loadMoreImages = async () => {
      if (!bookmark.value) return;
      try {
        const response: { pins: Pin[], bookmark: string | null } = await $fetch('/api', {
          params: {
            q: query.value,
            bookmark: bookmark.value,
            limit: 10,
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        pins.value = [...pins.value, ...response.pins];
        bookmark.value = response.bookmark || null;
      } catch (error) {
        throw new Error('API request failed');
      }
    }

    const saveScrollPosition = (position: number) => {
      scrollPosition.value = position;
    }

    return {
        query,
        pins,
        bookmark,
        scrollPosition,
        searchImages,
        loadMoreImages,
        saveScrollPosition,
        persist: true, // Persist state for back navigation
    }
});
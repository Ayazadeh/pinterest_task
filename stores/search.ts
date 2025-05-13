import { defineStore } from 'pinia';
import type { Pin } from '~/types/pins';

interface SearchHistoryItem {
  query: string;
  pins: Pin[];
  bookmark: string | null;
  scrollPosition: number;
}

export const useSearchStore = defineStore('search', () => {
    const query = ref('')
    const pins = ref<Pin[]>([])
    const bookmark = ref<string | null>(null)
    const scrollPosition = ref(0)
    const searchHistory = ref<SearchHistoryItem[]>([])
    const currentHistoryIndex = ref(-1)
 
    const searchImages = async (q: string) => {
      // Save current state to history before new search
      if (query.value) {
        searchHistory.value = searchHistory.value.slice(0, currentHistoryIndex.value + 1);
        searchHistory.value.push({
          query: query.value,
          pins: [...pins.value],
          bookmark: bookmark.value,
          scrollPosition: scrollPosition.value
        });
        currentHistoryIndex.value = searchHistory.value.length - 1;
      }

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
      // Update scroll position in history if we're viewing a historical state
      if (currentHistoryIndex.value >= 0) {
        searchHistory.value[currentHistoryIndex.value].scrollPosition = position;
      }
    }

    const goBack = () => {
      if (currentHistoryIndex.value > 0) {
        currentHistoryIndex.value--;
        const previousState = searchHistory.value[currentHistoryIndex.value];
        query.value = previousState.query;
        pins.value = previousState.pins;
        bookmark.value = previousState.bookmark;
        scrollPosition.value = previousState.scrollPosition;
        return true;
      }
      return false;
    }

    return {
        query,
        pins,
        bookmark,
        scrollPosition,
        searchHistory,
        currentHistoryIndex,
        searchImages,
        loadMoreImages,
        saveScrollPosition,
        goBack,
        persist: true,
    }
});
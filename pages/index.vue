<template>
	<div class="container-fluid">
		<div
			class="search-bar fixed-top bg-white shadow-sm py-3 px-4"
			style="z-index: 1000"
		>
			<div class="container">
				<input
					v-model="searchQuery"
					@keyup.enter="performSearch"
					type="text"
					class="form-control"
					placeholder="Search images..."
				/>
			</div>
		</div>
		<div class="mt-5 pt-4">
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
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from "vue";
import { useSearchStore } from "~/stores/search";
import ImageGrid from "~/components/ImageGrid.vue";

// Store
const searchStore = useSearchStore();

// State
const searchQuery = ref(searchStore.query);
const pins = ref(searchStore.pins);
const loading = ref(false);
const error = ref<string | null>(null);
const sentinel = ref(null);
const observer = ref<any>(null);

// Methods
const handlePopState = () => {
	if (searchStore.goBack()) {
		searchQuery.value = searchStore.query;
		pins.value = searchStore.pins;
		window.scrollTo(0, searchStore.scrollPosition);
	}
};

const performSearch = async () => {
	loading.value = true;
	error.value = null;

	try {
		// Add to browser history
		window.history.pushState({}, "", `?q=${encodeURIComponent(searchQuery.value)}`);
		await searchStore.searchImages(searchQuery.value);
		pins.value = searchStore.pins;
	} catch (err) {
		error.value = "Failed to fetch images. Please try again.";
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
			error.value = "Failed to load more images.";
		} finally {
			loading.value = false;
		}
	}
};

// Lifecycle
onMounted(() => {
	window.addEventListener("popstate", handlePopState);

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

onBeforeUnmount(() => {
	window.removeEventListener("popstate", handlePopState);
	searchStore.saveScrollPosition(window.scrollY);
});

// Watchers
watch(
	() => searchStore.pins,
	(newPins) => {
		pins.value = newPins;
	}
);
</script>

<style lang="scss" scoped>
.sentinel {
	height: 10px;
}
</style>

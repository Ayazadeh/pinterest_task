// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt'
  ],
  css: [
    '~/assets/scss/main.scss'
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          quietDeps: true
        }
      }
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        target: 'https://pingrid-api.fazlali.workers.dev',
        changeOrigin: true,
        prependPath: false,
      }
    }
  } 
})

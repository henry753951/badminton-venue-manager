import { AppPreset } from "./primevue.theme";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: "羽毛球場地預約系统",
    },
  },
  runtimeConfig: {
    auth_origin: process.env.AUTH_ORIGIN,
  },
  primevue: {
    components: {
      include: [],
    },
    options: {
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: ".dark",
        },
      },
    },
  },
  colorMode: {
    classPrefix: "",
    classSuffix: "",
    storageKey: "color-mode",
  },
  css: ["@unocss/reset/tailwind-compat.css"],
  ssr: false,
  auth: {
    originEnvKey: "NUXT_AUTH_ORIGIN",
    baseURL:
      process.env.NODE_ENV === "production"
        ? "https://je-badminton-venue-manager.hongyu.dev"
        : undefined,
    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: "google",
      addDefaultCallbackUrl: true,
    },
  },
  eslint: {
    config: {
      standalone: false,
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      route: "/_docs/openapi.json",
      meta: {
        title: "羽毛球場地預約系统",
        description: "羽毛球場地預約系统",
        version: "1.0",
      },
      ui: {
        scalar: {
          route: "/_docs/scalar",
        },
        swagger: {
          route: "/_docs/swagger",
        },
      },
    },
  },
  modules: [
    "@unocss/nuxt",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@pinia/nuxt",
    "@primevue/nuxt-module",
    "@sidebase/nuxt-auth",
    "@nuxtjs/color-mode",
  ],
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
});

import consola from "consola";
import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook("nitro:init", async (nuxt) => {
      const runtimeConfig = nuxt.options.runtimeConfig;
      const includes = ["auth_origin"];
      const filteredConfig = Object.fromEntries(
        Object.entries(runtimeConfig).filter(([key]) => includes.includes(key)),
      );

      consola.info("Runtime Config :\n" + JSON.stringify(filteredConfig, null, 2));
      // ENV
      const env = {
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_ORIGIN: process.env.AUTH_ORIGIN,
        LINE_CLIENT_ID: process.env.LINE_CLIENT_ID,
        LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
      };

      consola.info("ENV :\n" + JSON.stringify(env, null, 2));
    });
  },
});

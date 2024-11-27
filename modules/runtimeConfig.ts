import consola from "consola";
import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook("nitro:init", async (nuxt) => {
      const runtimeConfig = nuxt.options.runtimeConfig;
      const includes = [
        "auth_secret",
        "auth_origin",
        "line_client_id",
        "line_client_secret",
        "google_client_id",
        "google_client_secret",
        "discord_client_id",
        "discord_client_secret",
        "db_url",
      ];
      const filteredConfig = Object.fromEntries(
        Object.entries(runtimeConfig).filter(([key]) => includes.includes(key))
      );

      consola.info(
        "Runtime Config :\n" + JSON.stringify(filteredConfig, null, 2)
      );
    });
  },
});

import { defineStore } from "pinia";
import type {
  RouteLocationAsPathGeneric,
  RouteLocationAsRelativeGeneric,
} from "vue-router";

export const useBreadcrumbStore = defineStore({
  id: "BreadcrumbStore",
  state: () => ({
    breadcrumbs: [] as {
      label: string;
      route:
        | string
        | RouteLocationAsRelativeGeneric
        | RouteLocationAsPathGeneric
        | undefined;
    }[],
  }),
  actions: {},
});

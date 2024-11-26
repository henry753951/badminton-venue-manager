export default defineNuxtRouteMiddleware((to, from) => {
  const breadcrumbStore = useBreadcrumbStore();
  if (["home"].includes(to.name?.toString() || "")) {
    breadcrumbStore.breadcrumbs = [];
  }
});

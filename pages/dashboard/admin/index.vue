<template>
  <div></div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: "dashboard-admin",
});

// Lifecycle Hooks
onMounted(() => {
  const breadcrumbStore = useBreadcrumbStore();
  breadcrumbStore.breadcrumbs = [
    {
      label: "首頁",
      route: { name: "home" },
    },
    {
      label: "管理後台",
      route: { name: "dashboard" },
    },
    {
      label: "管理員",
      route: undefined,
    },
  ];
});
</script>

<style></style>

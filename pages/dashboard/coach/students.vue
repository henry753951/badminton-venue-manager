<template>
  <div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: "dashboard-coach-students",
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
      label: "教練",
      route: undefined,
    },
    {
      label: "學員",
      route: undefined,
    },
  ];
});
</script>

<style>

</style>
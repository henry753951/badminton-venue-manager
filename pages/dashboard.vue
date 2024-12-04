<template>
  <div
    flex-grow
    flex-col
    flex
  >
    <NuxtPage> </NuxtPage>
  </div>
</template>

<script lang="ts" setup>
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
      route: undefined,
    },
  ];
});
</script>

<style></style>

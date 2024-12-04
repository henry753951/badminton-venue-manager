<template>
  <div
    flex-grow
    flex
    flex-col
    p-4
    gap-4
    overflow-clip
  >
    <div
      mx-auto
      text-xl
      font-bold
    >
      請選擇您的身分
    </div>
    <div
      flex
      flex-col
      md:flex-grow
      md:flex-row
      gap-4
    >
      <div
        w-full
        flex-grow
        flex-center
        py-4
        class="hover-effect bg-gray-100 dark:bg-dark-100"
        @click="select('admin')"
      >
        <!-- 管理員 -->
        管理員
      </div>
      <div
        w-full
        flex-grow
        flex-center
        py-4
        class="hover-effect bg-gray-100 dark:bg-dark-100"
        @click="select('coach')"
      >
        <!-- 教練 -->
        教練
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: "dashboard",
});

// Methods
const select = (role: string) => {
  if (role === "admin") {
    navigateTo({
      name: "dashboard-admin",
    });
  } else {
    navigateTo({
      name: "dashboard-coach-lessons",
    });
  }
};


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

<style scoped>
.hover-effect {
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0);
  transition: all 0.3s ease;
  cursor: pointer;
}

.dark .hover-effect:hover {
  box-shadow: 0 0 5px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.hover-effect:hover {
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}
</style>

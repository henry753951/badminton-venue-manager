<template>
  <div
    container
    mx-auto
  >
    <Card
      v-for="lesson in lessonsData"
      p-5
    >
      <template #header>
        <div class="flex flex-col">
          <div class="text-lg font-bold">
            {{ lesson.title }}
          </div>
          <div class="flex gap-2">
            <div
              v-for="coach in lesson.coaches"
              class="flex-center bg-light-6 py-3 px-3 rounded-full"
            >
              <Avatar
                shape="circle"
                class="mr-2"
                :label="coach.avatar_url ? undefined : (coach?.name?.[0] ?? '')"
                :image="coach.avatar_url || undefined"
              />
              <span>{{ coach.name }}</span>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  name: "dashboard-coach-lessons",
});
// States

const { lessonsData } = await useApi().fetchLessons({ userId: ref("me"), filter: ref(undefined) });

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
      label: "課程列表",
      route: undefined,
    },
  ];
});
</script>

<style></style>

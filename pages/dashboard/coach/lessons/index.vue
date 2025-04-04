<template>
  <div class="container mx-auto">
    <div flex flex-col gap-3>
      <NuxtLink v-for="lesson in lessonsData" :to="{
        name: 'dashboard-coach-lesson-detail',
        params: { lessonId: lesson.id },
      }">
        <Card>
          <template #content>
            <div class="flex justify-between">
              <div class="text-lg font-bold flex items-center gap-2">
                <p>{{ lesson.title }}</p>
                <Badge severity="info">
                  {{ format(lesson.timeSlot.date, "yyyy/MM/dd") }}
                </Badge>
              </div>
              <div class="flex gap-2">
                <div v-for="coach in lesson.coaches.slice(0, 2)"
                  class="flex-center bg-light-6 dark:bg-dark-4 py-3 px-3 rounded-full">
                  <Avatar shape="circle" class="mr-2" :label="coach.avatar_url ? undefined : (coach?.name?.[0] ?? '')"
                    :image="coach.avatar_url || undefined" />
                  <span>{{ coach.name }}</span>
                </div>
                <div class="flex-center bg-light-6 dark:bg-dark-4 py-3 px-3 rounded-full"
                  v-if="lesson.coaches.length > 2">
                  {{ `+${lesson.coaches.length - 2}` }}
                </div>
              </div>
            </div>
            <!-- content -->
            <div style="white-space: pre-wrap" flex gap-2 mt-2>
              <p>{{ lesson.description }}</p>
            </div>
          </template>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { format } from "date-fns";

definePageMeta({
  name: "dashboard-coach-lessons",
});
// States

const { lessonsData } = await useApi().fetchLessons({
  coachId: ref("me"), userId: ref(undefined),
  filter: ref(undefined)
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
      label: "課程列表",
      route: undefined,
    },
  ];
});
</script>

<style></style>

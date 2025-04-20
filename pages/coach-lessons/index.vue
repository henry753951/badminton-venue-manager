<template>
  <div class="container mx-auto px-4">
    <h1 class="text-xl font-bold text-gray-800 dark:text-white my-3">
      教練課程
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="lesson in lessonsData"
        :key="lesson.id"
        class="relative backdrop-blur-sm"
        @click="enroll(lesson.id)"
      >
        <template #title>
          <div
            flex
            items-center
            gap-3
          >
            <p>{{ lesson.title }}</p>
            <p>
              {{ format(lesson.timeSlot.date, "yyyy-MM-dd") }}
            </p>
          </div>
        </template>
        <template #subtitle>
          <div
            flex
            items-center
            mb-2
          >
            <Icon
              name="heroicons-solid:clock"
              class="mr-2"
            />
            {{ lesson.timeSlot.startTime }} - {{ lesson.timeSlot.endTime }}
          </div>
          <div
            flex
            items-center
            gap-2
          >
            <Badge>{{ lesson.timeSlot.court.location }}</Badge>
            <div>
              {{ lesson.timeSlot.court.name }}
            </div>
          </div>
        </template>
        <template #content>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";

definePageMeta({
  name: "coachLessons",
});

// Composables
const breadcrumbStore = useBreadcrumbStore();

// State
const { lessonsData } = await useApi().fetchLessons({
  coachId: ref(undefined),
  userId: ref(undefined),
  filter: ref(undefined),
});

// Methods
const enroll = (lessonId: string) => {
  // 呼叫 API 選課
  navigateTo({
    name: "coachLesson-detail",
    params: { lessonId },
  });
};

// Lifecycle Hooks
onMounted(async () => {
  breadcrumbStore.breadcrumbs = [
    {
      label: "首頁",
      route: { name: "home" },
    },
    {
      label: "教練課程",
      route: undefined,
    },
  ];
});
</script>

<style scoped>
/* 可選擇性添加自定義樣式 */
</style>

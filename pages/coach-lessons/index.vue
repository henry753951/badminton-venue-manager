<template>
  <div class="min-h-screen container mx-auto px-4">
    <h1 class="text-xl font-bold text-gray-800 dark:text-white my-3">
      教練課程
    </h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="lesson in lessons"
        :key="lesson.id"
        class="relative backdrop-blur-sm"
      >
        <template #title>
          <div
            flex
            items-center
            gap-3
          >
            <p>{{ lesson.title }}</p>
            <span text-sm>{{ lesson.date }}</span>
          </div>
        </template>
        <template #subtitle>
          <div
            flex
            items-center
            gap-3
          >
            <span>{{ lesson.time_slot }}</span>
            <Badge>{{ lesson.court }}</Badge>
          </div>
        </template>
        <template #content>
          <p class="text-gray-600 dark:text-gray-300">
            {{ lesson.description }}
          </p>
          <div
            flex
            gap-2
            mt-4
          >
            <Button
              label="預約課堂"
              class="w-full"
              @click="enroll(lesson.id)"
            />
            <Button @click="enroll(lesson.id)">
              <Icon
                name="material-symbols:emoji-people"
                size="2rem"
              />
              <p>5</p>
            </Button>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composables
const breadcrumbStore = useBreadcrumbStore();

// State
const lessons = ref([
  {
    id: "1",
    title: "羽球加強班",
    court: "球場 A",
    description: "這是一個羽球加強班，歡迎加入。",
    date: "2024-05-20",
    time_slot: "09:00-11:00",
  },
]);

// Methods
const enroll = (lessonId: string) => {
  // 呼叫 API 選課
  console.log(`選擇課堂 ID: ${lessonId}`);
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

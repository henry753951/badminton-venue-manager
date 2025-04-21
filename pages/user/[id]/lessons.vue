<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useFetch } from "@vueuse/core";

// 定義課程類型
interface Lesson {
    id: string;
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    court: {
        name: string;
    };
}

// 獲取路由參數
const route = useRoute();
const userId = route.params.id as string;

// 定義響應式變量
const { lessonsData: lessons, status } = await useApi().fetchLessons({
    userId: ref(userId),
    coachId: ref(undefined),
    filter: ref(undefined),
});

const goTo = (lessonId: string) => {
    navigateTo({ name: "coachLesson-detail", params: { lessonId: lessonId } });
};

</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">
      {{ userId === "me" ? "我的課程" : `用戶 ${userId} 的課程` }}
    </h1>
    <div
      v-if="status === 'pending'"
      class="text-center text-gray-500"
    >
      載入中...
    </div>
    <ul
      v-else
      class="space-y-4"
    >
      <template
        v-for="lesson in lessons"
        :key="lesson.id"
      >
        <div
          @click="goTo(lesson.id)"
          class="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-zinc-800 dark:border-zinc-700"
        >
          <h2 class="text-lg font-semibold text-primary mb-2">
            {{ lesson.title }}
          </h2>
          <p class="text-gray-600 mb-2 dark:text-gray-400">
            {{ lesson.description }}
          </p>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <p>時間: {{ lesson.timeSlot.startTime }} - {{ lesson.timeSlot.endTime }}</p>
            <p>球場: {{ lesson.timeSlot.court.name }}</p>
          </div>
        </div>
      </template>
    </ul>
  </div>
</template>
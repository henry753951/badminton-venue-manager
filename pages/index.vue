<template>
  <div class="min-h-screen flex flex-col dark:bg-dark-900">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white/80 dark:bg-dark-800/80 backdrop-blur-md">
      <div class="container mx-auto p-4">
        <nav class="flex-center space-x-6">
          <a
            href="#features"
            class="text-dark-700 dark:text-gray-200 hover:text-primary-600 transition"
          >功能</a>
          <a
            href="#news"
            class="text-dark-700 dark:text-gray-200 hover:text-primary-600 transition"
          >最新消息</a>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      class="container mx-auto grid md:grid-cols-2 items-center py-20 gap-12 px-5 relative overflow-clip"
    >
      <div z-5>
        <h2 class="text-5xl font-extrabold mb-6 text-dark-800 dark:text-gray-100">
          明新科大<br />羽球場地管理系統
        </h2>
        <p class="text-xl mb-8 text-dark-600 dark:text-gray-300">
          全方位的羽球場地管理解決方案，輕鬆掌握場地預約、學員管理和課程安排
        </p>
        <div class="flex space-x-4">
          <NuxtLink :to="{ name: 'timeSlots-courts' }">
            <Button label="場地租借" />
          </NuxtLink>
          <NuxtLink :to="{ name: 'coachLessons' }">
            <Button
              text
              label="教練課程"
            />
          </NuxtLink>
        </div>
      </div>
      <div
        class="md:hidden absolute w-full h-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm z-2"
      ></div>
      <div class="md:relative absolute">
        <img
          src="https://images.1111.com.tw/discussPic/33/53367733_136650293.728179.jpg"
          class="w-full md:rounded-2xl md:shadow-2xl"
        />
      </div>
    </section>

    <!-- Features Section -->
    <section
      id="features"
      class="bg-primary-50 dark:bg-dark-800 py-20"
    >
      <div class="container mx-auto text-center">
        <h3 class="text-4xl font-bold mb-12 text-dark-800 dark:text-gray-100">
          我們的核心功能
        </h3>
        <div class="grid grid-cols-3 gap-8">
          <div
            class="bg-white dark:bg-dark-700 p-6 rounded-2xl shadow-lg"
            v-for="feature in features"
          >
            <i class="pi pi-calendar text-4xl text-primary-600 mb-4 block"></i>
            <h4 class="text-xl font-semibold mb-3 dark:text-gray-200">
              {{ feature.title }}
            </h4>
            <p class="text-dark-600 dark:text-gray-400">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- News Section -->
    <section
      id="news"
      class="container mx-auto py-20"
    >
      <h3 class="text-4xl font-bold mb-12 text-center text-dark-800 dark:text-gray-100">
        最新消息
      </h3>
      <div class="grid grid-cols-3 gap-8">
        <Card
          v-for="news in newsList"
          :key="news.id"
          class="shadow-lg overflow-clip"
        >
          <template #header>
            <img
              :src="news.image_url || 'https://placehold.co/600x400/EEE/31343C'"
              :alt="news.title"
              class="w-full h-48 object-cover"
            />
          </template>
          <template #title>
            {{ news.title }}
          </template>
          <template #content>
            <p>{{ news.summary }}</p>
          </template>
          <template #footer>
            <Button
              text
              label="閱讀更多"
              @click="$router.push(`/news/${news.id}`)"
            />
          </template>
        </Card>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-primary-50 dark:bg-dark-800 py-12">
      <div class="container mx-auto text-center">
        <p class="text-dark-600 dark:text-gray-400">
          © 2024 羽球場地管理系統. 版權所有
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ name: "home" });

import { ref } from "vue";
import Button from "primevue/button";
import Card from "primevue/card";
import { useApi } from "~/composables/useApi";

const { fetchNews } = useApi();
const { status, newsData } = await fetchNews();

const newsList = computed(() => newsData.value || []);
const features = ref([
  {
    title: "場地出租",
    description: "隨時隨地預約羽球場地，輕鬆安排您的運動時光",
  },
  {
    title: "教練課程",
    description: "管理您的羽球課程，提供學員報名和教練指派功能",
  },
  {
    title: "會員管理",
    description: "輕鬆管理會員資料，提供會員註冊和登入功能",
  },
]);
</script>

<style>
/* 可以添加一些全局樣式 */
body {
  @apply transition-colors duration-300;
}
</style>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div class="p-4">
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
      <div
        v-if="newsList.length === 0"
        class="text-center text-gray-500 py-8"
      >
        查無最新消息
      </div>
    </div>
    <div class="p-4">
      <Card class="shadow-lg overflow-clip">
        <template #title>
          創建最新消息
        </template>
        <template #content>
          <div class="flex flex-col gap-4">
            <InputText
              v-model="formData.title"
              placeholder="標題"
              class="w-full"
            />
            <Textarea
              v-model="formData.summary"
              placeholder="摘要"
              class="w-full"
            />
            <Textarea
              v-model="formData.content"
              placeholder="內容"
              class="w-full"
            />
            <InputText
              v-model="formData.image"
              placeholder="Image URL"
              class="w-full"
            />
          </div>
        </template>
        <template #footer>
          <Button
            label="創建"
            @click="handleCreate"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useApi } from "~/composables/useApi";
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

const { fetchNews } = useApi();
const { status, newsData } = await fetchNews();

const newsList = computed(() => newsData.value || []);

const { createNews } = useApi();
const auth = useAuth();

const isAdmin = computed(() => auth.data.value?.user?.roles?.includes("admin"));
const formData = ref({
  title: "",
  summary: "",
  content: "",
  image: "",
});

const handleCreate = async () => {
  if (!isAdmin.value) {
    alert("無權限");
    return;
  }
  const { status, error } = await createNews(formData.value);
  if (status.value === "success") {
    navigateTo("/news");
  } else {
    console.error("Create failed:", error);
  }
};
</script>

<style></style>

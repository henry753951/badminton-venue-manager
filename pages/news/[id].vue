<script setup lang="ts">
import { useApi } from "~/composables/useApi";

const route = useRoute();
const newsId = route.params.id as string;
const { fetchNewsItem, updateNews, deleteNews } = useApi();
const auth = useAuth(); // Assuming user object with roles

const { status, newsItemData, refresh } = await fetchNewsItem(newsId);

const isAdmin = computed(() => auth.data.value?.user?.roles?.includes("admin"));

const editing = ref(false);
const formData = ref({
  title: newsItemData.value?.title || "",
  summary: newsItemData.value?.summary || "",
  content: newsItemData.value?.content || "",
  image: newsItemData.value?.image_url || "",
});

const handleUpdate = async () => {
  const { status, error } = await updateNews(newsId, formData.value);
  if (status.value === "success") {
    editing.value = false;
    refresh();
  } else {
    console.error("Update failed:", error);
  }
};

const handleDelete = async () => {
  if (confirm("確定要刪除此消息嗎？")) {
    const { status, error } = await deleteNews(newsId);
    if (status.value === "success") {
      navigateTo("/news");
    } else {
      console.error("Delete failed:", error);
    }
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
</script>

<template>
  <div v-if="status === 'pending'">
    加載中...
  </div>
  <div v-else-if="status === 'error'">
    加載失敗
  </div>
  <div v-else>
    <div
      class="relative mb-4 shadow-lg h-48"
      :style="{
        backgroundImage: `url(${newsItemData?.image_url || 'https://placehold.co/600x400/EEE/31343C'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    >
      <div
        class="w-full h-full"
        style="background-color: rgba(0, 0, 0, 0.5)"
      >
        <div
          class="mx-auto container flex items-end h-full text-white text-2xl font-bold py-5 px-2 justify-between"
        >
          <div v-if="editing">
            <InputText
              v-model="formData.title"
              class="w-full"
            />
          </div>
          <div v-else>
            <div class="flex items-center gap-2">
              <div>{{ newsItemData?.title }}</div>
              <div class="text-sm text-gray-300 mt-2">
                {{ formatDate(newsItemData!.created_at) }}
              </div>
            </div>
            <div class="text-sm text-gray-300 mt-2">
              {{ newsItemData?.summary }}
            </div>
          </div>
          <div>
            <div
              v-if="isAdmin"
              class="flex gap-2"
            >
              <Button
                v-if="!editing"
                label="編輯"
                @click="editing = true"
              />
              <Button
                v-if="editing"
                label="保存"
                @click="handleUpdate"
              />
              <Button
                v-if="editing"
                label="取消"
                @click="editing = false"
              />
              <Button
                label="刪除"
                severity="danger"
                @click="handleDelete"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-2">
      <div v-if="editing">
        <Textarea
          v-model="formData.summary"
          class="w-full"
        />
        <Textarea
          v-model="formData.content"
          class="w-full mt-2"
        />
        <InputText
          v-model="formData.image"
          placeholder="Image URL"
          class="w-full mt-2"
        />
      </div>
      <div v-else>
        <p class="mt-2">
          {{ newsItemData?.content }}
        </p>
      </div>
    </div>
  </div>
</template>

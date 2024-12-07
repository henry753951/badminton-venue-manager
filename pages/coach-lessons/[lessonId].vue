<template>
  <div
    mx-auto
    container
    p-2
    class="dark:bg-dark-900 transition-colors duration-300"
  >
    <div
      class="flex justify-between items-center py-6"
      v-if="lessonData"
    >
      <h1 class="text-2xl font-bold dark:text-white">
        {{ lessonData.title }}
      </h1>
      <Button @click="handleSignUp">
        <p px-4>
          報名
        </p>
      </Button>
    </div>
    <div class="flex h-full gap-3 flex-wrap md:flex-nowrap">
      <!-- Left Side: Lesson Details -->
      <div
        class="w-full"
        v-if="lessonData"
      >
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6">
          <div class="mb-4">
            <p class="mb-2">
              課程描述
            </p>
            <div
              class="bg-gray-50 dark:bg-dark-700 p-4 rounded-md"
              style="white-space: pre-wrap"
            >
              {{ lessonData.description || "暫無課程描述" }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm">
                時間段
              </p>
              <div class="font-medium">
                <Badge>{{ formatDate(lessonData.timeSlot.date) }}</Badge>
                <p>{{ lessonData.timeSlot.startTime }} - {{ lessonData.timeSlot.endTime }}</p>
              </div>
            </div>
            <div>
              <p class="text-sm">
                場地
              </p>
              <div class="font-medium">
                <p>{{ lessonData.timeSlot.court.name }}</p>
                <p class="text-sm">
                  {{ lessonData.timeSlot.court.location }}
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm">
                最後更新
              </p>
              <p class="font-medium">
                {{
                  lessonData.updated_at ? new Date(lessonData.updated_at).toLocaleString() : "未知"
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Students and Coaches Lists -->
      <div
        class="md:w-1/3 min-w-[300px] w-full"
        v-if="lessonData"
      >
        <!-- Coaches Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6 mb-3">
          <h2 class="text-xl font-semibold mb-4">
            教練清單
          </h2>
          <div
            v-if="lessonData.coaches.length"
            class="space-y-3"
          >
            <div
              v-for="coach in lessonData.coaches"
              :key="coach.id"
              class="flex items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-md"
            >
              <img
                :src="coach.avatar_url || '/default-avatar.png'"
                :alt="coach.name || '教練'"
                class="w-10 h-10 rounded-full mr-4"
              />
              <div class="overflow-hidden">
                <p
                  class="font-medium overflow-hidden text-ellipsis"
                  :title="coach.name || '教練'"
                >
                  {{ coach.name || "未知教練" }}
                </p>
                <p
                  class="text-sm overflow-hidden text-ellipsis"
                  :title="coach.email"
                >
                  <a :href="'mailto:' + coach.email">{{ coach.email }}</a>
                </p>
              </div>
            </div>
          </div>
          <p
            v-else
            class="text-dark-500 dark:text-dark-400 text-center"
          >
            尚無指派教練
          </p>
        </div>

        <!-- Students Section -->
        <div class="bg-white dark:bg-dark-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold mb-4">
            學生清單
          </h2>
          <div
            v-if="lessonData.students.length"
            class="space-y-3"
          >
            <div
              v-for="student in lessonData.students"
              :key="student.id"
              class="flex items-center bg-gray-50 dark:bg-dark-700 p-3 rounded-md"
            >
              <img
                :src="student.avatar_url || '/default-avatar.png'"
                :alt="student.name || '學生'"
                class="w-10 h-10 rounded-full mr-4"
              />
              <div class="overflow-hidden">
                <p class="font-medium overflow-hidden text-ellipsis">
                  {{ student.name || "未知學生" }}
                </p>
                <p class="text-sm overflow-hidden text-ellipsis">
                  {{ student.email }}
                </p>
              </div>
            </div>
          </div>
          <p
            v-else
            class="text-center"
          >
            尚無學生報名
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  name: "coachLesson-detail",
});

// States
const lessonId = ref(useRoute().params.lessonId as string);
const { lessonData } = await useApi().fetchLesson(lessonId);

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
};

const handleSignUp = async () => {
  const toast = usePVToastService();
  const { status, data } = await useApi().signUpLesson(lessonId.value);
  if (data?.code === "error") {
    toast.add({
      severity: "error",
      summary: "報名失敗",
      detail: data.msg,
    });
  } else {
    toast.add({
      severity: "success",
      summary: "報名成功",
      detail: "已成功報名課程",
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
      label: "教練課程",
      route: { name: "coachLessons" },
    },
    {
      label: lessonData.value?.title || "課程詳情",
      route: undefined,
    },
  ];
});
</script>

<style scoped></style>

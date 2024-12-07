import { BookingDialog } from '../../../../.nuxt/components';
<template>
  <div
    mx-auto
    container
    px-2
  >
    <div
      class="flex justify-between items-center py-6"
      v-if="lessonData"
    >
      <h1 class="text-2xl font-bold dark:text-white">
        {{ lessonData.title }}
      </h1>
      <div
        flex
        gap-2
      >
        <Button
          severity="danger"
          @click="deleteLesson"
        >
          <p px-4>
            刪除
          </p>
        </Button>
        <Button
          @click="lessonEditDialogRef.open(lessonData.id)"
          severity="primary"
        >
          <p px-4>
            編輯
          </p>
        </Button>
      </div>
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
                <p class="text-sm">
                  [{{ lessonData.timeSlot.court.location }}] {{ lessonData.timeSlot.court.name }}
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
                <a
                  class="text-sm overflow-hidden text-ellipsis"
                  :title="coach.email"
                  :href="'mailto:' + coach.email"
                >
                  {{ coach.email }}
                </a>
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
              class="flex items-center bg-dark-50 dark:bg-dark-700 p-3 rounded-md"
            >
              <img
                :src="student.avatar_url || '/default-avatar.png'"
                :alt="student.name || '學生'"
                class="w-10 h-10 rounded-full mr-4"
              />
              <div>
                <p class="font-medium">
                  {{ student.name || "未知學生" }}
                </p>
                <p class="text-sm text-dark-500">
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
    <LessonEditDialog
      ref="lessonEditDialogRef"
      @on-submit="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import type { LessonEditDialog } from "#build/components";

definePageMeta({
  name: "dashboard-coach-lesson-detail",
});

// States
const lessonId = ref(useRoute().params.lessonId as string);
const { lessonData, refresh } = await useApi().fetchLesson(lessonId);

const lessonEditDialogRef = ref<InstanceType<typeof LessonEditDialog> | null>(null);

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

const deleteLesson = async (event: MouseEvent) => {
  const confirm = usePVConfirmService();
  confirm.require({
    target: event.target as HTMLElement,
    message: "確定要刪除此課程嗎？",
    acceptProps: {
      label: "刪除",
    },
    rejectProps: {
      label: "取消",
      severity: "secondary",
      outlined: true,
    },
    accept: async () => {
      await useApi().deleteLesson(lessonId.value);
      await navigateTo({ name: "dashboard-coach-lessons" });
    },
  });
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
      route: { name: "dashboard" },
    },
    {
      label: "教練",
      route: undefined,
    },
    {
      label: "課程列表",
      route: { name: "dashboard-coach-lessons" },
    },
    {
      label: lessonData.value?.title || "課程",
      route: undefined,
    },
  ];
});
</script>

<style scoped></style>

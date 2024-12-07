<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :style="{ width: '50rem' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap">{{ "教練課程修改" }}</span>
      </div>
    </template>
    <div class="mb-4">
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">日期</label>
        <span>{{ lesson.date }}</span>
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">場地</label>
        <span class="flex-center gap-2">{{ courtData?.name }} <Badge severity="secondary">{{ courtData?.location }}</Badge></span>
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label
          for="startTime"
          class="font-semibold w-24"
        > 開始時間 </label>
        {{ lesson.startTime }}
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label
          for="endTime"
          class="font-semibold w-24"
        > 結束時間 </label>
        {{ lesson.endTime }}
      </div>
    </div>

    <div class="flex gap-4 items-center mb-4">
      <label class="font-semibold w-24">課程標題</label>
      <InputText
        v-model="lesson.title"
        placeholder="請輸入課程標題"
        class="flex-auto"
      />
    </div>
    <div class="flex gap-4">
      <label class="font-semibold w-24 pt-1">課程內容</label>
      <Textarea
        v-model="lesson.content"
        placeholder="請輸入課程內容"
        class="flex-auto"
      />
    </div>

    <template #footer>
      <div
        flex
        items-center
        justify-between
        w-full
      >
        <div class="flex-center bg-light-6 dark:bg-dark-4 py-3 px-3 rounded-full">
          <Avatar
            shape="circle"
            class="mr-2"
            :label="
              auth.data.value?.user.avatar_url
                ? undefined
                : (auth.data.value?.user?.name?.[0] ?? '')
            "
            :image="auth.data.value?.user.avatar_url || undefined"
          />
          <span>{{ auth.data.value?.user.name }}</span>
        </div>
        <div
          flex
          gap-3
        >
          <Button
            label="取消"
            text
            severity="secondary"
            @click="visible = false"
          />
          <Button
            :loading="isSubmitting"
            :label="'確認修改'"
            @click="confirm.lessonUpdate()"
            :disabled="!canSubmit || isSubmitting"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import { format } from "date-fns";
const visible = defineModel<boolean>("visible");

const props = defineProps({
  dayStartTime: {
    type: Number,
    default: 6,
  },
  dayEndTime: {
    type: Number,
    default: 23,
  },
});

const emits = defineEmits(["onSubmit"]);
// Composables
const auth = useAuth();

// States
const lessonId = ref("");
const isSubmitting = ref(false);
const courtData = ref(null as { id: string; name: string; location: string } | null);

const lesson = ref({
  date: "",
  title: "",
  content: "",
  startTime: "",
  endTime: "",
});

const canSubmit = computed(() => {
  const lessonValid = lesson.value.title;
  return lessonValid;
});

// Methods
const confirm = {
  lessonUpdate: async () => {
    if (!canSubmit.value) return;

    const lessonData = {
      courtId: courtData.value?.id || "",
      title: lesson.value.title,
      description: lesson.value.content,
    };
    // Call API to confirm lesson update
    isSubmitting.value = true;
    const { status, data } = await useApi().updateLesson(lessonId.value, lessonData);
    if (data?.code === "success") {
      visible.value = false;
      reset();
      emits("onSubmit");
    } else {
      isSubmitting.value = false;
    }
  },
};

// Exposed methods
const open = async (id: string) => {
  const toast = usePVToastService();
  const auth = useAuth();
  if (auth.status.value !== "authenticated") {
    toast.add({
      severity: "info",
      summary: "請先登入",
      detail: "請先登入，才能進行租借或課程預約",
      life: 5000,
    });
    return;
  }
  lessonId.value = id;
  const { lessonData } = await useApi().fetchLesson(lessonId);
  if (lessonData.value) {
    reset();
    lesson.value.title = lessonData.value.title;
    lesson.value.content = lessonData.value.description || "";
    courtData.value = lessonData.value.timeSlot.court;
    lesson.value.startTime = lessonData.value.timeSlot.startTime;
    lesson.value.endTime = lessonData.value.timeSlot.endTime;
    lesson.value.date = format(new Date(lessonData.value.timeSlot.date), "yyyy-MM-dd");
    visible.value = true;
  } else {
    toast.add({
      severity: "error",
      summary: "課程資料錯誤",
      detail: "無法取得課程資料",
      life: 5000,
    });
  }
};

const reset = () => {
  lesson.value.title = "";
  lesson.value.content = "";
  lesson.value.startTime = "";
  lesson.value.endTime = "";
  isSubmitting.value = false;
};

defineExpose({
  reset: () => reset(),
  open: (id: string) => open(id),
});
</script>

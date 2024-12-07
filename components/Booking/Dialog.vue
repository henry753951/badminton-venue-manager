<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :style="{ width: '50rem' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap">{{
          type == "booking" ? "租借時間" : "課程時間"
        }}</span>
      </div>
    </template>

    <div class="mb-4">
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">日期</label>
        <span>{{ dialogData.date }}</span>
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
        <Dropdown
          placeholder="選擇開始時間"
          empty-message="無可用時間"
          class="flex-auto"
          v-model="selectedStartTime"
          :options="availableStartTimes"
          @change="validSelectedTime"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label
          for="endTime"
          class="font-semibold w-24"
        > 結束時間 </label>
        <Dropdown
          empty-message="無可用時間"
          placeholder="選擇結束時間"
          class="flex-auto"
          v-model="selectedEndTime"
          :options="availableEndTimes"
          :disabled="!selectedStartTime"
          @change="validSelectedTime"
        />
      </div>

      <!-- 自訂時間軸元件 -->
      <div class="my-6">
        <BookingTimeline
          :day-start-time="dayStartTime"
          :day-end-time="dayEndTime"
          :current-time-slots="dialogData.timeSlots"
          :preview-start-time="selectedStartTime"
          :preview-end-time="selectedEndTime"
        />
      </div>
    </div>
    <!-- 教練課程 only -->

    <template v-if="type == 'lesson'">
      <div class="flex gap-4 items-center mb-4">
        <label class="font-semibold w-24">人數</label>
        <InputNumber
          v-model="lesson.capacity"
          :min="1"
          :max="100"
          class="flex-auto"
        />
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
    </template>

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
            :label="type == 'booking' ? '確認租借' : '確認課程'"
            @click="type == 'booking' ? confirm.booking() : confirm.lessonCreate()"
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
const visible = defineModel<boolean>("visible");

const props = defineProps({
  id: {
    type: String,
    default: "",
    required: false,
  },
  courtData: {
    type: Object as PropType<{
      id: string;
      name: string;
      location: string;
    } | null>,
    required: true,
  },

  dayStartTime: {
    type: Number,
    default: 6,
  },
  dayEndTime: {
    type: Number,
    default: 23,
  },
  type: {
    type: String as PropType<"booking" | "lesson">,
    default: "booking",
  },
});

const emits = defineEmits(["onSubmit"]);
// Composables
const auth = useAuth();

// States
const isSubmitting = ref(false);
const dialogData = ref({
  date: "",
  timeSlots: null as { id: string; startTime: string; endTime: string; type: string }[] | null,
});

const lesson = ref({
  title: "",
  content: "",
  capacity: 5,
});

const availableStartTimes = computed(() => {
  const times = generateTimeOptions(props.dayStartTime, props.dayEndTime);
  if (dialogData.value.timeSlots) {
    const bookedTimes = dialogData.value.timeSlots
      .map((slot) => {
        return calculateTimeSlots(slot.startTime, slot.endTime);
      })
      .flat();
    return times.filter((time) => !bookedTimes.includes(time));
  }
  return times;
});

const availableEndTimes = computed(() => {
  if (!selectedStartTime.value) return [];
  let times = [...availableStartTimes.value];
  let endTimeIndex = times.length;
  if (dialogData.value.timeSlots) {
    const bookedStartTimes = dialogData.value.timeSlots.map((slot) => formatTime(slot.startTime));
    times.push(...bookedStartTimes);
    times = times.filter(
      (time) => timeStringToMinutes(time) > timeStringToMinutes(selectedStartTime.value || "00:00"),
    );
    times.sort((a, b) => timeStringToMinutes(a) - timeStringToMinutes(b));
    endTimeIndex = times.findIndex((time) => {
      return bookedStartTimes.includes(time);
    });
  }

  return endTimeIndex === -1 ? times : times.slice(0, endTimeIndex + 1);
});

const selectedStartTime = ref(null as string | null);
const selectedEndTime = ref(null as string | null);

const canSubmit = computed(() => {
  const timeValid =
    selectedStartTime.value &&
    selectedEndTime.value &&
    timeStringToMinutes(selectedStartTime.value) < timeStringToMinutes(selectedEndTime.value);
  const lessonValid = props.type === "lesson" ? lesson.value.title : true;
  return timeValid && lessonValid;
});

// Methods
const generateTimeOptions = (start: number, end: number) => {
  const [startHour, startMinute] = [start, 0];
  const [endHour, endMinute] = [end, 0];
  const times = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    if (hour === startHour && startMinute > 0) {
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    } else if (hour === endHour && endMinute === 0) {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      break;
    } else {
      times.push(`${hour.toString().padStart(2, "0")}:00`);
      times.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return times;
};

const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const validSelectedTime = () => {
  if (!selectedStartTime.value || !selectedEndTime.value) return;
  if (timeStringToMinutes(selectedStartTime.value) >= timeStringToMinutes(selectedEndTime.value)) {
    selectedEndTime.value = null;
  }
};

const confirm = {
  booking: async () => {
    if (!canSubmit.value) return;

    const bookingData = {
      date: dialogData.value.date.replaceAll("/", "-") || "",
      startTime: selectedStartTime.value || "",
      endTime: selectedEndTime.value || "",
      courtId: props.courtData?.id || "",
    };
    // Call API to confirm booking
    isSubmitting.value = true;
    const { status, data } = await useApi().createBooking(bookingData);
    if (data?.code === "success") {
      visible.value = false;
      reset();
      emits("onSubmit");
    } else {
      isSubmitting.value = false;
    }
  },
  lessonCreate: async () => {
    if (!canSubmit.value) return;

    const lessonData = {
      date: dialogData.value.date.replaceAll("/", "-") || "",
      startTime: selectedStartTime.value || "",
      endTime: selectedEndTime.value || "",
      courtId: props.courtData?.id || "",
      title: lesson.value.title,
      capacity: lesson.value.capacity,
      description: lesson.value.content,
    };
    // Call API to confirm lesson creation
    isSubmitting.value = true;
    const { status, data } = await useApi().createLesson(lessonData);
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
const open = (
  date: string,
  timeSlots: { id: string; startTime: string; endTime: string; type: string }[],
) => {
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

  visible.value = true;
  dialogData.value.date = date;
  dialogData.value.timeSlots = timeSlots;
  reset();
};

const reset = () => {
  selectedStartTime.value = null;
  selectedEndTime.value = null;
  isSubmitting.value = false;
};
defineExpose({
  reset: () => reset(),
  open: (
    date: string,
    timeSlots: { id: string; startTime: string; endTime: string; type: string }[],
  ) => open(date, timeSlots),
});
</script>

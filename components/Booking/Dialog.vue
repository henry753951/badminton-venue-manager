<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :style="{ width: '50rem' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap">租借時間</span>
      </div>
    </template>

    <div class="mb-4">
      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">日期</label>
        <span>{{ date }}</span>
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label class="font-semibold w-24">場地</label>
        <span class="flex-center gap-2">{{ courtData?.name }} <Badge severity="secondary">{{ courtData?.location }}</Badge></span>
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label
          for="startTime"
          class="font-semibold w-24"
        >開始時間</label>
        <Dropdown
          v-model="selectedStartTime"
          :options="availableStartTimes"
          placeholder="選擇開始時間"
          class="flex-auto"
          @change="validSelectedTime"
        />
      </div>

      <div class="flex items-center gap-4 mb-4">
        <label
          for="endTime"
          class="font-semibold w-24"
        >結束時間</label>
        <Dropdown
          v-model="selectedEndTime"
          :options="availableEndTimes"
          placeholder="選擇結束時間"
          class="flex-auto"
          :disabled="!selectedStartTime"
          @change="validSelectedTime"
        />
      </div>

      <!-- 自訂時間軸元件 -->
      <div class="my-6">
        <BookingTimeline
          :day-start-time="dayStartTime"
          :day-end-time="dayEndTime"
          :current-time-slots="currentTimeSlots"
          :preview-start-time="selectedStartTime"
          :preview-end-time="selectedEndTime"
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="取消"
        text
        severity="secondary"
        @click="visible = false"
      />
      <Button
        :loading="isSubmitting"
        label="確認租借"
        @click="confirmBooking"
        :disabled="!canSubmit || isSubmitting"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

const visible = defineModel<boolean>("visible");

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
  courtData: {
    type: Object as PropType<{
      id: string;
      name: string;
      location: string;
    } | null>,
    required: true,
  },
  currentTimeSlots: {
    type: Array as PropType<
      | {
          id: string;
          startTime: string;
          endTime: string;
          type: string;
        }[]
      | null
    >,
    default: null,
  },
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

const isSubmitting = ref(false);

// 產生時間清單（每30分鐘一個）
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

const availableStartTimes = computed(() => {
  const times = generateTimeOptions(props.dayStartTime, props.dayEndTime);
  if (props.currentTimeSlots) {
    const bookedTimes = props.currentTimeSlots
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
  let times = availableStartTimes.value;
  let endTimeIndex = times.length;
  if (props.currentTimeSlots) {
    const bookedStartTimes = props.currentTimeSlots.map((slot) => formatTime(slot.startTime));
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

const canSubmit = computed(
  () =>
    selectedStartTime.value &&
    selectedEndTime.value &&
    timeStringToMinutes(selectedStartTime.value) < timeStringToMinutes(selectedEndTime.value),
);

const timeStringToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const confirmBooking = async () => {
  if (!canSubmit.value) return;

  const bookingData = {
    date: props.date.replaceAll("/", "-") || "",
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
};

const validSelectedTime = () => {
  if (!selectedStartTime.value || !selectedEndTime.value) return;
  if (timeStringToMinutes(selectedStartTime.value) >= timeStringToMinutes(selectedEndTime.value)) {
    selectedEndTime.value = null;
  }
};

const reset = () => {
  selectedStartTime.value = null;
  selectedEndTime.value = null;
  isSubmitting.value = false;
};
defineExpose({
  reset: () => reset(),
});
</script>

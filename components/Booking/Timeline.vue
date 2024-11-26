<template>
  <div class="relative w-full h-10 bg-gray-100 rounded-lg dark:bg-dark-900">
    <!-- 已佔用時段 -->
    <template v-if="currentTimeSlots && currentTimeSlots.length">
      <div
        v-for="currentTimeSlot in props.currentTimeSlots"
        :key="currentTimeSlot.id"
        @mouseenter="
          hoverData = {
            startTime: formatTime(currentTimeSlot.startTime),
            endTime: formatTime(currentTimeSlot.endTime),
          }
        "
        @mouseleave="hoverData = null"
        class="absolute h-full bg-red-200/50 border-2 border-red-400 z-10 rounded-lg dark:bg-red-700"
        :style="{
          left: `${calculateSlotPosition(currentTimeSlot.startTime, currentTimeSlot.endTime).left}%`,
          width: `${calculateSlotPosition(currentTimeSlot.startTime, currentTimeSlot.endTime).width}%`,
        }"
        :title="`已租借: ${currentTimeSlot.startTime} - ${currentTimeSlot.endTime}`"
      />
    </template>

    <!-- 預覽租借時段 -->
    <div
      v-if="previewStartTime && previewEndTime"
      class="absolute h-full bg-green-200 border-2 border-green-400 z-9 rounded-lg preview-slot dark:bg-green-700"
      @mouseenter="hoverData = { startTime: previewStartTime, endTime: previewEndTime }"
      @mouseleave="hoverData = null"
      :style="{
        left: `${calculateSlotPosition(previewStartTime, previewEndTime).left}%`,
        width: `${calculateSlotPosition(previewStartTime, previewEndTime).width}%`,
      }"
      :title="`預覽租借: ${previewStartTime} - ${previewEndTime}`"
    />

    <!-- 時間標記 -->
    <div
      v-for="marker in timeMarkers"
      :key="marker.time"
      class="absolute text-xs text-gray-500 bottom-[-1.5rem] transform -translate-x-1/2"
      :style="getMarkerStyle(marker.position, marker.time)"
    >
      {{ formatTime(marker.time) }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface TimeSlot {
  startTime: string;
  endTime: string;
  id?: string;
}

interface RentalTimelineProps {
  dayStartTime?: number;
  dayEndTime?: number;
  currentTimeSlots?: TimeSlot[] | null;
  previewStartTime?: string | null;
  previewEndTime?: string | null;
}

const props = withDefaults(defineProps<RentalTimelineProps>(), {
  dayStartTime: 6,
  dayEndTime: 23,
  currentTimeSlots: null,
  previewStartTime: null,
  previewEndTime: null,
});

const timeUnit = 30; // minutes
const hoverData = ref<{ startTime: string; endTime: string } | null>(null);

// 轉換時間為分鐘
const timeToMinutes = (time: string | number): number => {
  const timeStr = typeof time === "number" ? `${time}:00` : time;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// 計算總時間長度
const dayStartMinutes = computed(() => timeToMinutes(props.dayStartTime));
const dayEndMinutes = computed(() => timeToMinutes(props.dayEndTime));
const totalDayMinutes = computed(() => dayEndMinutes.value - dayStartMinutes.value);

// 計算時段位置
const calculateSlotPosition = (startTime: string, endTime: string) => {
  const slotStartMinutes = timeToMinutes(startTime);
  const slotEndMinutes = timeToMinutes(endTime);

  const left = ((slotStartMinutes - dayStartMinutes.value) / totalDayMinutes.value) * 100;
  const width = ((slotEndMinutes - slotStartMinutes) / totalDayMinutes.value) * 100;

  return { left, width };
};

// 生成時間標記
const timeMarkers = computed(() => {
  const markers: { time: string; position: number }[] = [];

  for (let minute = dayStartMinutes.value; minute <= dayEndMinutes.value; minute += timeUnit) {
    const hours = Math.floor(minute / 60);
    const mins = minute % 60;
    const timeStr = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
    const position = ((minute - dayStartMinutes.value) / totalDayMinutes.value) * 100;

    markers.push({ time: timeStr, position });
  }

  return markers;
});

const getMarkerStyle = (position: number, time: string) => {
  let show = true;
  let tooClose = false;
  if (hoverData.value?.startTime && hoverData.value?.endTime) {
    const hoverStartTime = timeToMinutes(hoverData.value.startTime);
    const hoverEndTime = timeToMinutes(hoverData.value.endTime);

    if (hoverEndTime - hoverStartTime < timeUnit * 3) {
      tooClose = true;
    }
  }
  if (!(time == hoverData.value?.startTime || time == hoverData.value?.endTime)) {
    show = false;
  }

  return {
    display: show ? "block" : "none",
    paddingRight: tooClose && time == hoverData.value?.startTime ? "1.5rem" : "0",
    paddingLeft: tooClose && time == hoverData.value?.endTime ? "1.5rem" : "0",
    left: `${position}%`,
  };
};
</script>

<style scoped>
.preview-slot {
  transition: all 0.2s;
}
.preview-slot:hover {
  box-shadow: 0 0 0 3px rgba(0, 255, 0, 0.5);
}
</style>

<template>
  <div class="relative top-10px">
    <div
      class="absolute w-full border-t-2 border-red-500 z-10"
      :style="currentTimeLineStyle"
    ></div>

    <div
      class="grid"
      :style="{
        gridTemplateColumns: `repeat(${weekSchedule.currentView.length}, 1fr)`,
        height: `${options.columnHeight * 2 * (options.endHour - options.startHour)}px`,
      }"
    >
      <div
        v-for="day in weekSchedule.currentView"
        :key="day.date"
        @click="emits('clickDate', { date: day.date, timeSlots: day.timeSlots })"
        class="relative cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-800"
        :class="{
          'border-r border-gray-200 dark:border-dark-600':
            !breakpoints.smallerOrEqual('md').value && day.date !== day.date,
        }"
      >
        <div
          v-for="slot in day.timeSlots"
          :key="slot.id"
          class="absolute w-full px-1"
          :style="getSlotStyle(slot)"
          @click="
            emits('clickTimeSlot', {
              id: slot.id,
              currentDayData: {
                date: day.date,
                timeSlots: day.timeSlots,
              },
            })
          "
        >
          <div
            class="h-full p-1 text-xs rounded overflow-hidden hover:overflow-visible flex-center flex-col gap-1"
            :class="{
              'bg-blue-100 dark:bg-dark-200': slot.type === 'normal',
              'bg-yellow-200 dark:bg-orange-300': slot.type === 'lesson',
            }"
          >
            <p>
              {{ formatTime(slot.startTime) }} -
              {{ formatTime(slot.endTime) }}
            </p>
            <Badge>
              {{ slot.type === "normal" ? "已被預約" : "教練課程" }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import { formatTime } from "@/utils/validators";

const props = defineProps({
  weekSchedule: {
    type: Object as () => {
      origin: Array<{
        date: string;
        weekDay: string;
        timeSlots: Array<{
          id: string;
          type: string;
          startTime: string;
          endTime: string;
        }>;
      }>;
      currentView: Array<{
        date: string;
        weekDay: string;
        timeSlots: Array<{
          id: string;
          type: string;
          startTime: string;
          endTime: string;
        }>;
      }>;
    },
    required: true,
  },
  options: {
    type: Object as () => {
      startHour: number;
      endHour: number;
      columnHeight: number;
      mobile: {
        offsetOfWeek: number;
      };
    },
    required: true,
  },
});
const emits = defineEmits<{
  (
    e: "clickDate",
    data: {
      date: string;
      timeSlots: Array<{
        id: string;
        type: string;
        startTime: string;
        endTime: string;
      }>;
    },
  ): void;
  (
    e: "clickTimeSlot",
    data: {
      id: string;
      currentDayData: {
        date: string;
        timeSlots: Array<{
          id: string;
          type: string;
          startTime: string;
          endTime: string;
        }>;
      };
    },
  ): void;
}>();

const currentTime = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");
const breakpoints = useBreakpoints(breakpointsTailwind);

const getSlotStyle = (slot: { startTime: string; endTime: string }) => {
  const getMinutesFromTimeString = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = getMinutesFromTimeString(slot.startTime);
  const endMinutes = getMinutesFromTimeString(slot.endTime);
  const duration = endMinutes - startMinutes;

  const slotStartHour = Math.floor(startMinutes / 60);
  const slotStartMinute = startMinutes % 60;

  if (slotStartHour < props.options.startHour || slotStartHour >= props.options.endHour)
    return { display: "none" };

  const top =
    (((slotStartHour - props.options.startHour) * 60 + slotStartMinute) / 30) *
    props.options.columnHeight;
  const height = (duration / 30) * props.options.columnHeight;

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
};

const currentTimeLineStyle = computed(() => {
  const now = new Date(currentTime.value);
  const seconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds() -
    props.options.startHour * 3600;

  const percentage = (seconds / ((props.options.endHour - props.options.startHour) * 3600)) * 100;

  const top = percentage;
  return {
    top: `${Math.round(top * 100) / 100}%`,
  };
});
</script>

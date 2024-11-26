<template>
  <div
    v-if="!breakpoints.smallerOrEqual('md').value"
    class="flex border-b h-70px"
  >
    <div
      v-for="day in weekSchedule.origin"
      :key="day.date"
      class="flex-1 p-2 text-center min-w-[100px]"
    >
      <div class="font-bold">
        {{ day.weekDay }}
      </div>
      <div
        class="text-sm pb-1"
        :class="{
          'today-highlight': todayDate === day.date,
        }"
      >
        {{ day.date.slice(5) }}
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex justify-between items-center w-full gap-1 overflow-x-auto"
  >
    <div
      v-for="(day, index) in weekSchedule.origin"
      :key="day.date"
      :class="{
        'bg-black dark:bg-white text-white dark:text-black': offset === index,
      }"
      class="text-center p-3 rounded-full overflow-hidden w-50px min-w-50px h-50px cursor-pointer"
      @click="$emit('update:offset', index)"
    >
      <div class="font-bold text-0.6rem">
        {{ day.weekDay }}
      </div>
      <div
        class="text-0.4rem"
        :class="{
          'today-highlight': todayDate === day.date,
        }"
      >
        {{ day.date.slice(5) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { breakpointsTailwind } from "@vueuse/core";
import { format } from "date-fns";

const props = defineProps({
  weekSchedule: {
    type: Object as () => {
      origin: Array<{
        date: string;
        weekDay: string;
        timeSlots: Array<{
          id: string;
          startTime: string;
          endTime: string;
        }>;
      }>;
      currentView: Array<{
        date: string;
        weekDay: string;
        timeSlots: Array<{
          id: string;
          startTime: string;
          endTime: string;
        }>;
      }>;
    },
    required: true,
  },
  offset: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:offset"]);

// Composables
const breakpoints = useBreakpoints(breakpointsTailwind);

// Computed Properties
const todayDate = computed(() => {
  return format(new Date(), "yyyy/MM/dd");
});
</script>

<style scoped>
.today-highlight {
  position: relative;
}
.today-highlight::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 3px;
  background-color: #f00;
  border-radius: 50%;
}
</style>

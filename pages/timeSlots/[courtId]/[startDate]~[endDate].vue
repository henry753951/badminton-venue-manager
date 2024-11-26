<template>
  <div class="container mx-auto p-4 h-fit">
    <div class="flex-center">
      <h1 class="text-2xl font-bold">
        租借系統
      </h1>
    </div>
    <div class="flex justify-between items-center mb-4">
      <Button
        size="small"
        :text="breakpoints.smallerOrEqual('md').value"
        @click="changeWeek(-1)"
      >
        <Icon
          name="mdi-chevron-left"
          class="md:hidden"
        />
        <div class="md:block hidden">
          上一週
        </div>
      </Button>
      <div class="flex-grow px-3 flex-center min-w-0">
        <div
          v-if="!breakpoints.smallerOrEqual('md').value"
          class="text-xl font-bold"
        >
          {{ dateRangeDisplay }}
        </div>
        <div
          v-else
          class="flex justify-between items-center w-full gap-1 overflow-x-auto"
        >
          <div
            v-for="(day, index) in weekSchedule.origin"
            :key="day.date"
            :class="{
              'bg-black dark:bg-white text-white dark:text-black':
                options.mobile.offsetOfWeek === index,
            }"
            class="text-center p-3 rounded-full overflow-hidden w-50px min-w-50px h-50px cursor-pointer"
            @click="options.mobile.offsetOfWeek = index"
          >
            <div class="font-bold text-0.6rem">
              {{ day.weekDay }}
            </div>
            <div class="text-0.4rem">
              {{ day.date }}
            </div>
          </div>
        </div>
      </div>
      <Button
        size="small"
        :text="breakpoints.smallerOrEqual('md').value"
        @click="changeWeek(1)"
      >
        <div class="md:block hidden">
          下一週
        </div>
        <Icon
          name="mdi-chevron-right"
          class="md:hidden"
        />
      </Button>
    </div>

    <div class="flex relative">
      <!-- Left Time labels -->
      <div class="w-16 relative md:top-60px">
        <div
          v-for="hour in timeLabels"
          :key="hour"
          class="absolute text-sm text-gray-600 right-0 pr-2"
          :style="{
            top: `${(Number(hour) - options.startHour) * options.columnHeight * 2}px`,
          }"
        >
          {{ hour }}:00
        </div>
      </div>

      <!-- Schedule grid -->
      <div class="flex-1">
        <!-- Column headers -->
        <div
          v-if="!breakpoints.smallerOrEqual('md').value"
          class="flex border-b h-60px"
        >
          <div
            v-for="day in weekSchedule.currentView"
            :key="day.date"
            class="flex-1 p-2 text-center min-w-[100px]"
          >
            <div class="font-bold">
              {{ day.weekDay }}
            </div>
            <div class="text-sm">
              {{ day.date }}
            </div>
          </div>
        </div>

        <!-- Time slots grid -->
        <div class="relative top-10px">
          <!-- Current time indicator -->
          <div
            class="absolute w-full border-t-2 border-red-500 z-10"
            :style="currentTimeLineStyle"
          ></div>

          <!-- Time slots -->
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
              class="relative cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-800"
              :class="{
                'border-r border-gray-200 dark:border-dark-600':
                  !breakpoints.smallerOrEqual('md').value &&
                  day.date !== weekSchedule.currentView[weekSchedule.currentView.length - 1].date,
              }"
            >
              <div
                v-for="slot in day.timeSlots"
                :key="slot.id"
                class="absolute w-full px-1"
                :style="getSlotStyle(slot)"
              >
                <div
                  class="h-full p-1 text-xs rounded overflow-hidden bg-blue-100 dark:bg-dark-200"
                >
                  {{ formatTime(slot.startTime) }} -
                  {{ formatTime(slot.endTime) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Time labels -->
      <div class="w-16 relative md:top-60px">
        <div
          v-for="hour in timeLabels"
          :key="hour"
          class="absolute text-sm text-gray-600 left-0 pl-2"
          :style="{
            top: `${(Number(hour) - options.startHour) * options.columnHeight * 2}px`,
          }"
        >
          {{ hour }}:00
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import {
  format,
  parse,
  addWeeks,
  startOfWeek,
  endOfWeek,
  addDays,
  isWithinInterval,
} from "date-fns";
import { breakpointsTailwind, useBreakpoints, useDateFormat, useNow } from "@vueuse/core";

// Page Meta
definePageMeta({
  name: "timeSlots-courtId-startDate-endDate",
});

// Composables
const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const breakpoints = useBreakpoints(breakpointsTailwind);
const currentTime = useDateFormat(useNow(), "YYYY-MM-DD HH:mm:ss");

// State
const options = ref({
  startHour: 6,
  endHour: 23,
  mobile: {
    offsetOfWeek: 0,
  },
  columnHeight: 30,
});

const currentStartDate = ref(
  startOfWeek(new Date(route.params.startDate as string), { weekStartsOn: 0 }),
);
const currentEndDate = ref(
  endOfWeek(new Date(route.params.endDate as string), { weekStartsOn: 0 }),
);

const { courtData } = await useApi().fetchCourt(route.params.courtId as string, false);

const { scheduleData } = await useApi().fetchSchedule(
  route.params.courtId as string,
  currentStartDate.value,
  currentEndDate.value,
);

// Computed Properties
const weekViewPortOptions = computed(() => {
  if (breakpoints.smallerOrEqual("md").value) {
    return {
      visibleStartDayOfWeek: options.value.mobile.offsetOfWeek,
      visibleEndDayOfWeek: options.value.mobile.offsetOfWeek,
    };
  } else {
    return {
      visibleStartDayOfWeek: 0,
      visibleEndDayOfWeek: 6,
    };
  }
});

const currentTimeLineStyle = computed(() => {
  const now = new Date(currentTime.value);
  const seconds =
    now.getHours() * 3600 +
    now.getMinutes() * 60 +
    now.getSeconds() -
    options.value.startHour * 3600;

  const percentage = (seconds / ((options.value.endHour - options.value.startHour) * 3600)) * 100;

  const top = percentage;
  return {
    top: `${Math.round(top * 100) / 100}%`,
  };
});

const timeLabels = computed(() =>
  Array.from({ length: options.value.endHour - options.value.startHour + 1 }, (_, i) =>
    (options.value.startHour + i).toString().padStart(2, "0"),
  ),
);
const isCurrentWeek = computed(() => {
  const now = new Date(currentTime.value);
  return isWithinInterval(now, {
    start: currentStartDate.value,
    end: currentEndDate.value,
  });
});

const dateRangeDisplay = computed(
  () => `${format(currentStartDate.value, "MM/dd")} - ${format(currentEndDate.value, "MM/dd")}`,
);

const weekSchedule = computed(() => {
  return {
    origin: Array.from(
      {
        length: 7,
      },
      (_, index) => {
        const currentDate = addDays(currentStartDate.value, index);
        const formattedDate = format(currentDate, "yyyy-MM-dd");
        const daySchedule = scheduleData.value?.find((item) => item.date === formattedDate);

        return {
          date: format(currentDate, "MM/dd"),
          weekDay: format(currentDate, "EEE"),
          timeSlots: daySchedule ? daySchedule.timeSlots : [],
        };
      },
    ),
    currentView: Array.from(
      {
        length:
          weekViewPortOptions.value.visibleEndDayOfWeek -
          weekViewPortOptions.value.visibleStartDayOfWeek +
          1,
      },
      (_, index) => {
        const currentDate = addDays(
          currentStartDate.value,
          index + weekViewPortOptions.value.visibleStartDayOfWeek,
        );
        const formattedDate = format(currentDate, "yyyy-MM-dd");
        const daySchedule = scheduleData.value?.find((item) => item.date === formattedDate);

        return {
          date: format(currentDate, "MM/dd"),
          weekDay: format(currentDate, "EEE"),
          timeSlots: daySchedule ? daySchedule.timeSlots : [],
        };
      },
    ),
  };
});

// Methods
const getMinutesFromTimeString = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
};

const getSlotStyle = (slot: { startTime: string; endTime: string }) => {
  const startMinutes = getMinutesFromTimeString(slot.startTime);
  const endMinutes = getMinutesFromTimeString(slot.endTime);
  const duration = endMinutes - startMinutes;

  const slotStartHour = Math.floor(startMinutes / 60);
  const slotStartMinute = startMinutes % 60;

  if (slotStartHour < options.value.startHour || slotStartHour >= options.value.endHour)
    return { display: "none" };

  const top =
    (((slotStartHour - options.value.startHour) * 60 + slotStartMinute) / 30) *
    options.value.columnHeight;
  const height = (duration / 30) * options.value.columnHeight;

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
};

const changeWeek = (direction: number) => {
  currentStartDate.value = addWeeks(currentStartDate.value, direction);
  currentEndDate.value = addWeeks(currentEndDate.value, direction);
  updateRouteParams();
};

const updateRouteParams = () => {
  navigateTo({
    name: "timeSlots-courtId-startDate-endDate",
    params: {
      courtId: route.params.courtId,
      startDate: format(currentStartDate.value, "yyyy-MM-dd"),
      endDate: format(currentEndDate.value, "yyyy-MM-dd"),
    },
  });
};

const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

// Lifecycle Hooks
onMounted(async () => {
  breadcrumbStore.breadcrumbs = [
    {
      label: "首頁",
      route: { name: "home" },
    },
    {
      label: "場地租借",
      route: { name: "timeSlots-courts" },
    },
    {
      label: `場地 ${courtData.value?.name}`,
      route: undefined,
    },
  ];
});
</script>

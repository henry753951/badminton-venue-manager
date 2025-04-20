<template>
  <div class="container mx-auto p-4 h-fit">
    <div class="flex-center py-2">
      <h1 class="text-2xl font-bold flex-center gap-3">
        <p>{{ courtData?.name }}</p>
        <Badge>
          {{ courtData?.location }}
        </Badge>
      </h1>
    </div>

    <WeekChange
      :current-date="dateRangeDisplay"
      @on-prev="changeWeek(-1)"
      @on-next="changeWeek(1)"
    />

    <div class="flex relative">
      <!-- Left Time labels -->
      <div class="w-16 relative top-70px">
        <TimeLabels
          :time-labels="timeLabels"
          :start-hour="options.startHour"
          :column-height="options.columnHeight"
          align="right"
        />
      </div>

      <div class="flex-1">
        <ViewWeek
          :week-schedule="weekSchedule"
          v-model:offset="options.mobile.offsetOfWeek"
        />
        <ViewTimeSlots
          :week-schedule="weekSchedule"
          :options="options"
          @click-time-slot="openReviewModal"
        />
      </div>

      <!-- Right Time labels -->
      <div class="w-16 relative top-70px">
        <TimeLabels
          :time-labels="timeLabels"
          :start-hour="options.startHour"
          :column-height="options.columnHeight"
          align="left"
        />
      </div>
    </div>
    <BookingDialog
      ref="bookingDialogRef"
      review
      :court-data="courtData"
      :day-end-time="options.endHour"
      :day-start-time="options.startHour"
      @on-submit="refetchSchedule"
      @on-delete="deleteTimeSlot"
    />
  </div>
</template>

<script setup lang="ts">
import WeekChange from "~/components/TimeSlots/WeekChange.vue";
import ViewWeek from "~/components/TimeSlots/ViewWeek.vue";
import ViewTimeSlots from "~/components/TimeSlots/ViewTimeSlots.vue";
import TimeLabels from "~/components/TimeSlots/TimeLabels.vue";
import { format, addWeeks, startOfWeek, endOfWeek, addDays } from "date-fns";
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import type { BookingDialog } from "#build/components";

// Page Meta
definePageMeta({
  name: "admin-timeSlots-courtId-startDate-endDate",
});

// Composables
const route = useRoute();
const breadcrumbStore = useBreadcrumbStore();
const breakpoints = useBreakpoints(breakpointsTailwind);

// State
const options = ref({
  startHour: 0,
  endHour: 24,
  mobile: {
    offsetOfWeek: 0,
  },
  columnHeight: 20,
});
const currentStartDate = ref(
  startOfWeek(new Date(route.params.startDate as string), { weekStartsOn: 0 }),
);
const currentEndDate = ref(
  endOfWeek(new Date(route.params.endDate as string), { weekStartsOn: 0 }),
);

const bookingDialogRef = ref<InstanceType<typeof BookingDialog> | null>(null);

// Data Fetching
const { courtData } = await useApi().fetchCourt(ref(route.params.courtId as string));
const { scheduleData, refresh: refetchSchedule } = await useApi().fetchSchedule(
  ref(route.params.courtId as string),
  currentStartDate,
  currentEndDate,
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

const timeLabels = computed(() =>
  Array.from({ length: options.value.endHour - options.value.startHour + 1 }, (_, i) =>
    (options.value.startHour + i).toString().padStart(2, "0"),
  ),
);

const dateRangeDisplay = computed(
  () =>
    `${format(currentStartDate.value, "yyyy/MM/dd")} - ${format(currentEndDate.value, "yyyy/MM/dd")}`,
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
          date: format(currentDate, "yyyy/MM/dd"),
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
          date: format(currentDate, "yyyy/MM/dd"),
          weekDay: format(currentDate, "EEE"),
          timeSlots: daySchedule ? daySchedule.timeSlots : [],
        };
      },
    ),
  };
});

// Methods
const changeWeek = (direction: number) => {
  currentStartDate.value = addWeeks(currentStartDate.value, direction);
  currentEndDate.value = addWeeks(currentEndDate.value, direction);
  updateRouteParams();
};

const updateRouteParams = () => {
  navigateTo({
    name: "admin-timeSlots-courtId-startDate-endDate",
    params: {
      courtId: route.params.courtId,
      startDate: format(currentStartDate.value, "yyyy-MM-dd"),
      endDate: format(currentEndDate.value, "yyyy-MM-dd"),
    },
  });
};

const openReviewModal = (arg: {
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
}) => {
  console.log(arg);
  bookingDialogRef.value?.openExisting(arg.id, arg.currentDayData.timeSlots);
};

const deleteTimeSlot = async (timeSlotId: string) => {
  // Call API to delete time slot
  // After deletion, refresh the schedule data
  await useApi().deleteTimeSlot(timeSlotId);
  refetchSchedule();
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
      label: courtData.value?.name || "場地時段",
      route: undefined,
    },
  ];
});
</script>

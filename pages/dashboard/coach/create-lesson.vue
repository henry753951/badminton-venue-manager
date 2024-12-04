<template>
  <div class="container mx-auto p-4 h-fit">
    <WeekChange
      :current-date="dateRangeDisplay"
      @on-prev="changeWeek(-1)"
      @on-next="changeWeek(1)"
    >
      <div
        v-if="courtList"
        class="w-full md:w-1/3"
      >
        <Select
          v-model="currentCourtId"
          :options="courtList"
          option-label="name"
          option-value="id"
          placeholder="請選擇球場"
          class="w-full"
          @change="
            refetchSchedule();
            params.courtId = currentCourtId;
            scheduleData = null;
          "
        />
      </div>
    </WeekChange>
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
          @click-date="bookingLessonDialogRef?.open($event.date, $event.timeSlots)"
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
      v-if="currentCourt"
      ref="bookingLessonDialogRef"
      type="lesson"
      :court-data="currentCourt"
      :day-end-time="options.endHour"
      :day-start-time="options.startHour"
      @on-submit="refetchSchedule"
    />
  </div>
</template>

<script lang="ts" setup>
import WeekChange from "~/components/TimeSlots/WeekChange.vue";
import ViewWeek from "~/components/TimeSlots/ViewWeek.vue";
import ViewTimeSlots from "~/components/TimeSlots/ViewTimeSlots.vue";
import TimeLabels from "~/components/TimeSlots/TimeLabels.vue";
import { breakpointsTailwind } from "@vueuse/core";
import { format, addWeeks, startOfWeek, endOfWeek, addDays } from "date-fns";
import type { BookingDialog } from "#build/components";
definePageMeta({
  name: "dashboard-coach-createLesson",
});
// Composables
const route = useRoute();
const breakpoints = useBreakpoints(breakpointsTailwind);
const params = useUrlSearchParams("history");

// State
const options = ref({
  startHour: 0,
  endHour: 24,
  mobile: {
    offsetOfWeek: 0,
  },
  columnHeight: 30,
});

const currentStartDate = ref(
  startOfWeek(params.startDate ? new Date(params.startDate as string) : new Date(), {
    weekStartsOn: 0,
  }),
);

const currentEndDate = ref(
  endOfWeek(params.endDate ? new Date(params.endDate as string) : new Date(), { weekStartsOn: 0 }),
);

const { courtsData: courtList } = await useApi().fetchCourts();

const currentCourtId = ref((params.courtId as string) ?? "");

const bookingLessonDialogRef = ref<InstanceType<typeof BookingDialog> | null>(null);

// Data Fetching
const {
  scheduleData,
  refresh: refetchSchedule,
  status,
} = await useApi().fetchSchedule(currentCourtId, currentStartDate, currentEndDate);

// Computed Properties

const currentCourt = computed(() => {
  return courtList.value?.find((court) => court.id === currentCourtId.value);
});

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
  params.startDate = format(currentStartDate.value, "yyyy-MM-dd");
  params.endDate = format(currentEndDate.value, "yyyy-MM-dd");
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
      label: "建立課程",
      route: undefined,
    },
  ];
});
</script>

<style></style>
